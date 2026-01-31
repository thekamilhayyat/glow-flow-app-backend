import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientPortalService } from './client-portal.service';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Client Portal')
@Controller('client-portal')
@ApiBearerAuth()
export class ClientPortalController {
  constructor(private readonly clientPortalService: ClientPortalService) {}

  @Get('appointments')
  @ApiOperation({ summary: 'Get client appointments' })
  @ApiResponse({ status: 200 })
  async getAppointments(@Query() query: any): Promise<PaginatedResponseDto<any>> {
    return await this.clientPortalService.getAppointments(query);
  }

  @Get('appointments/:id')
  @ApiOperation({ summary: 'Get appointment details' })
  @ApiResponse({ status: 200 })
  async getAppointment(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    return await this.clientPortalService.getAppointment(id);
  }

  @Post('appointments')
  @ApiOperation({ summary: 'Book appointment' })
  @ApiResponse({ status: 201 })
  async bookAppointment(@Body() body: any): Promise<SuccessResponseDto<any>> {
    return await this.clientPortalService.bookAppointment(body);
  }

  @Put('appointments/:id/cancel')
  @ApiOperation({ summary: 'Cancel appointment' })
  @ApiResponse({ status: 200 })
  async cancelAppointment(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    return await this.clientPortalService.cancelAppointment(id);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get client profile' })
  @ApiResponse({ status: 200 })
  async getProfile(): Promise<SuccessResponseDto<any>> {
    return await this.clientPortalService.getProfile();
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update client profile' })
  @ApiResponse({ status: 200 })
  async updateProfile(@Body() body: any): Promise<SuccessResponseDto<any>> {
    return await this.clientPortalService.updateProfile(body);
  }
}
