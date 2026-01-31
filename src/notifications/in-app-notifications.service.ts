import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

interface CreateNotificationParams {
  salonId: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  entityId?: string;
}

@Injectable()
export class InAppNotificationsService {
  constructor(private prisma: PrismaService) {}

  async createNotification(params: CreateNotificationParams) {
    return await this.prisma.notification.create({
      data: {
        salonId: params.salonId,
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        entityId: params.entityId,
      },
    });
  }

  async getNotifications(salonId: string, limit: number = 20) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        salonId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return {
      data: notifications.map((n) => ({
        ...n,
        userId: n.userId || undefined,
        entityId: n.entityId || undefined,
      })),
    };
  }

  async markAsRead(salonId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        salonId,
      },
    });

    if (!notification) {
      return null;
    }

    return await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }
}
