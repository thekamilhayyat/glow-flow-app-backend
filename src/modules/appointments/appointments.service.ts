import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not } from 'typeorm';
import { AppointmentEntity, AppointmentStatus } from '../../database/entities/appointments.entity';
import { AppointmentServicesEntity } from '../../database/entities/appointment_services.entity';

export interface AppointmentFilters {
  startDate?: string;
  endDate?: string;
  clientId?: string;
  staffId?: string;
  status?: AppointmentStatus;
  date?: string;
  page?: number;
  limit?: number;
}

export interface ConflictCheck {
  staffId: string;
  startTime: Date;
  endTime: Date;
  excludeAppointmentId?: string;
}

export interface ConflictResult {
  available: boolean;
  conflicts: Array<{
    id: string;
    startTime: Date;
    endTime: Date;
    clientName: string;
  }>;
}

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(AppointmentEntity)
    private readonly appointmentsRepository: Repository<AppointmentEntity>,
    @InjectRepository(AppointmentServicesEntity)
    private readonly appointmentServicesRepository: Repository<AppointmentServicesEntity>
  ) {}

  async findAll(filters: AppointmentFilters = {}): Promise<AppointmentEntity[]> {
    const queryBuilder = this.appointmentsRepository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.client', 'client')
      .leftJoinAndSelect('appointment.staff', 'staff');

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('appointment.startTime BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate
      });
    }

    if (filters.clientId) {
      queryBuilder.andWhere('appointment.clientId = :clientId', { clientId: filters.clientId });
    }

    if (filters.staffId) {
      queryBuilder.andWhere('appointment.staffId = :staffId', { staffId: filters.staffId });
    }

    if (filters.status) {
      queryBuilder.andWhere('appointment.status = :status', { status: filters.status });
    }

    if (filters.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      
      queryBuilder.andWhere('appointment.startTime BETWEEN :startOfDay AND :endOfDay', {
        startOfDay,
        endOfDay
      });
    }

    queryBuilder.orderBy('appointment.startTime', 'ASC');

    if (filters.page && filters.limit) {
      queryBuilder.skip((filters.page - 1) * filters.limit).take(filters.limit);
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<AppointmentEntity> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['client', 'staff']
    });
    
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    
    return appointment;
  }

  async create(appointmentData: Partial<AppointmentEntity>): Promise<AppointmentEntity> {
    // Check for conflicts before creating
    if (appointmentData.staffId && appointmentData.startTime && appointmentData.endTime) {
      const conflictCheck = await this.checkAvailability({
        staffId: appointmentData.staffId,
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime
      });

      if (!conflictCheck.available) {
        throw new ConflictException({
          error: {
            code: 'APPOINTMENT_CONFLICT',
            message: 'This time slot conflicts with another appointment',
            details: {
              conflictingAppointment: conflictCheck.conflicts[0]
            }
          }
        });
      }
    }

    const appointment = this.appointmentsRepository.create(appointmentData);
    return this.appointmentsRepository.save(appointment);
  }

  async update(id: string, appointmentData: Partial<AppointmentEntity>): Promise<AppointmentEntity> {
    const appointment = await this.findOne(id);
    
    // Check for conflicts if time is being changed
    if (appointmentData.startTime || appointmentData.endTime || appointmentData.staffId) {
      const startTime = appointmentData.startTime || appointment.startTime;
      const endTime = appointmentData.endTime || appointment.endTime;
      const staffId = appointmentData.staffId || appointment.staffId;

      if (staffId) {
        const conflictCheck = await this.checkAvailability({
          staffId,
          startTime,
          endTime,
          excludeAppointmentId: id
        });

        if (!conflictCheck.available) {
          throw new ConflictException({
            error: {
              code: 'APPOINTMENT_CONFLICT',
              message: 'This time slot conflicts with another appointment',
              details: {
                conflictingAppointment: conflictCheck.conflicts[0]
              }
            }
          });
        }
      }
    }

    Object.assign(appointment, appointmentData);
    return this.appointmentsRepository.save(appointment);
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentsRepository.remove(appointment);
  }

  async checkAvailability(check: ConflictCheck): Promise<ConflictResult> {
    const queryBuilder = this.appointmentsRepository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.client', 'client')
      .where('appointment.staffId = :staffId', { staffId: check.staffId })
      .andWhere('appointment.status NOT IN (:...statuses)', { 
        statuses: ['canceled', 'no-show'] 
      })
      .andWhere('(appointment.startTime, appointment.endTime) OVERLAPS (:startTime, :endTime)', {
        startTime: check.startTime,
        endTime: check.endTime
      });

    if (check.excludeAppointmentId) {
      queryBuilder.andWhere('appointment.id != :excludeId', { 
        excludeId: check.excludeAppointmentId 
      });
    }

    const conflicts = await queryBuilder.getMany();

    return {
      available: conflicts.length === 0,
      conflicts: conflicts.map(conflict => ({
        id: conflict.id,
        startTime: conflict.startTime,
        endTime: conflict.endTime,
        clientName: (conflict as any).client?.name || 'Unknown Client'
      }))
    };
  }

  async checkIn(id: string): Promise<AppointmentEntity> {
    const appointment = await this.findOne(id);
    appointment.status = 'checked-in';
    appointment.actualStartTime = new Date();
    return this.appointmentsRepository.save(appointment);
  }

  async complete(id: string): Promise<AppointmentEntity> {
    const appointment = await this.findOne(id);
    appointment.status = 'completed';
    appointment.actualEndTime = new Date();
    return this.appointmentsRepository.save(appointment);
  }
}
