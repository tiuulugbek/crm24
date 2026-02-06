import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Client } from './client.entity';
import { User } from './user.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id', nullable: true })
  clientId: string;

  @ManyToOne(() => Client, client => client.comments)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column()
  platform: string; // instagram, facebook, youtube

  @Column({ name: 'platform_comment_id' })
  platformCommentId: string;

  @Column({ name: 'post_id' })
  postId: string;

  @Column({ name: 'post_url', type: 'text', nullable: true })
  postUrl: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'author_name', nullable: true })
  authorName: string;

  @Column({ name: 'author_id', nullable: true })
  authorId: string;

  @Column({ name: 'author_username', nullable: true })
  authorUsername: string;

  @Column({ name: 'parent_comment_id', nullable: true })
  parentCommentId: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'replied_to', default: false })
  repliedTo: boolean;

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
