import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { SmsLog, Integration } from '../../entities/index';
import { Client } from '../../entities/client.entity';
import { Branch } from '../../entities/branch.entity';

const ESKIZ_API_URL = 'https://notify.eskiz.uz/api';

@Injectable()
export class SmsService {
  constructor(
    @InjectRepository(SmsLog)
    private smsLogRepository: Repository<SmsLog>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    @InjectRepository(Integration)
    private integrationRepository: Repository<Integration>,
  ) {}

  /** Integratsiyadan faol Eskiz SMS ulanishini topadi */
  private async getEskizConfig(): Promise<{ email: string; password: string; from: string }> {
    const integration = await this.integrationRepository.findOne({
      where: { platform: 'eskiz_sms', isActive: true },
      order: { createdAt: 'DESC' },
    });
    if (!integration?.config?.email || !integration.config?.password) {
      throw new BadRequestException(
        'SMS yuborish uchun Integratsiyalar sahifasida Eskiz.uz SMS ulanishini sozlang (email, parol, yuboruvchi nomi).',
      );
    }
    return {
      email: integration.config.email,
      password: integration.config.password,
      from: integration.config.from || 'Acoustic',
    };
  }

  private async getEskizToken(): Promise<string> {
    const { email, password } = await this.getEskizConfig();
    const response = await axios.post(`${ESKIZ_API_URL}/auth/login`, { email, password });
    const token = response.data?.data?.token;
    if (!token) throw new BadRequestException('Eskiz.uz ga kirish amalga oshmadi');
    return token;
  }

  async sendSms(data: {
    clientId: string;
    branchId: string;
    phoneNumber: string;
    userId: string;
  }) {
    try {
      const client = await this.clientRepository.findOne({
        where: { id: data.clientId },
      });

      const branch = await this.branchRepository.findOne({
        where: { id: data.branchId },
      });

      if (!client || !branch) {
        throw new Error('Client or branch not found');
      }

      // Generate SMS content with branch info (shablon yoki default)
      const smsContent = this.generateSmsContent(branch, client);

      const { from } = await this.getEskizConfig();
      const token = await this.getEskizToken();

      // Send via Eskiz.uz API (https://documenter.getpostman.com/view/663428/RzfmES4z)
      const response = await axios.post(
        `${ESKIZ_API_URL}/message/sms/send`,
        {
          mobile_phone: data.phoneNumber.replace(/\D/g, '').replace(/^8/, '998'),
          message: smsContent,
          from,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Log SMS
      const smsLog = this.smsLogRepository.create({
        clientId: data.clientId,
        branchId: data.branchId,
        phoneNumber: data.phoneNumber,
        content: smsContent,
        sentBy: data.userId,
        provider: 'eskiz',
        providerMessageId: response.data.id,
        status: 'sent',
        sentAt: new Date(),
      });

      await this.smsLogRepository.save(smsLog);

      return { success: true, messageId: response.data.id };
    } catch (error) {
      console.error('Error sending SMS:', error);

      // Log failed SMS
      const smsLog = this.smsLogRepository.create({
        clientId: data.clientId,
        branchId: data.branchId,
        phoneNumber: data.phoneNumber,
        content: '',
        sentBy: data.userId,
        provider: 'eskiz',
        status: 'failed',
        errorMessage: error.message,
      });

      await this.smsLogRepository.save(smsLog);

      throw error;
    }
  }

  private generateSmsContent(branch: Branch, client: Client): string {
    const workingHours =
      branch.workingHours && typeof branch.workingHours === 'object'
        ? Object.entries(branch.workingHours)
            .map(([day, hours]) => `${day}: ${hours}`)
            .join(', ')
        : '';

    const vars: Record<string, string> = {
      client_name: client.name || 'Mijoz',
      branch_name: branch.name || '',
      branch_address: branch.address || '',
      branch_phone: branch.phone || '',
      working_hours: workingHours,
    };

    const template = branch.smsTemplate?.trim();
    if (template) {
      return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
    }

    return `Assalomu alaykum ${vars.client_name}! 

Acoustic слуховые центры
📍 ${vars.branch_name}
${vars.branch_address}
📞 ${vars.branch_phone}

⏰ Ish vaqti: ${vars.working_hours}

Bepul tekshiruv uchun qo'ng'iroq qiling!`;
  }

  async getSmsHistory(clientId?: string, branchId?: string) {
    const query = this.smsLogRepository.createQueryBuilder('sms')
      .leftJoinAndSelect('sms.client', 'client')
      .leftJoinAndSelect('sms.branch', 'branch')
      .leftJoinAndSelect('sms.sentByUser', 'user');

    if (clientId) {
      query.andWhere('sms.client_id = :clientId', { clientId });
    }

    if (branchId) {
      query.andWhere('sms.branch_id = :branchId', { branchId });
    }

    query.orderBy('sms.created_at', 'DESC');

    return await query.getMany();
  }
}
