import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { InAppNotificationsService } from '../notifications/in-app-notifications.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => InAppNotificationsService))
    private notificationsService: InAppNotificationsService,
  ) {}

  async findAll(query: any) {
    return { data: [], meta: { total: 0 } };
  }

  async findOne(id: string) {
    return { data: {} };
  }

  async create(salonId: string, data: any) {
    const result = { data: {} };

    if (data.id) {
      await this.notificationsService.createNotification({
        salonId,
        type: NotificationType.APPOINTMENT_BOOKED,
        title: 'New appointment booked',
        message: 'A new appointment has been booked',
        entityId: data.id,
      });
    }

    return result;
  }

  async update(id: string, data: any) {
    return { data: {} };
  }

  async remove(salonId: string, id: string) {
    await this.notificationsService.createNotification({
      salonId,
      type: NotificationType.APPOINTMENT_CANCELLED,
      title: 'Appointment cancelled',
      message: 'An appointment has been cancelled',
      entityId: id,
    });

    return { data: { success: true } };
  }
}
