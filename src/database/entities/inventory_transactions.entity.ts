import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type InventoryTxnType = 'purchase' | 'sale' | 'adjustment' | 'waste' | 'return' | 'transfer';

@Entity({ name: 'inventory_transactions' })
export class InventoryTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_inventory_transactions_product_id')
  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Index('idx_inventory_transactions_type')
  @Column({ type: 'varchar', length: 50 })
  type!: InventoryTxnType;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ name: 'quantity_before', type: 'int' })
  quantityBefore!: number;

  @Column({ name: 'quantity_after', type: 'int' })
  quantityAfter!: number;

  @Column({ name: 'cost_per_unit', type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPerUnit!: string | null;

  @Column({ name: 'total_cost', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost!: string | null;

  @Index('idx_inventory_transactions_reference')
  @Column({ name: 'reference_type', type: 'varchar', length: 50, nullable: true })
  referenceType!: string | null;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'performed_by', type: 'uuid', nullable: true })
  performedBy!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}


