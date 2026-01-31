import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CurrentSalon } from '../common/decorators/current-salon.decorator';
import { SuccessResponseDto } from '../common/dto/success-response.dto';

@ApiTags('Reports')
@Controller('reports')
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @ApiOperation({ summary: 'Get sales report' })
  @ApiResponse({
    status: 200,
    description: 'Sales report with revenue, transactions, and average ticket',
  })
  async getSalesReport(
    @CurrentSalon() salonId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.reportsService.getSalesReport(
      salonId,
      startDate,
      endDate,
    );
    return { data: result };
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Get appointments report' })
  @ApiResponse({
    status: 200,
    description: 'Appointments report with status counts',
  })
  async getAppointmentsReport(
    @CurrentSalon() salonId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.reportsService.getAppointmentsReport(
      salonId,
      startDate,
      endDate,
    );
    return { data: result };
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory report' })
  @ApiResponse({
    status: 200,
    description: 'Inventory report with stock status counts',
  })
  async getInventoryReport(
    @CurrentSalon() salonId: string,
  ) {
    const result = await this.reportsService.getInventoryReport(salonId);
    return { data: result };
  }
}
