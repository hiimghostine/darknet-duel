import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('lobby_chat')
@Index(['chatId', 'createdAt'])  // Optimize queries by chat ID and timestamp
export class LobbyChat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  chatId: string;  // Unique identifier for the chat room (could be lobby ID or 'global')

  @Column({ type: 'uuid' })
  senderUuid: string;  // UUID of the message sender

  @Column({ type: 'text' })
  messageContent: string;  // The actual message content

  @Column({ type: 'varchar', length: 50, default: 'user' })
  messageType: string;  // 'user', 'system', 'admin' etc.

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;  // Soft delete flag

  @Column({ type: 'json', nullable: true })
  metadata: any;  // Additional data like username, avatar, etc.
} 