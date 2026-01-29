import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { StaffEntity } from '../../database/entities/staff.entity';

export interface StaffFilters {
  isActive?: boolean;
  role?: string;
  serviceId?: string;
}

export interface AvailabilitySlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
}

export interface AvailabilityResponse {
  availability: Array<{
    date: string;
    slots: AvailabilitySlot[];
  }>;
}

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(StaffEntity)
    private readonly staffRepository: Repository<StaffEntity>
  ) {}

  async findAll(filters: StaffFilters = {}): Promise<StaffEntity[]> {
    const queryBuilder = this.staffRepository.createQueryBuilder('staff');

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('staff.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.role) {
      queryBuilder.andWhere('staff.role = :role', { role: filters.role });
    }

    if (filters.serviceId) {
      // This would join with staff_services table when implemented
      queryBuilder.andWhere('EXISTS (SELECT 1 FROM staff_services ss WHERE ss.staff_id = staff.id AND ss.service_id = :serviceId)', 
        { serviceId: filters.serviceId });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<StaffEntity> {
    const staff = await this.staffRepository.findOne({ where: { id } });
    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }
    return staff;
  }

  async create(staffData: Partial<StaffEntity>): Promise<StaffEntity> {
    const staff = this.staffRepository.create(staffData);
    return this.staffRepository.save(staff);
  }

  async update(id: string, staffData: Partial<StaffEntity>): Promise<StaffEntity> {
    const staff = await this.findOne(id);
    Object.assign(staff, staffData);
    return this.staffRepository.save(staff);
  }

  async remove(id: string): Promise<void> {
    const staff = await this.findOne(id);
    await this.staffRepository.remove(staff);
  }

  async getAvailability(
    staffId: string, 
    startDate: string, 
    endDate: string, 
    duration?: number
  ): Promise<AvailabilityResponse> {
    const staff = await this.findOne(staffId);
    
    // Placeholder implementation
    // In a real implementation, this would:
    // 1. Get staff working hours
    // 2. Check existing appointments
    // 3. Generate available time slots
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const slots: AvailabilitySlot[] = [];
    
    // Generate 30-minute slots for the date range
    const current = new Date(start);
    while (current < end) {
      const slotEnd = new Date(current.getTime() + 30 * 60 * 1000);
      slots.push({
        startTime: new Date(current),
        endTime: slotEnd,
        available: Math.random() > 0.3 // Random availability for demo
      });
      current.setTime(current.getTime() + 30 * 60 * 1000);
    }

    return {
      availability: [{
        date: startDate,
        slots
      }]
    };
  }
}
