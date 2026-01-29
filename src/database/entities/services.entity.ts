import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'services' })
export class ServiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Index('idx_services_category')
  @Column({ type: 'varchar', length: 100, nullable: true })
  category!: string | null;

  @Column({ type: 'int' })
  duration!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost!: string | null;

  @Index('idx_services_is_active')
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'requires_deposit', type: 'boolean', default: false })
  requiresDeposit!: boolean;

  @Column({ name: 'deposit_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  depositAmount!: string | null;

  @Column({ name: 'booking_buffer_before', type: 'int', default: 0 })
  bookingBufferBefore!: number;

  @Column({ name: 'booking_buffer_after', type: 'int', default: 0 })
  bookingBufferAfter!: number;

  @Column({ name: 'max_advance_booking_days', type: 'int', nullable: true })
  maxAdvanceBookingDays!: number | null;

  @Column({ name: 'cancellation_policy', type: 'text', nullable: true })
  cancellationPolicy!: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl!: string | null;

  @Index('idx_services_display_order')
  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}


