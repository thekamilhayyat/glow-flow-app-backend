import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceEntity } from '../../database/entities/services.entity';

export interface ServiceFilters {
  category?: string;
  isActive?: boolean;
  staffId?: string;
}

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly servicesRepository: Repository<ServiceEntity>
  ) {}

  async findAll(filters: ServiceFilters = {}): Promise<ServiceEntity[]> {
    const queryBuilder = this.servicesRepository.createQueryBuilder('service');

    if (filters.category) {
      queryBuilder.andWhere('service.category = :category', { category: filters.category });
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('service.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.staffId) {
      // This would join with staff_services table when implemented
      queryBuilder.andWhere('EXISTS (SELECT 1 FROM staff_services ss WHERE ss.service_id = service.id AND ss.staff_id = :staffId)', 
        { staffId: filters.staffId });
    }

    queryBuilder.orderBy('service.displayOrder', 'ASC');

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<ServiceEntity> {
    const service = await this.servicesRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async create(serviceData: Partial<ServiceEntity>): Promise<ServiceEntity> {
    const service = this.servicesRepository.create(serviceData);
    return this.servicesRepository.save(service);
  }

  async update(id: string, serviceData: Partial<ServiceEntity>): Promise<ServiceEntity> {
    const service = await this.findOne(id);
    Object.assign(service, serviceData);
    return this.servicesRepository.save(service);
  }

  async remove(id: string): Promise<void> {
    const service = await this.findOne(id);
    await this.servicesRepository.remove(service);
  }
}
