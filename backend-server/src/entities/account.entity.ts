import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "accounts" })
export class Account {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string; // Will store hashed password, not plaintext

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLogin: Date;

  @Column({ default: 0 })
  gamesPlayed: number;

  @Column({ default: 0 })
  gamesWon: number;
  
  @Column({ default: 0 })
  gamesLost: number;
  
  @Column({ default: 1200 })
  rating: number;

  @Column({ nullable: true, length: 30 })
  bio: string;

  @Column({ type: 'longblob', nullable: true })
  avatar: Buffer;

  @Column({ nullable: true, length: 100 })
  avatarMimeType: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
