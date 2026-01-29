import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  staffId?: string;
  clientId?: string;
  serviceId?: string;
  groupBy?: 'day' | 'week' | 'month' | 'year';
}

export interface SalesReport {
  period: string;
  totalRevenue: number;
  totalTransactions: number;
  averageTicket: number;
  topServices: Array<{
    serviceName: string;
    revenue: number;
    count: number;
  }>;
  topStaff: Array<{
    staffName: string;
    revenue: number;
    count: number;
  }>;
}

export interface ClientReport {
  totalClients: number;
  newClients: number;
  returningClients: number;
  averageSpend: number;
  topClients: Array<{
    clientName: string;
    totalSpend: number;
    visitCount: number;
  }>;
}

export interface StaffReport {
  totalStaff: number;
  activeStaff: number;
  topPerformers: Array<{
    staffName: string;
    revenue: number;
    appointmentCount: number;
    averageRating: number;
  }>;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}

  async getSalesReport(filters: ReportFilters = {}): Promise<SalesReport> {
    const { startDate, endDate, groupBy = 'day' } = filters;
    
    // Base query for sales data
    let dateFormat = '%Y-%m-%d';
    switch (groupBy) {
      case 'week':
        dateFormat = '%Y-%u';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
    }

    const whereClause = this.buildWhereClause(filters);
    
    // Get total revenue and transaction count
    const summaryQuery = `
      SELECT 
        COUNT(*) as totalTransactions,
        COALESCE(SUM(CAST(total AS DECIMAL)), 0) as totalRevenue,
        COALESCE(AVG(CAST(total AS DECIMAL)), 0) as averageTicket
      FROM sales 
      WHERE status = 'completed' ${whereClause}
    `;

    const summary = await this.dataSource.query(summaryQuery);

    // Get top services
    const topServicesQuery = `
      SELECT 
        s.name as serviceName,
        COALESCE(SUM(CAST(si.price AS DECIMAL) * si.quantity), 0) as revenue,
        COUNT(*) as count
      FROM sales sa
      JOIN sale_items si ON sa.id = si.sale_id
      JOIN services s ON si.service_id = s.id
      WHERE sa.status = 'completed' ${whereClause}
      GROUP BY s.id, s.name
      ORDER BY revenue DESC
      LIMIT 5
    `;

    const topServices = await this.dataSource.query(topServicesQuery);

    // Get top staff
    const topStaffQuery = `
      SELECT 
        CONCAT(st.first_name, ' ', st.last_name) as staffName,
        COALESCE(SUM(CAST(sa.total AS DECIMAL)), 0) as revenue,
        COUNT(*) as count
      FROM sales sa
      JOIN sale_items si ON sa.id = si.sale_id
      JOIN staff st ON si.staff_id = st.id
      WHERE sa.status = 'completed' ${whereClause}
      GROUP BY st.id, st.first_name, st.last_name
      ORDER BY revenue DESC
      LIMIT 5
    `;

    const topStaff = await this.dataSource.query(topStaffQuery);

    return {
      period: `${startDate || 'All time'} - ${endDate || 'Present'}`,
      totalRevenue: parseFloat(summary[0]?.totalRevenue) || 0,
      totalTransactions: parseInt(summary[0]?.totalTransactions) || 0,
      averageTicket: parseFloat(summary[0]?.averageTicket) || 0,
      topServices: topServices.map((item: any) => ({
        serviceName: item.serviceName,
        revenue: parseFloat(item.revenue),
        count: parseInt(item.count)
      })),
      topStaff: topStaff.map((item: any) => ({
        staffName: item.staffName,
        revenue: parseFloat(item.revenue),
        count: parseInt(item.count)
      }))
    };
  }

  async getClientReport(filters: ReportFilters = {}): Promise<ClientReport> {
    const { startDate, endDate } = filters;
    const whereClause = this.buildWhereClause(filters);

    // Get total clients
    const totalClientsQuery = `
      SELECT COUNT(*) as totalClients
      FROM clients
      WHERE is_active = true
    `;

    const totalClients = await this.dataSource.query(totalClientsQuery);

    // Get new clients in period
    const newClientsQuery = `
      SELECT COUNT(*) as newClients
      FROM clients
      WHERE is_active = true ${whereClause.replace('sales', 'clients').replace('status = \'completed\'', '')}
    `;

    const newClients = await this.dataSource.query(newClientsQuery);

    // Get returning clients
    const returningClientsQuery = `
      SELECT COUNT(DISTINCT sa.client_id) as returningClients
      FROM sales sa
      WHERE sa.status = 'completed' ${whereClause}
    `;

    const returningClients = await this.dataSource.query(returningClientsQuery);

    // Get average spend per client
    const averageSpendQuery = `
      SELECT COALESCE(AVG(CAST(sa.total AS DECIMAL)), 0) as averageSpend
      FROM sales sa
      WHERE sa.status = 'completed' ${whereClause}
    `;

    const averageSpend = await this.dataSource.query(averageSpendQuery);

    // Get top clients
    const topClientsQuery = `
      SELECT 
        CONCAT(c.first_name, ' ', c.last_name) as clientName,
        COALESCE(SUM(CAST(sa.total AS DECIMAL)), 0) as totalSpend,
        COUNT(*) as visitCount
      FROM sales sa
      JOIN clients c ON sa.client_id = c.id
      WHERE sa.status = 'completed' ${whereClause}
      GROUP BY c.id, c.first_name, c.last_name
      ORDER BY totalSpend DESC
      LIMIT 10
    `;

    const topClients = await this.dataSource.query(topClientsQuery);

    return {
      totalClients: parseInt(totalClients[0]?.totalClients) || 0,
      newClients: parseInt(newClients[0]?.newClients) || 0,
      returningClients: parseInt(returningClients[0]?.returningClients) || 0,
      averageSpend: parseFloat(averageSpend[0]?.averageSpend) || 0,
      topClients: topClients.map((item: any) => ({
        clientName: item.clientName,
        totalSpend: parseFloat(item.totalSpend),
        visitCount: parseInt(item.visitCount)
      }))
    };
  }

  async getStaffReport(filters: ReportFilters = {}): Promise<StaffReport> {
    const { startDate, endDate } = filters;
    const whereClause = this.buildWhereClause(filters);

    // Get total and active staff
    const staffStatsQuery = `
      SELECT 
        COUNT(*) as totalStaff,
        COUNT(CASE WHEN is_active = true THEN 1 END) as activeStaff
      FROM staff
    `;

    const staffStats = await this.dataSource.query(staffStatsQuery);

    // Get top performers
    const topPerformersQuery = `
      SELECT 
        CONCAT(st.first_name, ' ', st.last_name) as staffName,
        COALESCE(SUM(CAST(sa.total AS DECIMAL)), 0) as revenue,
        COUNT(*) as appointmentCount,
        COALESCE(AVG(CAST(a.rating AS DECIMAL)), 0) as averageRating
      FROM staff st
      LEFT JOIN sale_items si ON st.id = si.staff_id
      LEFT JOIN sales sa ON si.sale_id = sa.id AND sa.status = 'completed' ${whereClause}
      LEFT JOIN appointments a ON st.id = a.staff_id AND a.status = 'completed' ${whereClause}
      WHERE st.is_active = true
      GROUP BY st.id, st.first_name, st.last_name
      ORDER BY revenue DESC
      LIMIT 10
    `;

    const topPerformers = await this.dataSource.query(topPerformersQuery);

    return {
      totalStaff: parseInt(staffStats[0]?.totalStaff) || 0,
      activeStaff: parseInt(staffStats[0]?.activeStaff) || 0,
      topPerformers: topPerformers.map((item: any) => ({
        staffName: item.staffName,
        revenue: parseFloat(item.revenue),
        appointmentCount: parseInt(item.appointmentCount),
        averageRating: parseFloat(item.averageRating)
      }))
    };
  }

  private buildWhereClause(filters: ReportFilters): string {
    let whereClause = '';
    
    if (filters.startDate) {
      whereClause += ` AND completed_at >= '${filters.startDate}'`;
    }
    
    if (filters.endDate) {
      whereClause += ` AND completed_at <= '${filters.endDate}'`;
    }
    
    if (filters.staffId) {
      whereClause += ` AND EXISTS (SELECT 1 FROM sale_items si WHERE si.sale_id = sales.id AND si.staff_id = '${filters.staffId}')`;
    }
    
    if (filters.clientId) {
      whereClause += ` AND client_id = '${filters.clientId}'`;
    }
    
    if (filters.serviceId) {
      whereClause += ` AND EXISTS (SELECT 1 FROM sale_items si WHERE si.sale_id = sales.id AND si.service_id = '${filters.serviceId}')`;
    }
    
    return whereClause;
  }
}
