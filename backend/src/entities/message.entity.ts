import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Conversation } from './conversation.entity';
import { Client } from './client.entity';
import { User } from './user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id' })
  conversationId: string;

  @ManyToOne(() => Conversation, conversation => conversation.messages)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({ name: 'client_id' })
  clientId: string;

  @ManyToOne(() => Client, client => client.messages)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column()
  platform: string;

  @Column({ name: 'platform_message_id' })
  platformMessageId: string;

  @Column({ name: 'message_type', default: 'text' })
  messageType: string; // text, image, video, audio, file

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'media_url', type: 'text', nullable: true })
  mediaUrl: string;

  @Column({ name: 'is_inbound', default: true })
  isInbound: boolean;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'sender_name', nullable: true })
  senderName: string;

  @Column({ name: 'sender_id', nullable: true })
  senderId: string;

  @Column({ name: 'replied_to', nullable: true })
  repliedTo: string;

  @ManyToOne(() => Message)
  @JoinColumn({ name: 'replied_to' })
  repliedToMessage: Message;

  @Column({ name: 'replied_by', nullable: true })
  repliedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'replied_by' })
  repliedByUser: User;

  @Column({ name: 'reply_content', type: 'text', nullable: true })
  replyContent: string;

  @Column({ name: 'replied_at', type: 'timestamp', nullable: true })
  repliedAt: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
