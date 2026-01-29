import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'business_settings' })
export class BusinessSettingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_business_settings_key')
  @Column({ type: 'varchar', length: 255, unique: true })
  key!: string;

  @Column({ type: 'jsonb' })
  value!: any;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Index('idx_business_settings_category')
  @Column({ type: 'varchar', length: 100, nullable: true })
  category!: string | null;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}


