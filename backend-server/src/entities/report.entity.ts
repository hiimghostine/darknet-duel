import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from './account.entity';

export enum ReportType {
  PROFILE = 'profile',
  CHAT = 'chat'
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}

@Entity('reports')
@Index(['reporterId'])
@Index(['reporteeId'])
@Index(['status'])
@Index(['reportType'])
@Index(['createdAt'])
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  reporterId: string;

  @Column({ type: 'uuid' })
  reporteeId: string;

  @Column({ type: 'varchar', length: 500 })
  reason: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ 
    type: 'enum', 
    enum: ReportType, 
    default: ReportType.CHAT 
  })
  reportType: ReportType;

  @Column({ 
    type: 'enum', 
    enum: ReportStatus, 
    default: ReportStatus.PENDING 
  })
  status: ReportStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporterId' })
  reporter: Account;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporteeId' })
  reportee: Account;
} 