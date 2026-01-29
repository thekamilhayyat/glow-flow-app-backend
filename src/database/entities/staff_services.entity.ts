import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

export type Proficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert';

@Entity({ name: 'staff_services' })
export class StaffServicesEntity {
  @PrimaryColumn('uuid', { name: 'staff_id' })
  staffId!: string;

  @PrimaryColumn('uuid', { name: 'service_id' })
  serviceId!: string;

  @Column({ name: 'proficiency_level', type: 'varchar', length: 50, nullable: true })
  proficiencyLevel!: Proficiency | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Index('idx_staff_services_staff_id')
  @Column({ name: 'staff_id', type: 'uuid', insert: false, update: false, select: false })
  _sidx?: string;

  @Index('idx_staff_services_service_id')
  @Column({ name: 'service_id', type: 'uuid', insert: false, update: false, select: false })
  _sridx?: string;
}


