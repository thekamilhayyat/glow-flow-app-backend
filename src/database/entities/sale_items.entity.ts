import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type SaleItemType = 'service' | 'product';

@Entity({ name: 'sale_items' })
export class SaleItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_sale_items_sale_id')
  @Column({ name: 'sale_id', type: 'uuid' })
  saleId!: string;

  @Index('idx_sale_items_type')
  @Column({ type: 'varchar', length: 50 })
  type!: SaleItemType;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: string;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Index('idx_sale_items_staff_id')
  @Column({ name: 'staff_id', type: 'uuid', nullable: true })
  staffId!: string | null;

  @Index('idx_sale_items_service_id')
  @Column({ name: 'service_id', type: 'uuid', nullable: true })
  serviceId!: string | null;

  @Index('idx_sale_items_product_id')
  @Column({ name: 'product_id', type: 'uuid', nullable: true })
  productId!: string | null;

  @Column({ name: 'discount_type', type: 'varchar', length: 50, nullable: true })
  discountType!: 'percentage' | 'fixed' | null;

  @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountValue!: string | null;

  @Column({ name: 'line_total', type: 'decimal', precision: 10, scale: 2 })
  lineTotal!: string;

  @Column({ name: 'commission_eligible', type: 'boolean', default: true })
  commissionEligible!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}


