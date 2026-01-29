import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type ClientNoteType = 'general' | 'allergy' | 'preference' | 'medical' | 'complaint' | 'feedback';

@Entity({ name: 'client_notes' })
export class ClientNoteEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_client_notes_client_id')
  @Column({ name: 'client_id', type: 'uuid' })
  clientId!: string;

  @Column({ type: 'text' })
  note!: string;

  @Index('idx_client_notes_type')
  @Column({ type: 'varchar', length: 50, nullable: true })
  type!: ClientNoteType | null;

  @Index('idx_client_notes_is_alert')
  @Column({ name: 'is_alert', type: 'boolean', default: false })
  isAlert!: boolean;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}


