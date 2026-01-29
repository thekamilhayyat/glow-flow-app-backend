import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Query, 
  Body, 
  UseGuards 
} from '@nestjs/common';
import { SalesService, SaleFilters } from './sales.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../database/entities/users.entity';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff, UserRole.receptionist)
  async findAll(@Query() filters: SaleFilters) {
    return this.salesService.findAll(filters);
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff, UserRole.receptionist)
  async findOne(@Param('id') id: string) {
    const sale = await this.salesService.findOne(id);
    return { sale };
  }

  @Post()
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff, UserRole.receptionist)
  async create(@Body() saleData: any) {
    const sale = await this.salesService.create(saleData);
    return { sale };
  }

  @Put(':id')
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff, UserRole.receptionist)
  async update(@Param('id') id: string, @Body() saleData: any) {
    const sale = await this.salesService.update(id, saleData);
    return { sale };
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.manager)
  async remove(@Param('id') id: string) {
    await this.salesService.remove(id);
    return { message: 'Sale deleted successfully' };
  }

  @Post(':id/refund')
  @Roles(UserRole.admin, UserRole.manager)
  async refund(@Param('id') id: string, @Body() refundData: { amount: number; reason: string }) {
    const sale = await this.salesService.refund(id, refundData);
    return { sale };
  }
}
