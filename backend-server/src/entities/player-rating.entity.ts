import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from './account.entity';

@Entity('player_ratings')
export class PlayerRating {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  accountId: string;
  
  @Column({ default: 1200 })
  rating: number;
  
  @Column({ default: 0 })
  gamesPlayed: number;
  
  @Column({ default: 0 })
  wins: number;
  
  @Column({ default: 0 })
  losses: number;
  
  @Column({ default: 'standard' })
  gameMode: string;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
  
  @ManyToOne(() => Account)
  @JoinColumn({ name: 'accountId' })
  account: Account;
}
