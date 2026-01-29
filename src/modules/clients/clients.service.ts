import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { ClientEntity } from '../../database/entities/clients.entity';

export interface ClientFilters {
  search?: string;
  isVip?: boolean;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientsRepository: Repository<ClientEntity>
  ) {}

  async findAll(filters: ClientFilters = {}): Promise<PaginatedResult<ClientEntity>> {
    const {
      search,
      isVip,
      tags,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = filters;

    const queryBuilder = this.clientsRepository.createQueryBuilder('client');

    if (search) {
      queryBuilder.andWhere(
        '(client.name ILIKE :search OR client.email ILIKE :search OR client.phone ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (isVip !== undefined) {
      queryBuilder.andWhere('client.isVip = :isVip', { isVip });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('client.tags && :tags', { tags });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy(`client.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const data = await queryBuilder.getMany();

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string): Promise<ClientEntity> {
    const client = await this.clientsRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  async create(clientData: Partial<ClientEntity>): Promise<ClientEntity> {
    const client = this.clientsRepository.create(clientData);
    return this.clientsRepository.save(client);
  }

  async update(id: string, clientData: Partial<ClientEntity>): Promise<ClientEntity> {
    const client = await this.findOne(id);
    Object.assign(client, clientData);
    return this.clientsRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    await this.clientsRepository.remove(client);
  }

  async getClientStats(clientId: string) {
    // Placeholder for client statistics
    // This would typically join with appointments and sales tables
    return {
      totalAppointments: 0,
      completedAppointments: 0,
      noShowCount: 0,
      lifetimeSpend: 0,
      averageTicket: 0,
      lastVisit: null
    };
  }
}
