import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../../entities/branch.entity';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
  ) {}

  async findAll(): Promise<Branch[]> {
    return this.branchRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Branch> {
    const branch = await this.branchRepository.findOne({ where: { id } });
    if (!branch) throw new Error('Filial topilmadi');
    return branch;
  }

  async create(dto: Partial<Branch>): Promise<Branch> {
    const branch = this.branchRepository.create({
      ...dto,
      workingHours: (dto.workingHours as Record<string, string>) || {},
    });
    return this.branchRepository.save(branch);
  }

  async update(id: string, dto: Partial<Branch>): Promise<Branch> {
    await this.branchRepository.update(id, dto as any);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.branchRepository.delete(id);
  }
}
