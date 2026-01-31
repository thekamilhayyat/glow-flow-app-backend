import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SalonsService } from './salons.service';
import { CreateSalonDto } from './dto/create-salon.dto';
import { SalonResponseDto } from './dto/salon-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Salons')
@Controller('salons')
@ApiBearerAuth()
export class SalonsController {
  constructor(private readonly salonsService: SalonsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new salon' })
  @ApiResponse({ status: 201, type: SalonResponseDto })
  async createSalon(
    @CurrentUser() user: any,
    @Body() createSalonDto: CreateSalonDto,
  ): Promise<SuccessResponseDto<SalonResponseDto>> {
    const salon = await this.salonsService.createSalon(user.userId, createSalonDto);
    return { data: salon };
  }

  @Get('my-salons')
  @ApiOperation({ summary: 'Get user salons' })
  @ApiResponse({ status: 200, type: [SalonResponseDto] })
  async getMySalons(
    @CurrentUser() user: any,
  ): Promise<PaginatedResponseDto<SalonResponseDto>> {
    const salons = await this.salonsService.getUserSalons(user.userId);
    return { data: salons };
  }
}
