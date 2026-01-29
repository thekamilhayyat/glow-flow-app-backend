import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type SaleStatus = 'draft' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially-refunded';

@Entity({ name: 'sales' })
export class SaleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_sales_transaction_id')
  @Column({ name: 'transaction_id', type: 'varchar', length: 100, unique: true })
  transactionId!: string;

  @Index('idx_sales_appointment_id')
  @Column({ name: 'appointment_id', type: 'uuid', nullable: true })
  appointmentId!: string | null;

  @Index('idx_sales_client_id')
  @Column({ name: 'client_id', type: 'uuid', nullable: true })
  clientId!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal!: string;

  @Column({ name: 'total_discount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalDiscount!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tip!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total!: string;

  @Index('idx_sales_status')
  @Column({ type: 'varchar', length: 50, default: 'completed' })
  status!: SaleStatus;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  refundAmount!: string;

  @Column({ name: 'refund_reason', type: 'text', nullable: true })
  refundReason!: string | null;

  @Column({ name: 'refunded_at', type: 'timestamp', nullable: true })
  refundedAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Index('idx_sales_completed_by')
  @Column({ name: 'completed_by', type: 'uuid', nullable: true })
  completedBy!: string | null;

  @Index('idx_sales_completed_at')
  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}


