import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    return { data: [], meta: { total: 0 } };
  }

  async findOne(id: string) {
    return { data: {} };
  }

  async create(data: any) {
    return { data: {} };
  }

  async update(id: string, data: any) {
    return { data: {} };
  }

  async remove(id: string) {
    return { data: { success: true } };
  }
}
