import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'products' })
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_products_sku')
  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  sku!: string | null;

  @Index('idx_products_barcode')
  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  barcode!: string | null;

  @Index('idx_products_name')
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Index('idx_products_manufacturer_id')
  @Column({ name: 'manufacturer_id', type: 'uuid', nullable: true })
  manufacturerId!: string | null;

  @Index('idx_products_type_id')
  @Column({ name: 'type_id', type: 'uuid', nullable: true })
  typeId!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost!: string | null;

  @Column({ name: 'quantity_in_stock', type: 'int', default: 0 })
  quantityInStock!: number;

  @Column({ name: 'low_stock_threshold', type: 'int', default: 10 })
  lowStockThreshold!: number;

  @Column({ name: 'reorder_point', type: 'int', default: 5 })
  reorderPoint!: number;

  @Column({ name: 'reorder_quantity', type: 'int', default: 20 })
  reorderQuantity!: number;

  @Index('idx_products_is_active')
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'is_sellable', type: 'boolean', default: true })
  isSellable!: boolean;

  @Column({ name: 'is_retail', type: 'boolean', default: true })
  isRetail!: boolean;

  @Column({ name: 'track_inventory', type: 'boolean', default: true })
  trackInventory!: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit!: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}


