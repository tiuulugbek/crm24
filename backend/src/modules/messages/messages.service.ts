import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../../entities/conversation.entity';
import { Message } from '../../entities/message.entity';
import { TelegramService } from '../integrations/telegram/telegram.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private telegramService: TelegramService,
  ) {}

  async getConversations() {
    return this.conversationRepository.find({
      relations: ['client'],
      order: { lastMessageAt: 'DESC', createdAt: 'DESC' },
    });
  }

  async getMessages(conversationId: string) {
    return this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async sendMessage(conversationId: string, content: string, userId: string) {
    const conv = await this.conversationRepository.findOne({ where: { id: conversationId }, relations: ['client'] });
    if (!conv) throw new Error('Suhbat topilmadi');
    if (conv.platform === 'telegram') {
      return this.telegramService.sendMessage(conversationId, content, userId);
    }
    const message = this.messageRepository.create({
      conversationId,
      clientId: conv.clientId,
      platform: conv.platform,
      platformMessageId: `out-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      content,
      isInbound: false,
      repliedBy: userId,
    });
    const saved = await this.messageRepository.save(message);
    await this.conversationRepository.update(conversationId, { lastMessageAt: new Date(), isRead: true });
    return saved;
  }

  async markAsRead(conversationId: string) {
    await this.conversationRepository.update(conversationId, { isRead: true });
    await this.messageRepository.update({ conversationId }, { isRead: true });
    return { ok: true };
  }
}
