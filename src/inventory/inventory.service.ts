import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { NotificationType } from '@prisma/client';
import { InAppNotificationsService } from '../notifications/in-app-notifications.service';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => InAppNotificationsService))
    private notificationsService: InAppNotificationsService,
  ) {}

  async findAll(salonId: string, query: any) {
    const where: any = { salonId };

    if (query.category) {
      where.category = query.category;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit ? parseInt(query.limit) : undefined,
        skip: query.skip ? parseInt(query.skip) : undefined,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((p) => ({
        ...p,
        price: Number(p.price),
        cost: p.cost ? Number(p.cost) : undefined,
        description: p.description || undefined,
        sku: p.sku || undefined,
        category: p.category || undefined,
      })),
      meta: {
        total,
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : total,
      },
    };
  }

  async findOne(salonId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        salonId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      ...product,
      price: Number(product.price),
      cost: product.cost ? Number(product.cost) : undefined,
      description: product.description || undefined,
      sku: product.sku || undefined,
      category: product.category || undefined,
    };
  }

  async create(salonId: string, createDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        salonId,
        name: createDto.name,
        description: createDto.description,
        sku: createDto.sku,
        price: new Decimal(createDto.price),
        cost: createDto.cost ? new Decimal(createDto.cost) : null,
        stock: createDto.stock,
        category: createDto.category,
        isActive: createDto.isActive !== undefined ? createDto.isActive : true,
      },
    });

    return {
      ...product,
      price: Number(product.price),
      cost: product.cost ? Number(product.cost) : undefined,
      description: product.description || undefined,
      sku: product.sku || undefined,
      category: product.category || undefined,
    };
  }

  async update(salonId: string, id: string, updateDto: UpdateProductDto) {
    const existing = await this.prisma.product.findFirst({
      where: { id, salonId },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const updateData: any = {};

    if (updateDto.name !== undefined) updateData.name = updateDto.name;
    if (updateDto.description !== undefined) updateData.description = updateDto.description;
    if (updateDto.sku !== undefined) updateData.sku = updateDto.sku;
    if (updateDto.price !== undefined) updateData.price = new Decimal(updateDto.price);
    if (updateDto.cost !== undefined) updateData.cost = updateDto.cost ? new Decimal(updateDto.cost) : null;
    if (updateDto.stock !== undefined) updateData.stock = updateDto.stock;
    if (updateDto.category !== undefined) updateData.category = updateDto.category;
    if (updateDto.isActive !== undefined) updateData.isActive = updateDto.isActive;

    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
    });

    return {
      ...product,
      price: Number(product.price),
      cost: product.cost ? Number(product.cost) : undefined,
      description: product.description || undefined,
      sku: product.sku || undefined,
      category: product.category || undefined,
    };
  }

  async adjustStock(salonId: string, id: string, adjustDto: AdjustStockDto) {
    const product = await this.prisma.product.findFirst({
      where: { id, salonId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const newStock = product.stock + adjustDto.quantity;

    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    const wasAboveThreshold = product.stock > 10;
    const isNowBelowThreshold = newStock <= 10;

    const updated = await this.prisma.product.update({
      where: { id },
      data: { stock: newStock },
    });

    if (wasAboveThreshold && isNowBelowThreshold) {
      await this.notificationsService.createNotification({
        salonId,
        type: NotificationType.LOW_STOCK,
        title: 'Low stock alert',
        message: `${product.name} stock is low (${newStock} remaining)`,
        entityId: product.id,
      });
    }

    return {
      ...updated,
      price: Number(updated.price),
      cost: updated.cost ? Number(updated.cost) : undefined,
      description: updated.description || undefined,
      sku: updated.sku || undefined,
      category: updated.category || undefined,
    };
  }

  async getLowStock(salonId: string, threshold: number = 10) {
    const products = await this.prisma.product.findMany({
      where: {
        salonId,
        isActive: true,
        stock: {
          lte: threshold,
        },
      },
      orderBy: {
        stock: 'asc',
      },
    });

    return {
      data: products.map((p) => ({
        ...p,
        price: Number(p.price),
        cost: p.cost ? Number(p.cost) : undefined,
        description: p.description || undefined,
        sku: p.sku || undefined,
        category: p.category || undefined,
      })),
      meta: {
        threshold,
        count: products.length,
      },
    };
  }

  async remove(salonId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, salonId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { success: true };
  }
}
