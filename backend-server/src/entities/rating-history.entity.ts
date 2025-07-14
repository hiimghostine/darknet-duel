import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from './account.entity';
import { GameResult } from './game-result.entity';

@Entity('rating_history')
export class RatingHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  accountId: string;
  
  @Column()
  gameId: string;
  
  @Column()
  gameMode: string;
  
  @Column()
  ratingBefore: number;
  
  @Column()
  ratingAfter: number;
  
  @Column()
  ratingChange: number;
  
  @Column()
  timestamp: Date;
  
  @ManyToOne(() => Account)
  @JoinColumn({ name: 'accountId' })
  account: Account;
  
  @ManyToOne(() => GameResult)
  @JoinColumn({ name: 'gameId', referencedColumnName: 'gameId' })
  game: GameResult;
}
