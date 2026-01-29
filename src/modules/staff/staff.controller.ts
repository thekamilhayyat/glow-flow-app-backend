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
import { StaffService, StaffFilters } from './staff.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../database/entities/users.entity';

@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff, UserRole.receptionist)
  async findAll(@Query() filters: StaffFilters) {
    return { data: await this.staffService.findAll(filters) };
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff, UserRole.receptionist)
  async findOne(@Param('id') id: string) {
    const staff = await this.staffService.findOne(id);
    return { staff };
  }

  @Post()
  @Roles(UserRole.admin, UserRole.manager)
  async create(@Body() staffData: any) {
    return this.staffService.create(staffData);
  }

  @Put(':id')
  @Roles(UserRole.admin, UserRole.manager)
  async update(@Param('id') id: string, @Body() staffData: any) {
    return this.staffService.update(id, staffData);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.manager)
  async remove(@Param('id') id: string) {
    await this.staffService.remove(id);
    return { message: 'Staff member deleted successfully' };
  }

  @Get(':id/availability')
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff, UserRole.receptionist)
  async getAvailability(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('duration') duration?: number
  ) {
    return this.staffService.getAvailability(id, startDate, endDate, duration);
  }
}
