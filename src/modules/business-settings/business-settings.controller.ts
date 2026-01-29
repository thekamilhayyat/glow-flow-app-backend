import { 
  Controller, 
  Get, 
  Put, 
  Body, 
  UseGuards 
} from '@nestjs/common';
import { BusinessSettingsService } from './business-settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../database/entities/users.entity';

@Controller('business-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BusinessSettingsController {
  constructor(private readonly businessSettingsService: BusinessSettingsService) {}

  @Get()
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff, UserRole.receptionist)
  async getSettings() {
    const settings = await this.businessSettingsService.getSettings();
    return { settings };
  }

  @Put()
  @Roles(UserRole.admin, UserRole.manager)
  async updateSettings(@Body() settingsData: any) {
    const settings = await this.businessSettingsService.updateSettings(settingsData);
    return { settings };
  }
}
