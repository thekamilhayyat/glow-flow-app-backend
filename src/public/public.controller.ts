import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator';
import { SettingsService } from '../settings/settings.service';
import { PublicSettingsResponseDto } from '../settings/dto/public-settings-response.dto';
import { SuccessResponseDto } from '../common/dto/success-response.dto';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Throttle({ public: { limit: 20, ttl: 60000 } })
  @Get('salons/:slug/settings')
  @ApiOperation({ summary: 'Get public salon settings by slug' })
  @ApiResponse({ status: 200, type: PublicSettingsResponseDto })
  async getPublicSettings(
    @Param('slug') slug: string,
  ): Promise<SuccessResponseDto<PublicSettingsResponseDto>> {
    const settings = await this.settingsService.getPublicSettings(slug);
    return { data: settings };
  }
}
