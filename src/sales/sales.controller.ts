import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Sales')
@Controller('sales')
@ApiBearerAuth()
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @ApiOperation({ summary: 'Get sales' })
  @ApiResponse({ status: 200 })
  async getSales(@Query() query: any): Promise<PaginatedResponseDto<any>> {
    return await this.salesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sale by ID' })
  @ApiResponse({ status: 200 })
  async getSale(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    return await this.salesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create sale' })
  @ApiResponse({ status: 201 })
  async createSale(@Body() body: any): Promise<SuccessResponseDto<any>> {
    return await this.salesService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update sale' })
  @ApiResponse({ status: 200 })
  async updateSale(
    @Param('id') id: string,
    @Body() body: any,
  ): Promise<SuccessResponseDto<any>> {
    return await this.salesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Refund sale' })
  @ApiResponse({ status: 200 })
  async refundSale(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    return await this.salesService.remove(id);
  }
}
