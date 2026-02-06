import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Integration } from '../../entities';
import { Message } from '../../entities/message.entity';
import { Client } from '../../entities/client.entity';
import { ClientChannel } from '../../entities/client-channel.entity';
import { Conversation } from '../../entities/conversation.entity';
import { Comment } from '../../entities/comment.entity';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { TelegramService } from './telegram/telegram.service';
import { YoutubeService } from './youtube/youtube.service';
import { WebhookController } from './webhook.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Integration, Message, Client, ClientChannel, Conversation, Comment]),
  ],
  providers: [IntegrationsService, TelegramService, YoutubeService],
  controllers: [IntegrationsController, WebhookController],
  exports: [IntegrationsService, TelegramService, YoutubeService],
})
export class IntegrationsModule {}
