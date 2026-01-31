import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalonDto } from './dto/create-salon.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class SalonsService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.salon.findUnique({
        where: { slug },
      });

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  private getDefaultBusinessHours() {
    return {
      monday: { open: '09:00', close: '18:00', isClosed: false },
      tuesday: { open: '09:00', close: '18:00', isClosed: false },
      wednesday: { open: '09:00', close: '18:00', isClosed: false },
      thursday: { open: '09:00', close: '18:00', isClosed: false },
      friday: { open: '09:00', close: '18:00', isClosed: false },
      saturday: { open: '09:00', close: '17:00', isClosed: false },
      sunday: { isClosed: true },
    };
  }

  private getDefaultEmailNotifications() {
    return {
      appointmentConfirmation: true,
      appointmentReminder: true,
      appointmentCancellation: true,
      newBooking: true,
      paymentReceipt: true,
    };
  }

  private getDefaultSmsNotifications() {
    return {
      appointmentReminder: false,
      appointmentConfirmation: false,
    };
  }

  async createSalon(userId: string, createSalonDto: CreateSalonDto) {
    const baseSlug = this.generateSlug(createSalonDto.name);
    const slug = await this.ensureUniqueSlug(baseSlug);

    return await this.prisma.$transaction(async (tx) => {
      const salon = await tx.salon.create({
        data: {
          name: createSalonDto.name,
          slug,
          ownerId: userId,
        },
      });

      await tx.salonMember.create({
        data: {
          salonId: salon.id,
          userId,
          role: UserRole.SALON_OWNER,
        },
      });

      await tx.salonSettings.create({
        data: {
          salonId: salon.id,
          businessName: createSalonDto.name,
          businessHours: this.getDefaultBusinessHours(),
          bookingAdvanceDays: 90,
          bookingCancellationHours: 24,
          allowOnlineBooking: true,
          requireConfirmation: false,
          autoConfirm: false,
          bufferTimeMinutes: 15,
          taxEnabled: false,
          taxRate: 0,
          taxIncluded: false,
          requireDeposit: false,
          depositAmount: 0,
          depositPercentage: 0,
          emailNotifications: this.getDefaultEmailNotifications(),
          smsNotifications: this.getDefaultSmsNotifications(),
          primaryColor: '#007bff',
          secondaryColor: '#6c757d',
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { currentSalonId: salon.id },
      });

      return salon;
    });
  }

  async getSalonById(salonId: string) {
    return await this.prisma.salon.findUnique({
      where: { id: salonId },
    });
  }

  async getUserSalons(userId: string) {
    const memberships = await this.prisma.salonMember.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        salon: true,
      },
    });

    return memberships.map((m) => m.salon);
  }
}
