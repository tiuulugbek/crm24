import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration } from '../../entities';
import { TelegramService } from './telegram/telegram.service';

const ALLOWED_PLATFORMS = ['telegram', 'instagram', 'youtube', 'facebook', 'whatsapp', 'eskiz_sms'];
const TERMS_ACCEPTANCE_MAX_AGE_MS = 5 * 60 * 1000; // 5 minut

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(Integration)
    private integrationRepository: Repository<Integration>,
    private configService: ConfigService,
    private telegramService: TelegramService,
  ) {}

  async findAll(): Promise<Partial<Integration>[]> {
    const list = await this.integrationRepository.find({
      order: { platform: 'ASC', createdAt: 'DESC' },
    });
    return list.map((i) => ({
      id: i.id,
      platform: i.platform,
      name: i.name || null,
      isActive: i.isActive,
      lastSync: i.lastSync,
      createdAt: i.createdAt,
      config: undefined,
    }));
  }

  async configure(
    platform: string,
    name: string | null,
    config: Record<string, any>,
    userId: string,
    termsAcceptedAt?: string,
  ): Promise<Integration> {
    if (!ALLOWED_PLATFORMS.includes(platform)) {
      throw new BadRequestException('Bunday platforma qo‘llab-quvvatlanmaydi');
    }
    if (!termsAcceptedAt) {
      throw new BadRequestException('Integratsiyani ulashdan oldin shartlar va maxfiylik siyosatiga rozilik berishingiz shart');
    }
    const accepted = new Date(termsAcceptedAt).getTime();
    if (Number.isNaN(accepted) || Date.now() - accepted > TERMS_ACCEPTANCE_MAX_AGE_MS) {
      throw new BadRequestException('Rozilik muddati tugagan. Iltimos, sahifani yangilab qayta urinib ko‘ring');
    }

    const payload = {
      platform,
      name: name && name.trim() ? name.trim() : null,
      config: config || {},
      isActive: true,
      createdBy: userId,
    };
    const newOne = this.integrationRepository.create(payload as any) as unknown as Integration;
    const integration = await this.integrationRepository.save(newOne);
    if (platform === 'telegram' && config?.botToken) {
      const base = this.configService.get<string>('WEBHOOK_BASE_URL');
      if (base) {
        const url = base.replace(/\/$/, '') + '/api/v1/webhook/telegram';
        await this.telegramService.setWebhookForToken(config.botToken, url);
      }
    }
    return integration;
  }

  async toggle(id: string, isActive: boolean): Promise<Integration> {
    const integration = await this.integrationRepository.findOne({ where: { id } });
    if (!integration) {
      throw new BadRequestException('Integratsiya topilmadi');
    }
    await this.integrationRepository.update(id, { isActive });
    const updated = await this.integrationRepository.findOne({ where: { id } });
    if (!updated) throw new BadRequestException('Integratsiya topilmadi');
    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.integrationRepository.delete(id);
    if (result.affected === 0) {
      throw new BadRequestException('Integratsiya topilmadi');
    }
  }
}
