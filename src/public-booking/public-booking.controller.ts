import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PublicBookingService } from './public-booking.service';
import { Public } from '../common/decorators/public.decorator';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Public Booking')
@Controller('public/booking')
export class PublicBookingController {
  constructor(private readonly publicBookingService: PublicBookingService) {}

  @Public()
  @Throttle({ public: { limit: 20, ttl: 60000 } })
  @Get('salons/:slug/availability')
  @ApiOperation({ summary: 'Get available time slots' })
  @ApiResponse({ status: 200 })
  async getAvailability(
    @Param('slug') slug: string,
    @Query() query: any,
  ): Promise<SuccessResponseDto<any>> {
    return await this.publicBookingService.getAvailability(slug, query);
  }

  @Public()
  @Throttle({ public: { limit: 20, ttl: 60000 } })
  @Get('salons/:slug/services')
  @ApiOperation({ summary: 'Get available services' })
  @ApiResponse({ status: 200 })
  async getServices(
    @Param('slug') slug: string,
  ): Promise<PaginatedResponseDto<any>> {
    return await this.publicBookingService.getServices(slug);
  }

  @Public()
  @Throttle({ public: { limit: 20, ttl: 60000 } })
  @Post('salons/:slug/book')
  @ApiOperation({ summary: 'Create booking' })
  @ApiResponse({ status: 201 })
  async createBooking(
    @Param('slug') slug: string,
    @Body() body: any,
  ): Promise<SuccessResponseDto<any>> {
    return await this.publicBookingService.createBooking(slug, body);
  }
}
