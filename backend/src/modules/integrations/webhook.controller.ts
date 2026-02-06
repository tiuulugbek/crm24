import { Controller, Post, Body, Req } from '@nestjs/common';
import { TelegramService } from './telegram/telegram.service';

@Controller('webhook')
export class WebhookController {
  constructor(private telegramService: TelegramService) {}

  @Post('telegram')
  async telegram(@Body() update: any) {
    await this.telegramService.handleWebhook(update);
    return { ok: true };
  }
}
