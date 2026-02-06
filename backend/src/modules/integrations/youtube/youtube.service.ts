import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { google } from 'googleapis';
import { Comment } from '../../../entities/comment.entity';
import { Client } from '../../../entities/client.entity';
import { ClientChannel } from '../../../entities/client-channel.entity';
import { Integration } from '../../../entities';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class YoutubeService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Integration)
    private integrationRepository: Repository<Integration>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(ClientChannel)
    private clientChannelRepository: Repository<ClientChannel>,
  ) {}

  private async getYoutubeConfig(): Promise<{ apiKey: string; channelId: string } | null> {
    const integration = await this.integrationRepository.findOne({
      where: { platform: 'youtube', isActive: true },
      order: { createdAt: 'DESC' },
    });
    const config = integration?.config as Record<string, string> | undefined;
    if (config?.apiKey && config?.channelId) return { apiKey: config.apiKey, channelId: config.channelId };
    const envKey = this.configService.get('YOUTUBE_API_KEY');
    const envChannel = this.configService.get('YOUTUBE_CHANNEL_ID');
    if (envKey && envChannel) return { apiKey: envKey, channelId: envChannel };
    return null;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncComments() {
    const cfg = await this.getYoutubeConfig();
    if (!cfg) return;
    const youtube = google.youtube({ version: 'v3', auth: cfg.apiKey });
    const channelId = cfg.channelId;

    try {
      const videosResponse = await youtube.search.list({
        part: ['id'],
        channelId: channelId,
        type: ['video'],
        order: 'date',
        maxResults: 50,
      });

      const items = (videosResponse as any).data?.items || [];
      const videoIds = items.map((item: any) => item.id?.videoId).filter(Boolean);

      // Get comments for each video
      for (const videoId of videoIds) {
        await this.syncVideoComments(videoId, youtube);
      }

      console.log('YouTube sync completed successfully');
    } catch (error) {
      console.error('Error syncing YouTube comments:', error);
    }
  }

  async syncVideoComments(videoId: string, youtube?: any) {
    const yt = youtube || google.youtube({ version: 'v3', auth: (await this.getYoutubeConfig())?.apiKey });
    if (!yt) return;
    try {
      const commentsResponse = await yt.commentThreads.list({
        part: ['snippet', 'replies'],
        videoId: videoId,
        maxResults: 100,
        order: 'time',
      });

      for (const thread of commentsResponse.data.items) {
        const topComment = thread.snippet.topLevelComment.snippet;
        
        // Check if comment already exists
        const existingComment = await this.commentRepository.findOne({
          where: {
            platform: 'youtube',
            platformCommentId: thread.snippet.topLevelComment.id,
          },
        });

        if (existingComment) {
          continue;
        }

        // Create or get client
        const client = await this.findOrCreateClient({
          authorId: topComment.authorChannelId?.value,
          authorName: topComment.authorDisplayName,
          platform: 'youtube',
        });

        // Save comment
        const comment = this.commentRepository.create({
          clientId: client.id,
          platform: 'youtube',
          platformCommentId: thread.snippet.topLevelComment.id,
          postId: videoId,
          postUrl: `https://www.youtube.com/watch?v=${videoId}`,
          content: topComment.textDisplay,
          authorName: topComment.authorDisplayName,
          authorId: topComment.authorChannelId?.value,
          authorUsername: topComment.authorDisplayName,
          createdAt: new Date(topComment.publishedAt),
        });

        await this.commentRepository.save(comment);

        // Handle replies
        if (thread.replies) {
          for (const reply of thread.replies.comments) {
            await this.syncReplyComment(reply, videoId, thread.snippet.topLevelComment.id);
          }
        }
      }
    } catch (error) {
      console.error(`Error syncing comments for video ${videoId}:`, error);
    }
  }

  async syncReplyComment(reply: any, videoId: string, parentCommentId: string) {
    const replySnippet = reply.snippet;

    const existingComment = await this.commentRepository.findOne({
      where: {
        platform: 'youtube',
        platformCommentId: reply.id,
      },
    });

    if (existingComment) {
      return;
    }

    const client = await this.findOrCreateClient({
      authorId: replySnippet.authorChannelId?.value,
      authorName: replySnippet.authorDisplayName,
      platform: 'youtube',
    });

    const comment = this.commentRepository.create({
      clientId: client.id,
      platform: 'youtube',
      platformCommentId: reply.id,
      postId: videoId,
      postUrl: `https://www.youtube.com/watch?v=${videoId}`,
      content: replySnippet.textDisplay,
      authorName: replySnippet.authorDisplayName,
      authorId: replySnippet.authorChannelId?.value,
      authorUsername: replySnippet.authorDisplayName,
      parentCommentId: parentCommentId,
      createdAt: new Date(replySnippet.publishedAt),
    });

    await this.commentRepository.save(comment);
  }

  async replyToComment(commentId: string, replyText: string, userId: string) {
    const cfg = await this.getYoutubeConfig();
    if (!cfg) throw new Error('YouTube integratsiya topilmadi');
    const youtube = google.youtube({ version: 'v3', auth: cfg.apiKey });
    try {
      const comment = await this.commentRepository.findOne({
        where: { id: commentId },
      });

      if (!comment) {
        throw new Error('Comment not found');
      }

      await youtube.comments.insert({
        part: ['snippet'],
        requestBody: {
          snippet: {
            parentId: comment.platformCommentId,
            textOriginal: replyText,
          },
        },
      });

      // Update comment as replied
      await this.commentRepository.update(commentId, {
        repliedTo: true,
        repliedBy: userId,
        replyContent: replyText,
        repliedAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error replying to YouTube comment:', error);
      throw error;
    }
  }

  private async findOrCreateClient(data: {
    authorId: string;
    authorName: string;
    platform: string;
  }): Promise<Client> {
    // Check if client channel exists
    let clientChannel = await this.clientChannelRepository.findOne({
      where: {
        platform: data.platform,
        userId: data.authorId,
      },
      relations: ['client'],
    });

    if (clientChannel) {
      return clientChannel.client;
    }

    // Create new client
    const client = this.clientRepository.create({
      name: data.authorName,
      source: data.platform,
      status: 'new',
    });

    const savedClient = await this.clientRepository.save(client);

    // Create client channel
    clientChannel = this.clientChannelRepository.create({
      clientId: savedClient.id,
      platform: data.platform,
      userId: data.authorId,
      username: data.authorName,
      isPrimary: true,
    });

    await this.clientChannelRepository.save(clientChannel);

    return savedClient;
  }
}
