import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Telegraf, Context } from 'telegraf';
import { Message } from '../../../entities/message.entity';
import { Client } from '../../../entities/client.entity';
import { ClientChannel } from '../../../entities/client-channel.entity';
import { Conversation } from '../../../entities/conversation.entity';
import { Integration } from '../../../entities';

@Injectable()
export class TelegramService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Integration)
    private integrationRepository: Repository<Integration>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(ClientChannel)
    private clientChannelRepository: Repository<ClientChannel>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {}

  /** Token: avvalo DB dagi aktiv Telegram integratsiyadan, keyin .env dan */
  async getToken(): Promise<string | null> {
    const integration = await this.integrationRepository.findOne({
      where: { platform: 'telegram', isActive: true },
      order: { createdAt: 'DESC' },
    });
    const fromDb = integration?.config as Record<string, string> | undefined;
    if (fromDb?.botToken) return fromDb.botToken;
    return this.configService.get('TELEGRAM_BOT_TOKEN') || null;
  }

  /** Webhook orqali kelgan yangilanishni bitta bot token bilan qayta ishlash */
  async handleWebhook(update: any): Promise<void> {
    const token = await this.getToken();
    if (!token) return;
    const bot = new Telegraf(token);
    this.setupHandlers(bot);
    await bot.handleUpdate(update);
  }

  async setWebhookForToken(token: string, url: string): Promise<void> {
    try {
      const bot = new Telegraf(token);
      await bot.telegram.setWebhook(url);
    } catch (error) {
      console.error('Error setting Telegram webhook:', error);
    }
  }

  private setupHandlers(bot: Telegraf) {
    bot.on('text', async (ctx: Context) => {
      await this.handleIncomingMessage(ctx);
    });
    bot.on('photo', async (ctx: Context) => {
      await this.handleIncomingMessage(ctx, 'image');
    });
    bot.on('video', async (ctx: Context) => {
      await this.handleIncomingMessage(ctx, 'video');
    });
    bot.on('document', async (ctx: Context) => {
      await this.handleIncomingMessage(ctx, 'file');
    });
    bot.on('voice', async (ctx: Context) => {
      await this.handleIncomingMessage(ctx, 'audio');
    });
  }

  private async handleIncomingMessage(ctx: any, messageType: string = 'text') {
    try {
      const telegramUser = ctx.from;
      const chat = ctx.chat;
      const chatId = chat.id.toString();
      const messageId = ctx.message.message_id.toString();
      const isGroup = chat.type === 'group' || chat.type === 'supergroup';

      // Shaxsiy chat: mijoz = yozgan odam. Guruh: mijoz = guruh (barcha xabarlar bitta suhbatda)
      const client = isGroup
        ? await this.findOrCreateGroupClient(chatId, (chat as any).title || `Guruh ${chatId}`)
        : await this.findOrCreateClient({
            telegramUserId: telegramUser.id.toString(),
            username: telegramUser.username,
            firstName: telegramUser.first_name,
            lastName: telegramUser.last_name,
          });

      // Find or create conversation
      const conversation = await this.findOrCreateConversation({
        clientId: client.id,
        platformConversationId: chatId,
      });

      // Get message content
      let content = '';
      let mediaUrl = '';

      if (messageType === 'text') {
        content = ctx.message.text;
      } else if (messageType === 'image') {
        const photo = ctx.message.photo[ctx.message.photo.length - 1];
        const fileLink = await ctx.telegram.getFileLink(photo.file_id);
        mediaUrl = fileLink.href;
        content = ctx.message.caption || '';
      } else if (messageType === 'video') {
        const fileLink = await ctx.telegram.getFileLink(ctx.message.video.file_id);
        mediaUrl = fileLink.href;
        content = ctx.message.caption || '';
      } else if (messageType === 'document') {
        const fileLink = await ctx.telegram.getFileLink(ctx.message.document.file_id);
        mediaUrl = fileLink.href;
        content = ctx.message.caption || '';
      } else if (messageType === 'audio') {
        const fileLink = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
        mediaUrl = fileLink.href;
      }

      // Save message
      const message = this.messageRepository.create({
        conversationId: conversation.id,
        clientId: client.id,
        platform: 'telegram',
        platformMessageId: messageId,
        messageType,
        content,
        mediaUrl,
        isInbound: true,
        senderName: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
        senderId: telegramUser.id.toString(),
      });

      await this.messageRepository.save(message);

      // Update conversation
      await this.conversationRepository.update(conversation.id, {
        lastMessageAt: new Date(),
        isRead: false,
      });

      console.log(`Telegram message saved: ${messageId}`);
    } catch (error) {
      console.error('Error handling Telegram message:', error);
    }
  }

  async sendMessage(conversationId: string, content: string, userId: string) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('Telegram bot token topilmadi');
      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId },
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const bot = new Telegraf(token);
      const chatId = conversation.platformConversationId;
      const sentMessage = await bot.telegram.sendMessage(chatId, content);

      // Save outbound message
      const message = this.messageRepository.create({
        conversationId: conversation.id,
        clientId: conversation.clientId,
        platform: 'telegram',
        platformMessageId: sentMessage.message_id.toString(),
        messageType: 'text',
        content,
        isInbound: false,
        repliedBy: userId,
      });

      const saved = await this.messageRepository.save(message);
      await this.conversationRepository.update(conversationId, { lastMessageAt: new Date(), isRead: true });
      return saved;
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      throw error;
    }
  }

  /** Guruh (group/supergroup) uchun bitta mijoz — guruhdagi barcha xabarlar shu suhbatda */
  private async findOrCreateGroupClient(chatId: string, groupTitle: string): Promise<Client> {
    const groupUserId = `group_${chatId}`;
    let clientChannel = await this.clientChannelRepository.findOne({
      where: { platform: 'telegram', userId: groupUserId },
      relations: ['client'],
    });
    if (clientChannel) return clientChannel.client;

    const client = this.clientRepository.create({
      name: groupTitle || `Telegram guruh ${chatId}`,
      source: 'telegram',
      status: 'new',
    });
    const savedClient = await this.clientRepository.save(client);
    clientChannel = this.clientChannelRepository.create({
      clientId: savedClient.id,
      platform: 'telegram',
      userId: groupUserId,
      isPrimary: true,
    });
    await this.clientChannelRepository.save(clientChannel);
    return savedClient;
  }

  private async findOrCreateClient(data: {
    telegramUserId: string;
    username?: string;
    firstName: string;
    lastName?: string;
  }): Promise<Client> {
    let clientChannel = await this.clientChannelRepository.findOne({
      where: {
        platform: 'telegram',
        userId: data.telegramUserId,
      },
      relations: ['client'],
    });

    if (clientChannel) {
      return clientChannel.client;
    }

    const client = this.clientRepository.create({
      name: `${data.firstName} ${data.lastName || ''}`.trim(),
      source: 'telegram',
      status: 'new',
    });

    const savedClient = await this.clientRepository.save(client);

    clientChannel = this.clientChannelRepository.create({
      clientId: savedClient.id,
      platform: 'telegram',
      userId: data.telegramUserId,
      username: data.username,
      isPrimary: true,
    });

    await this.clientChannelRepository.save(clientChannel);

    return savedClient;
  }

  private async findOrCreateConversation(data: {
    clientId: string;
    platformConversationId: string;
  }): Promise<Conversation> {
    let conversation = await this.conversationRepository.findOne({
      where: {
        platform: 'telegram',
        platformConversationId: data.platformConversationId,
      },
    });

    if (conversation) {
      return conversation;
    }

    conversation = this.conversationRepository.create({
      clientId: data.clientId,
      platform: 'telegram',
      platformConversationId: data.platformConversationId,
    });

    return await this.conversationRepository.save(conversation);
  }
}
