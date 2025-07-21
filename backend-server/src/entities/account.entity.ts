import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum AccountType {
  USER = 'user',
  MOD = 'mod',
  ADMIN = 'admin'
}

@Entity({ name: "accounts" })
export class Account {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ 
    type: 'enum', 
    enum: AccountType, 
    default: AccountType.USER 
  })
  type: AccountType;

  @Column()
  password: string; // Will store hashed password, not plaintext

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true, type: 'text' })
  inactiveReason: string | null;

  @Column({ nullable: true })
  lastLogin: Date;

  @Column({ default: 0 })
  gamesPlayed: number;

  @Column({ default: 0 })
  gamesWon: number;
  
  @Column({ default: 0 })
  gamesLost: number;
  
  @Column({ default: 1000 })
  rating: number;

  @Column({ nullable: true, length: 30 })
  bio: string;

  @Column({ type: 'longblob', nullable: true })
  avatar: Buffer;

  @Column({ nullable: true, length: 100 })
  avatarMimeType: string;

  @Column({ default: 0 })
  creds: number;

  @Column({ default: 0 })
  crypts: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  decoration: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
