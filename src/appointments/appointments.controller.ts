import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CurrentSalon } from '../common/decorators/current-salon.decorator';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Appointments')
@Controller('appointments')
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get appointments' })
  @ApiResponse({ status: 200 })
  async getAppointments(@Query() query: any): Promise<PaginatedResponseDto<any>> {
    return await this.appointmentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({ status: 200 })
  async getAppointment(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    return await this.appointmentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create appointment' })
  @ApiResponse({ status: 201 })
  async createAppointment(
    @CurrentSalon() salonId: string,
    @Body() body: any,
  ): Promise<SuccessResponseDto<any>> {
    return await this.appointmentsService.create(salonId, body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update appointment' })
  @ApiResponse({ status: 200 })
  async updateAppointment(
    @Param('id') id: string,
    @Body() body: any,
  ): Promise<SuccessResponseDto<any>> {
    return await this.appointmentsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel appointment' })
  @ApiResponse({ status: 200 })
  async cancelAppointment(
    @CurrentSalon() salonId: string,
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<any>> {
    return await this.appointmentsService.remove(salonId, id);
  }
}
