import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Clients')
@Controller('clients')
@ApiBearerAuth()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'Get clients' })
  @ApiResponse({ status: 200 })
  async getClients(@Query() query: any): Promise<PaginatedResponseDto<any>> {
    return await this.clientsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client by ID' })
  @ApiResponse({ status: 200 })
  async getClient(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    return await this.clientsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create client' })
  @ApiResponse({ status: 201 })
  async createClient(@Body() body: any): Promise<SuccessResponseDto<any>> {
    return await this.clientsService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update client' })
  @ApiResponse({ status: 200 })
  async updateClient(
    @Param('id') id: string,
    @Body() body: any,
  ): Promise<SuccessResponseDto<any>> {
    return await this.clientsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete client' })
  @ApiResponse({ status: 200 })
  async deleteClient(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    return await this.clientsService.remove(id);
  }
}
