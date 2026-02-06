import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Branch } from './branch.entity';
import { ClientChannel } from './client-channel.entity';
import { Message } from './message.entity';
import { Comment } from './comment.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  source: string; // instagram, telegram, youtube, facebook, whatsapp

  @Column({ name: 'branch_id', nullable: true })
  branchId: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ default: 'new' })
  status: string;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ name: 'merged_from', type: 'uuid', array: true, default: [] })
  mergedFrom: string[];

  @OneToMany(() => ClientChannel, channel => channel.client)
  channels: ClientChannel[];

  @OneToMany(() => Message, message => message.client)
  messages: Message[];

  @OneToMany(() => Comment, comment => comment.client)
  comments: Comment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
