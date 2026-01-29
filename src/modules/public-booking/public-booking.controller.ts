import { Controller, Get, Param, Query } from '@nestjs/common';

@Controller('public')
export class PublicBookingController {
  @Get('business/:businessId/services')
  listServices(@Param('businessId') businessId: string) {
    return { businessId, data: [] };
  }

  @Get('business/:businessId/availability')
  availability(
    @Param('businessId') businessId: string,
    @Query('serviceIds') serviceIds?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return { businessId, serviceIds, startDate, endDate, slots: [] };
  }
}


