import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GameResult } from './game-result.entity';
import { Account } from './account.entity';

@Entity('game_players')
export class GamePlayer {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  gameId: string;
  
  @Column()
  accountId: string;
  
  @Column()
  playerRole: string;
  
  @Column({ default: false })
  isWinner: boolean;
  
  @Column({ nullable: true, type: 'int' })
  ratingBefore: number | null;
  
  @Column({ nullable: true, type: 'int' })
  ratingAfter: number | null;
  
  @Column({ nullable: true, type: 'int' })
  ratingChange: number | null;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @ManyToOne(() => GameResult, game => game.players)
  @JoinColumn({ name: 'gameId', referencedColumnName: 'gameId' })
  game: GameResult;
  
  @ManyToOne(() => Account)
  @JoinColumn({ name: 'accountId' })
  account: Account;
}
