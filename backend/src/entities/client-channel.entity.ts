import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Client } from './client.entity';

@Entity('client_channels')
export class ClientChannel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id' })
  clientId: string;

  @ManyToOne(() => Client, client => client.channels)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column()
  platform: string; // telegram, instagram, facebook, whatsapp, youtube

  @Column({ nullable: true })
  username: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string; // platform-specific user ID

  @Column({ name: 'profile_url', type: 'text', nullable: true })
  profileUrl: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
