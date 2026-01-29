import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type AppointmentStatus = 'pending' | 'confirmed' | 'checked-in' | 'in-progress' | 'completed' | 'canceled' | 'no-show';

@Entity({ name: 'appointments' })
export class AppointmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_appointments_client_id')
  @Column({ name: 'client_id', type: 'uuid' })
  clientId!: string;

  @Index('idx_appointments_staff_id')
  @Column({ name: 'staff_id', type: 'uuid', nullable: true })
  staffId!: string | null;

  @Index('idx_appointments_start_time')
  @Column({ name: 'start_time', type: 'timestamp' })
  startTime!: Date;

  @Index('idx_appointments_end_time')
  @Column({ name: 'end_time', type: 'timestamp' })
  endTime!: Date;

  @Index('idx_appointments_status')
  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status!: AppointmentStatus;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason!: string | null;

  @Column({ name: 'canceled_at', type: 'timestamp', nullable: true })
  canceledAt!: Date | null;

  @Column({ name: 'canceled_by', type: 'uuid', nullable: true })
  canceledBy!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes!: string | null;

  @Column({ name: 'has_unread_messages', type: 'boolean', default: false })
  hasUnreadMessages!: boolean;

  @Index('idx_appointments_is_recurring')
  @Column({ name: 'is_recurring', type: 'boolean', default: false })
  isRecurring!: boolean;

  @Column({ name: 'recurring_pattern', type: 'jsonb', nullable: true })
  recurringPattern!: any | null;

  @Column({ name: 'parent_appointment_id', type: 'uuid', nullable: true })
  parentAppointmentId!: string | null;

  @Column({ name: 'deposit_paid', type: 'boolean', default: false })
  depositPaid!: boolean;

  @Column({ name: 'deposit_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  depositAmount!: string | null;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalPrice!: string | null;

  @Column({ name: 'actual_start_time', type: 'timestamp', nullable: true })
  actualStartTime!: Date | null;

  @Column({ name: 'actual_end_time', type: 'timestamp', nullable: true })
  actualEndTime!: Date | null;

  @Column({ name: 'reminder_sent_at', type: 'timestamp', nullable: true })
  reminderSentAt!: Date | null;

  @Column({ name: 'confirmation_sent_at', type: 'timestamp', nullable: true })
  confirmationSentAt!: Date | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @Index('idx_appointments_created_at')
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}


