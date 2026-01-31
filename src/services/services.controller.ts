import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Services')
@Controller('services')
@ApiBearerAuth()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get services' })
  @ApiResponse({ status: 200 })
  async getServices(@Query() query: any): Promise<PaginatedResponseDto<any>> {
    return await this.servicesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiResponse({ status: 200 })
  async getService(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    return await this.servicesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create service' })
  @ApiResponse({ status: 201 })
  async createService(@Body() body: any): Promise<SuccessResponseDto<any>> {
    return await this.servicesService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update service' })
  @ApiResponse({ status: 200 })
  async updateService(
    @Param('id') id: string,
    @Body() body: any,
  ): Promise<SuccessResponseDto<any>> {
    return await this.servicesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete service' })
  @ApiResponse({ status: 200 })
  async deleteService(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    return await this.servicesService.remove(id);
  }
}
