import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm";
import { Account } from "./account.entity";

export enum ItemType {
  DECORATION = 'decoration'
}

export enum Currency {
  CREDS = 'creds',
  CRYPTS = 'crypts'
}

@Entity({ name: "purchases" })
@Index(['accountId'])
@Index(['itemType', 'itemId'])
export class Purchase {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'varchar', length: 36 })
  accountId: string;

  @Column({ 
    type: 'enum', 
    enum: ItemType, 
    default: ItemType.DECORATION 
  })
  itemType: ItemType;

  @Column({ type: 'varchar', length: 100 })
  itemId: string;

  @Column({ type: 'int' })
  purchasePrice: number;

  @Column({ 
    type: 'enum', 
    enum: Currency 
  })
  currency: Currency;

  @CreateDateColumn()
  purchasedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  account: Account;
} 