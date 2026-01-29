import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type PaymentType = 'cash' | 'credit-card' | 'debit-card' | 'gift-card' | 'check' | 'online' | 'other';

@Entity({ name: 'payment_methods' })
export class PaymentMethodEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_payment_methods_sale_id')
  @Column({ name: 'sale_id', type: 'uuid' })
  saleId!: string;

  @Index('idx_payment_methods_type')
  @Column({ type: 'varchar', length: 50 })
  type!: PaymentType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reference!: string | null;

  @Column({ name: 'card_brand', type: 'varchar', length: 50, nullable: true })
  cardBrand!: string | null;

  @Column({ name: 'gift_card_number', type: 'varchar', length: 100, nullable: true })
  giftCardNumber!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'processed_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  processedAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}


