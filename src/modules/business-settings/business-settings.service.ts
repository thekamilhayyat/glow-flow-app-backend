import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessSettingsEntity } from '../../database/entities/business_settings.entity';

@Injectable()
export class BusinessSettingsService {
  constructor(
    @InjectRepository(BusinessSettingsEntity)
    private readonly businessSettingsRepository: Repository<BusinessSettingsEntity>
  ) {}

  async getSettings(): Promise<BusinessSettingsEntity> {
    let settings = await this.businessSettingsRepository.findOne({ where: { id: 1 } });
    
    if (!settings) {
      // Create default settings if none exist
      settings = this.businessSettingsRepository.create({
        id: 1,
        businessName: 'Glowdesk Salon',
        businessEmail: 'info@glowdesk.com',
        businessPhone: '+1-555-0123',
        businessAddress: '123 Main St, City, State 12345',
        timezone: 'America/New_York',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        settings: {
          appointmentDuration: 60,
          bufferTime: 15,
          advanceBookingDays: 30,
          cancellationPolicy: '24 hours',
          noShowPolicy: 'Charge 50%',
          allowOnlineBooking: true,
          requireDeposit: false,
          depositAmount: 0,
          taxRate: 0.08,
          serviceChargeRate: 0.0,
          tipEnabled: true,
          smsNotifications: true,
          emailNotifications: true,
          reminderHours: 24,
          confirmationRequired: true,
          maxAppointmentsPerDay: 20,
          workingHours: {
            monday: { open: '09:00', close: '18:00', closed: false },
            tuesday: { open: '09:00', close: '18:00', closed: false },
            wednesday: { open: '09:00', close: '18:00', closed: false },
            thursday: { open: '09:00', close: '18:00', closed: false },
            friday: { open: '09:00', close: '18:00', closed: false },
            saturday: { open: '10:00', close: '16:00', closed: false },
            sunday: { open: '10:00', close: '16:00', closed: true }
          }
        }
      });
      settings = await this.businessSettingsRepository.save(settings);
    }
    
    return settings;
  }

  async updateSettings(settingsData: Partial<BusinessSettingsEntity>): Promise<BusinessSettingsEntity> {
    let settings = await this.businessSettingsRepository.findOne({ where: { id: 1 } });
    
    if (!settings) {
      settings = this.businessSettingsRepository.create({ id: 1, ...settingsData });
    } else {
      Object.assign(settings, settingsData);
    }
    
    return this.businessSettingsRepository.save(settings);
  }

  async getSettingValue(key: string): Promise<any> {
    const settings = await this.getSettings();
    return settings.settings?.[key];
  }

  async setSettingValue(key: string, value: any): Promise<BusinessSettingsEntity> {
    const settings = await this.getSettings();
    settings.settings = {
      ...settings.settings,
      [key]: value
    };
    return this.businessSettingsRepository.save(settings);
  }
}
