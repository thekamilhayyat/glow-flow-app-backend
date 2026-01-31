import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, AppointmentStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Sales Report - Aggregates from Payment table
   * Returns totalRevenue, totalTransactions, averageTicket
   */
  async getSalesReport(salonId: string, startDate?: string, endDate?: string) {
    const where: any = {
      salonId,
      status: PaymentStatus.SUCCEEDED,
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // Use Prisma aggregate for efficient calculation
    const [aggregate, count] = await Promise.all([
      this.prisma.payment.aggregate({
        where,
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    const totalRevenue = aggregate._sum.amount
      ? Number(aggregate._sum.amount)
      : 0;
    const totalTransactions = count || 0;
    const averageTicket =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return {
      totalRevenue,
      totalTransactions,
      averageTicket,
    };
  }

  /**
   * Appointments Report - Aggregates from Appointment table
   * Returns total, completed, cancelled, noShow counts
   */
  async getAppointmentsReport(
    salonId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = {
      salonId,
    };

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.startTime.lte = end;
      }
    }

    // Use Prisma aggregate for efficient parallel counting
    const [total, completed, cancelled, noShow] = await Promise.all([
      this.prisma.appointment.count({ where }),
      this.prisma.appointment.count({
        where: {
          ...where,
          status: AppointmentStatus.COMPLETED,
        },
      }),
      this.prisma.appointment.count({
        where: {
          ...where,
          status: AppointmentStatus.CANCELLED,
        },
      }),
      this.prisma.appointment.count({
        where: {
          ...where,
          status: AppointmentStatus.NO_SHOW,
        },
      }),
    ]);

    return {
      total: total || 0,
      completed: completed || 0,
      cancelled: cancelled || 0,
      noShow: noShow || 0,
    };
  }

  /**
   * Inventory Report - Aggregates from Product table
   * Returns lowStock, outOfStock, totalProducts counts
   */
  async getInventoryReport(salonId: string) {
    const where: any = {
      salonId,
      isActive: true,
    };

    // Use Prisma aggregate for efficient counting
    const [totalProducts, lowStockCount, outOfStockCount] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.count({
        where: {
          ...where,
          stock: {
            lte: 10, // Default low stock threshold
            gt: 0,
          },
        },
      }),
      this.prisma.product.count({
        where: {
          ...where,
          stock: 0,
        },
      }),
    ]);

    return {
      lowStock: lowStockCount || 0,
      outOfStock: outOfStockCount || 0,
      totalProducts: totalProducts || 0,
    };
  }
}
