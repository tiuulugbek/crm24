import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async findAll(): Promise<Partial<User>[]> {
    const users = await this.userRepository.find({
      relations: ['role', 'branch'],
      order: { createdAt: 'DESC' },
    });
    return users.map((u) => this.omitPassword(u));
  }

  async findOne(id: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role', 'branch'],
    });
    if (!user) throw new Error('Foydalanuvchi topilmadi');
    return this.omitPassword(user);
  }

  async create(dto: { email: string; password: string; firstName: string; lastName: string; roleId: string; branchId?: string; phone?: string }) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new Error('Bu email allaqachon mavjud');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      ...dto,
      passwordHash,
    });
    const saved = await this.userRepository.save(user);
    return this.omitPassword(saved as User);
  }

  async update(id: string, dto: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'roleId' | 'branchId' | 'isActive'>>) {
    if ((dto as any).password) {
      (dto as any).passwordHash = await bcrypt.hash((dto as any).password, 10);
      delete (dto as any).password;
    }
    await this.userRepository.update(id, dto as any);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  /** Super admin, Admin, Call center — CRM asosan call center uchun; call_center yoq bo‘lsa community_manager ishlatiladi */
  async getRoles(): Promise<{ id: string; name: string; description: string | null }[]> {
    const roles = await this.roleRepository.find({ order: { name: 'ASC' } });
    const main = ['super_admin', 'admin', 'call_center', 'community_manager'];
    let filtered = roles.filter((r) => main.includes(r.name));
    if (filtered.some((r) => r.name === 'call_center'))
      filtered = filtered.filter((r) => r.name !== 'community_manager');
    else
      filtered = filtered.filter((r) => r.name !== 'call_center');
    if (filtered.length === 0) return roles.map((r) => ({ id: r.id, name: r.name, description: r.description }));
    return filtered.map((r) => ({ id: r.id, name: r.name, description: r.description }));
  }

  /** Barcha ruxsatlar ro‘yxati — faqat super_admin uchun */
  async getAllPermissions(): Promise<{ id: string; name: string; resource: string; action: string; description: string | null }[]> {
    const list = await this.permissionRepository.find({ order: { resource: 'ASC', action: 'ASC' } });
    return list.map((p) => ({ id: p.id, name: p.name, resource: p.resource, action: p.action, description: p.description }));
  }

  /** Boshqariladigan rollar va ularning ruxsatlari — faqat super_admin uchun (super_admin rolini o‘zgartirish mumkin emas) */
  async getRolesWithPermissions(): Promise<{ id: string; name: string; description: string | null; permissionIds: string[] }[]> {
    const main = ['super_admin', 'admin', 'call_center', 'community_manager'];
    const roles = await this.roleRepository.find({
      where: main.length ? { name: In(main) } : undefined,
      relations: ['permissions'],
      order: { name: 'ASC' },
    });
    let filtered = roles;
    if (roles.some((r) => r.name === 'call_center'))
      filtered = roles.filter((r) => r.name !== 'community_manager');
    else if (roles.some((r) => r.name === 'community_manager'))
      filtered = roles.filter((r) => r.name !== 'call_center');
    return filtered.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description ?? null,
      permissionIds: (r.permissions || []).map((p) => p.id),
    }));
  }

  /** Rolga ruxsatlarni belgilash — faqat super_admin, super_admin rolini o‘zgartirish mumkin emas */
  async setRolePermissions(roleId: string, permissionIds: string[]): Promise<{ id: string; name: string; permissionIds: string[] }> {
    const role = await this.roleRepository.findOne({ where: { id: roleId }, relations: ['permissions'] });
    if (!role) throw new Error('Rol topilmadi');
    if (role.name === 'super_admin') throw new Error('Super admin rolining ruxsatlarini o‘zgartirish mumkin emas');
    const permissions = permissionIds.length
      ? await this.permissionRepository.findBy({ id: In(permissionIds) })
      : [];
    role.permissions = permissions;
    await this.roleRepository.save(role);
    return { id: role.id, name: role.name, permissionIds: permissions.map((p) => p.id) };
  }

  private omitPassword(user: User): Partial<User> {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
