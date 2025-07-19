import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from './account.entity';

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'userId', type: 'varchar', length: 36 })
  userId: string;

  @Column({ type: 'text' })
  text: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Account;
} 