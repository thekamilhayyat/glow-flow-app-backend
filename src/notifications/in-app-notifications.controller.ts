import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InAppNotificationsService } from './in-app-notifications.service';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { CurrentSalon } from '../common/decorators/current-salon.decorator';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Notifications')
@Controller('notifications')
@ApiBearerAuth()
export class InAppNotificationsController {
  constructor(private readonly notificationsService: InAppNotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications' })
  @ApiResponse({ status: 200, type: [NotificationResponseDto] })
  async getNotifications(
    @CurrentSalon() salonId: string,
  ): Promise<PaginatedResponseDto<NotificationResponseDto>> {
    return await this.notificationsService.getNotifications(salonId, 20);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200 })
  async markAsRead(
    @CurrentSalon() salonId: string,
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<any>> {
    const result = await this.notificationsService.markAsRead(salonId, id);
    return { data: result || { success: true } };
  }
}
