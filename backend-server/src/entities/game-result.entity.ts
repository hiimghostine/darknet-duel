import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { GamePlayer } from './game-player.entity';

@Entity('game_results')
export class GameResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ unique: true })
  gameId: string;
  
  @Column({ nullable: true })
  winnerId: string; // Match database column name
  
  @Column({ nullable: true })
  winnerRole: string;
  
  @Column({ default: 'standard' })
  gameMode: string;
  
  @Column({ default: 0 })
  turnCount: number;
  
  @Column()
  startTime: Date;
  
  @Column()
  endTime: Date;
  
  // isAbandoned is not in the schema - we'll derive it from abandonReason
  
  @Column({ nullable: true })
  abandonReason: string;
  
  @CreateDateColumn()
  createdAt: Date;
  
  // Using string relation to avoid circular dependency
  @OneToMany('GamePlayer', 'game')
  players: GamePlayer[];
}
