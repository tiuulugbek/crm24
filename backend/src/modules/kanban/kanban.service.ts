import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KanbanStatus } from '../../entities';

@Injectable()
export class KanbanService {
  constructor(
    @InjectRepository(KanbanStatus)
    private statusRepository: Repository<KanbanStatus>,
  ) {}

  async getStatuses(): Promise<KanbanStatus[]> {
    return this.statusRepository.find({
      where: { isActive: true },
      order: { position: 'ASC' },
    });
  }

  async createStatus(dto: { name: string; slug: string; color: string; position: number }) {
    const status = this.statusRepository.create(dto);
    return this.statusRepository.save(status);
  }

  async updateStatus(id: string, dto: Partial<KanbanStatus>) {
    await this.statusRepository.update(id, dto as any);
    return this.statusRepository.findOne({ where: { id } });
  }

  async deleteStatus(id: string): Promise<void> {
    await this.statusRepository.delete(id);
  }

  async reorderStatuses(statusIds: string[]): Promise<KanbanStatus[]> {
    for (let i = 0; i < statusIds.length; i++) {
      await this.statusRepository.update(statusIds[i], { position: i });
    }
    return this.getStatuses();
  }
}
