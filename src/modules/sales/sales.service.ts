import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SaleEntity, SaleStatus } from '../../database/entities/sales.entity';
import { SaleItemEntity } from '../../database/entities/sale_items.entity';
import { PaymentMethodEntity } from '../../database/entities/payment_methods.entity';

export interface SaleFilters {
  startDate?: string;
  endDate?: string;
  clientId?: string;
  staffId?: string;
  paymentMethod?: string;
  status?: SaleStatus;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export interface SaleSummary {
  totalRevenue: number;
  totalTransactions: number;
  averageTicket: number;
}

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(SaleEntity)
    private readonly salesRepository: Repository<SaleEntity>,
    @InjectRepository(SaleItemEntity)
    private readonly saleItemsRepository: Repository<SaleItemEntity>,
    @InjectRepository(PaymentMethodEntity)
    private readonly paymentMethodsRepository: Repository<PaymentMethodEntity>
  ) {}

  async findAll(filters: SaleFilters = {}): Promise<{ data: SaleEntity[]; summary: SaleSummary }> {
    const queryBuilder = this.salesRepository.createQueryBuilder('sale')
      .leftJoinAndSelect('sale.client', 'client')
      .leftJoinAndSelect('sale.completedBy', 'completedBy');

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('sale.completedAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate
      });
    }

    if (filters.clientId) {
      queryBuilder.andWhere('sale.clientId = :clientId', { clientId: filters.clientId });
    }

    if (filters.staffId) {
      queryBuilder.andWhere('EXISTS (SELECT 1 FROM sale_items si WHERE si.sale_id = sale.id AND si.staff_id = :staffId)', 
        { staffId: filters.staffId });
    }

    if (filters.paymentMethod) {
      queryBuilder.andWhere('EXISTS (SELECT 1 FROM payment_methods pm WHERE pm.sale_id = sale.id AND pm.type = :paymentMethod)', 
        { paymentMethod: filters.paymentMethod });
    }

    if (filters.status) {
      queryBuilder.andWhere('sale.status = :status', { status: filters.status });
    }

    if (filters.searchTerm) {
      queryBuilder.andWhere(
        '(sale.transactionId ILIKE :searchTerm OR client.name ILIKE :searchTerm)',
        { searchTerm: `%${filters.searchTerm}%` }
      );
    }

    queryBuilder.orderBy('sale.completedAt', 'DESC');

    if (filters.page && filters.limit) {
      queryBuilder.skip((filters.page - 1) * filters.limit).take(filters.limit);
    }

    const data = await queryBuilder.getMany();

    // Calculate summary
    const summary = await this.calculateSummary(filters);

    return { data, summary };
  }

  async findOne(id: string): Promise<SaleEntity> {
    const sale = await this.salesRepository.findOne({
      where: { id },
      relations: ['client', 'completedBy']
    });
    
    if (!sale) {
      throw new NotFoundException('Sale not found');
    }
    
    return sale;
  }

  async create(saleData: Partial<SaleEntity>): Promise<SaleEntity> {
    const transactionId = this.generateTransactionId();
    
    const sale = this.salesRepository.create({
      ...saleData,
      transactionId,
      status: 'completed',
      completedAt: new Date()
    });

    return this.salesRepository.save(sale);
  }

  async update(id: string, saleData: Partial<SaleEntity>): Promise<SaleEntity> {
    const sale = await this.findOne(id);
    Object.assign(sale, saleData);
    return this.salesRepository.save(sale);
  }

  async remove(id: string): Promise<void> {
    const sale = await this.findOne(id);
    await this.salesRepository.remove(sale);
  }

  async refund(id: string, refundData: { amount: number; reason: string }): Promise<SaleEntity> {
    const sale = await this.findOne(id);
    
    if (sale.status === 'refunded') {
      throw new Error('Sale already refunded');
    }

    sale.refundAmount = refundData.amount;
    sale.refundReason = refundData.reason;
    sale.refundedAt = new Date();
    sale.status = refundData.amount >= parseFloat(sale.total) ? 'refunded' : 'partially-refunded';

    return this.salesRepository.save(sale);
  }

  private async calculateSummary(filters: SaleFilters): Promise<SaleSummary> {
    const queryBuilder = this.salesRepository.createQueryBuilder('sale')
      .where('sale.status = :status', { status: 'completed' });

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('sale.completedAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate
      });
    }

    const result = await queryBuilder
      .select('SUM(CAST(sale.total AS DECIMAL))', 'totalRevenue')
      .addSelect('COUNT(*)', 'totalTransactions')
      .addSelect('AVG(CAST(sale.total AS DECIMAL))', 'averageTicket')
      .getRawOne();

    return {
      totalRevenue: parseFloat(result.totalRevenue) || 0,
      totalTransactions: parseInt(result.totalTransactions) || 0,
      averageTicket: parseFloat(result.averageTicket) || 0
    };
  }

  private generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN-${timestamp}-${random}`;
  }
}
