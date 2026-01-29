import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'clients' })
export class ClientEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_clients_name')
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName!: string | null;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName!: string | null;

  @Index('idx_clients_email')
  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Index('idx_clients_phone')
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender!: string | null;

  @Column({ name: 'address_line1', type: 'varchar', length: 255, nullable: true })
  addressLine1!: string | null;

  @Column({ name: 'address_line2', type: 'varchar', length: 255, nullable: true })
  addressLine2!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  state!: string | null;

  @Column({ name: 'zip_code', type: 'varchar', length: 20, nullable: true })
  zipCode!: string | null;

  @Column({ type: 'varchar', length: 100, default: 'USA' })
  country!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'text', array: true, nullable: true })
  tags!: string[] | null;

  @Index('idx_clients_is_vip')
  @Column({ name: 'is_vip', type: 'boolean', default: false })
  isVip!: boolean;

  @Column({ name: 'preferred_staff_id', type: 'uuid', nullable: true })
  preferredStaffId!: string | null;

  @Column({ name: 'marketing_opt_in', type: 'boolean', default: false })
  marketingOptIn!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}


