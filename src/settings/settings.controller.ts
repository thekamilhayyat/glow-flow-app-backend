import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsResponseDto } from './dto/settings-response.dto';
import { PublicSettingsResponseDto } from './dto/public-settings-response.dto';
import { CurrentSalon } from '../common/decorators/current-salon.decorator';
import { Public } from '../common/decorators/public.decorator';
import { SuccessResponseDto } from '../common/dto/success-response.dto';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get salon settings' })
  @ApiResponse({ status: 200, type: SettingsResponseDto })
  async getSettings(
    @CurrentSalon() salonId: string,
  ): Promise<SuccessResponseDto<SettingsResponseDto>> {
    const settings = await this.settingsService.getSettings(salonId);
    return { data: settings };
  }

  @Patch()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update salon settings' })
  @ApiResponse({ status: 200, type: SettingsResponseDto })
  async updateSettings(
    @CurrentSalon() salonId: string,
    @Body() updateDto: UpdateSettingsDto,
  ): Promise<SuccessResponseDto<SettingsResponseDto>> {
    const settings = await this.settingsService.updateSettings(salonId, updateDto);
    return { data: settings };
  }

}
