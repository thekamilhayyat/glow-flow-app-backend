import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'appointment_services' })
export class AppointmentServicesEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_appointment_services_appointment_id')
  @Column({ name: 'appointment_id', type: 'uuid' })
  appointmentId!: string;

  @Index('idx_appointment_services_service_id')
  @Column({ name: 'service_id', type: 'uuid' })
  serviceId!: string;

  @Column({ name: 'staff_id', type: 'uuid', nullable: true })
  staffId!: string | null;

  @Column({ type: 'int', nullable: true })
  duration!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price!: string | null;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}


