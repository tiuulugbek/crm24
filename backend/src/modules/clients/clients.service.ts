import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../../entities/client.entity';
import { ClientChannel } from '../../entities/client-channel.entity';
import { ClientStatusHistory } from '../../entities/index';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(ClientChannel)
    private clientChannelRepository: Repository<ClientChannel>,
    @InjectRepository(ClientStatusHistory)
    private statusHistoryRepository: Repository<ClientStatusHistory>,
  ) {}

  async findAll(filters?: any) {
    const query = this.clientRepository.createQueryBuilder('client')
      .leftJoinAndSelect('client.branch', 'branch')
      .leftJoinAndSelect('client.channels', 'channels');

    if (filters?.status) {
      query.andWhere('client.status = :status', { status: filters.status });
    }

    if (filters?.branchId) {
      query.andWhere('client.branch_id = :branchId', { branchId: filters.branchId });
    }

    if (filters?.source) {
      query.andWhere('client.source = :source', { source: filters.source });
    }

    if (filters?.search) {
      query.andWhere('(client.name ILIKE :search OR client.phone_number ILIKE :search)', {
        search: `%${filters.search}%`,
      });
    }

    query.orderBy('client.created_at', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string) {
    return await this.clientRepository.findOne({
      where: { id },
      relations: ['branch', 'channels', 'messages', 'comments'],
    });
  }

  async create(createClientDto: any) {
    const client = this.clientRepository.create(createClientDto);
    return await this.clientRepository.save(client);
  }

  async update(id: string, updateClientDto: any) {
    await this.clientRepository.update(id, updateClientDto);
    return await this.findOne(id);
  }

  async updateStatus(id: string, newStatus: string, userId: string) {
    const client = await this.findOne(id);

    if (!client) {
      throw new Error('Client not found');
    }

    const oldStatus = client.status;

    const lastStatusChange = await this.statusHistoryRepository.findOne({
      where: { clientId: id },
      order: { createdAt: 'DESC' },
    });

    let durationSeconds = 0;
    if (lastStatusChange) {
      durationSeconds = Math.floor((Date.now() - lastStatusChange.createdAt.getTime()) / 1000);
    }

    const statusHistory = this.statusHistoryRepository.create({
      clientId: id,
      fromStatus: oldStatus,
      toStatus: newStatus,
      changedBy: userId,
      durationSeconds,
    });

    await this.statusHistoryRepository.save(statusHistory);
    await this.clientRepository.update(id, { status: newStatus });

    return await this.findOne(id);
  }

  async mergeClients(primaryClientId: string, secondaryClientId: string) {
    const primaryClient = await this.findOne(primaryClientId);
    const secondaryClient = await this.findOne(secondaryClientId);

    if (!primaryClient || !secondaryClient) {
      throw new Error('Client not found');
    }

    if (!primaryClient.phoneNumber && secondaryClient.phoneNumber) {
      await this.clientRepository.update(primaryClientId, {
        phoneNumber: secondaryClient.phoneNumber,
      });
    }

    await this.clientChannelRepository.update(
      { clientId: secondaryClientId },
      { clientId: primaryClientId },
    );

    await this.clientRepository.update(primaryClientId, {
      mergedFrom: [...(primaryClient.mergedFrom || []), secondaryClientId],
    });

    await this.clientRepository.delete(secondaryClientId);

    return await this.findOne(primaryClientId);
  }

  async getStatusHistory(clientId: string) {
    return await this.statusHistoryRepository.find({
      where: { clientId },
      relations: ['changedByUser'],
      order: { createdAt: 'DESC' },
    });
  }
}
