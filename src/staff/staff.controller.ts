import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Staff')
@Controller('staff')
@ApiBearerAuth()
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @ApiOperation({ summary: 'Get staff members' })
  @ApiResponse({ status: 200 })
  async getStaff(@Query() query: any): Promise<PaginatedResponseDto<any>> {
    return await this.staffService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get staff member by ID' })
  @ApiResponse({ status: 200 })
  async getStaffMember(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    return await this.staffService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create staff member' })
  @ApiResponse({ status: 201 })
  async createStaff(@Body() body: any): Promise<SuccessResponseDto<any>> {
    return await this.staffService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update staff member' })
  @ApiResponse({ status: 200 })
  async updateStaff(
    @Param('id') id: string,
    @Body() body: any,
  ): Promise<SuccessResponseDto<any>> {
    return await this.staffService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete staff member' })
  @ApiResponse({ status: 200 })
  async deleteStaff(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    return await this.staffService.remove(id);
  }
}
