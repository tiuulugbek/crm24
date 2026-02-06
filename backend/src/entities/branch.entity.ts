import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  address: string;

  @Column()
  phone: string;

  @Column({ name: 'working_hours', type: 'jsonb' })
  workingHours: Record<string, string>;

  /** SMS matni shabloni. Placeholderlar: {{client_name}}, {{branch_name}}, {{branch_address}}, {{branch_phone}}, {{working_hours}}. Bo‘sh bo‘lsa default matn ishlatiladi. */
  @Column({ name: 'sms_template', type: 'text', nullable: true })
  smsTemplate: string | null;

  @Column({ nullable: true })
  region: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
