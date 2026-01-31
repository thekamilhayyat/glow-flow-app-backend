import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicBookingService {
  constructor(private prisma: PrismaService) {}

  async getAvailability(slug: string, query: any) {
    return { data: { slots: [] } };
  }

  async getServices(slug: string) {
    return { data: [], meta: { total: 0 } };
  }

  async createBooking(slug: string, data: any) {
    return { data: {} };
  }
}
