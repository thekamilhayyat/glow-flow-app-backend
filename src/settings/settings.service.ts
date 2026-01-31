import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { EncryptionService } from '../common/services/encryption.service';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  async getSettings(salonId: string) {
    const settings = await this.prisma.salonSettings.findUnique({
      where: { salonId },
    });

    if (!settings) {
      throw new NotFoundException('Settings not found for this salon');
    }

    const result: any = { ...settings };
    result.integrationSettings = result.integrationSettings ? '[ENCRYPTED]' : null;

    return result;
  }

  async getDecryptedIntegrationSettings(salonId: string): Promise<string | null> {
    const settings = await this.prisma.salonSettings.findUnique({
      where: { salonId },
      select: { integrationSettings: true },
    });

    if (!settings || !settings.integrationSettings) {
      return null;
    }

    try {
      return this.encryptionService.decrypt(settings.integrationSettings);
    } catch {
      return null;
    }
  }

  async updateSettings(salonId: string, updateDto: UpdateSettingsDto) {
    const existingSettings = await this.prisma.salonSettings.findUnique({
      where: { salonId },
    });

    if (!existingSettings) {
      throw new NotFoundException('Settings not found for this salon');
    }

    const updateData: any = {};

    if (updateDto.businessName !== undefined) updateData.businessName = updateDto.businessName;
    if (updateDto.businessEmail !== undefined) updateData.businessEmail = updateDto.businessEmail;
    if (updateDto.businessPhone !== undefined) updateData.businessPhone = updateDto.businessPhone;
    if (updateDto.businessAddress !== undefined)
      updateData.businessAddress = updateDto.businessAddress;
    if (updateDto.businessCity !== undefined) updateData.businessCity = updateDto.businessCity;
    if (updateDto.businessState !== undefined) updateData.businessState = updateDto.businessState;
    if (updateDto.businessZip !== undefined) updateData.businessZip = updateDto.businessZip;
    if (updateDto.businessCountry !== undefined)
      updateData.businessCountry = updateDto.businessCountry;
    if (updateDto.businessWebsite !== undefined)
      updateData.businessWebsite = updateDto.businessWebsite;
    if (updateDto.businessLogo !== undefined) updateData.businessLogo = updateDto.businessLogo;

    if (updateDto.businessHours !== undefined) updateData.businessHours = updateDto.businessHours;

    if (updateDto.bookingAdvanceDays !== undefined)
      updateData.bookingAdvanceDays = updateDto.bookingAdvanceDays;
    if (updateDto.bookingCancellationHours !== undefined)
      updateData.bookingCancellationHours = updateDto.bookingCancellationHours;
    if (updateDto.allowOnlineBooking !== undefined)
      updateData.allowOnlineBooking = updateDto.allowOnlineBooking;
    if (updateDto.requireConfirmation !== undefined)
      updateData.requireConfirmation = updateDto.requireConfirmation;
    if (updateDto.autoConfirm !== undefined) updateData.autoConfirm = updateDto.autoConfirm;
    if (updateDto.bufferTimeMinutes !== undefined)
      updateData.bufferTimeMinutes = updateDto.bufferTimeMinutes;

    if (updateDto.taxEnabled !== undefined) updateData.taxEnabled = updateDto.taxEnabled;
    if (updateDto.taxRate !== undefined)
      updateData.taxRate = new Decimal(updateDto.taxRate.toString());
    if (updateDto.taxIncluded !== undefined) updateData.taxIncluded = updateDto.taxIncluded;

    if (updateDto.paymentMethods !== undefined)
      updateData.paymentMethods = updateDto.paymentMethods;
    if (updateDto.requireDeposit !== undefined)
      updateData.requireDeposit = updateDto.requireDeposit;
    if (updateDto.depositAmount !== undefined)
      updateData.depositAmount = new Decimal(updateDto.depositAmount.toString());
    if (updateDto.depositPercentage !== undefined)
      updateData.depositPercentage = new Decimal(updateDto.depositPercentage.toString());

    if (updateDto.emailNotifications !== undefined)
      updateData.emailNotifications = updateDto.emailNotifications;
    if (updateDto.smsNotifications !== undefined)
      updateData.smsNotifications = updateDto.smsNotifications;

    if (updateDto.primaryColor !== undefined) updateData.primaryColor = updateDto.primaryColor;
    if (updateDto.secondaryColor !== undefined)
      updateData.secondaryColor = updateDto.secondaryColor;
    if (updateDto.logoUrl !== undefined) updateData.logoUrl = updateDto.logoUrl;
    if (updateDto.faviconUrl !== undefined) updateData.faviconUrl = updateDto.faviconUrl;

    if (updateDto.integrationSettings !== undefined) {
      updateData.integrationSettings = this.encryptionService.encrypt(
        updateDto.integrationSettings,
      );
    }

    if (updateDto.additionalSettings !== undefined)
      updateData.additionalSettings = updateDto.additionalSettings;

    const updated = await this.prisma.salonSettings.update({
      where: { salonId },
      data: updateData,
    });

    const result: any = { ...updated };
    result.integrationSettings = result.integrationSettings ? '[ENCRYPTED]' : null;

    return result;
  }

  async getPublicSettings(salonSlug: string) {
    const salon = await this.prisma.salon.findUnique({
      where: { slug: salonSlug },
      include: { settings: true },
    });

    if (!salon || !salon.settings) {
      throw new NotFoundException('Salon or settings not found');
    }

    const settings = salon.settings;

    return {
      businessName: settings.businessName || undefined,
      businessEmail: settings.businessEmail || undefined,
      businessPhone: settings.businessPhone || undefined,
      businessAddress: settings.businessAddress || undefined,
      businessCity: settings.businessCity || undefined,
      businessState: settings.businessState || undefined,
      businessZip: settings.businessZip || undefined,
      businessCountry: settings.businessCountry || undefined,
      businessWebsite: settings.businessWebsite || undefined,
      businessLogo: settings.businessLogo || undefined,
      businessHours: settings.businessHours,
      allowOnlineBooking: settings.allowOnlineBooking || undefined,
      bookingAdvanceDays: settings.bookingAdvanceDays || undefined,
      bookingCancellationHours: settings.bookingCancellationHours || undefined,
      bufferTimeMinutes: settings.bufferTimeMinutes || undefined,
      primaryColor: settings.primaryColor || undefined,
      secondaryColor: settings.secondaryColor || undefined,
      logoUrl: settings.logoUrl || undefined,
      faviconUrl: settings.faviconUrl || undefined,
    };
  }
}
