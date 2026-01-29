import { 
  Controller, 
  Get, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { ReportsService, ReportFilters } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../database/entities/users.entity';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @Roles(UserRole.admin, UserRole.manager)
  async getSalesReport(@Query() filters: ReportFilters) {
    const report = await this.reportsService.getSalesReport(filters);
    return { report };
  }

  @Get('clients')
  @Roles(UserRole.admin, UserRole.manager)
  async getClientReport(@Query() filters: ReportFilters) {
    const report = await this.reportsService.getClientReport(filters);
    return { report };
  }

  @Get('staff')
  @Roles(UserRole.admin, UserRole.manager)
  async getStaffReport(@Query() filters: ReportFilters) {
    const report = await this.reportsService.getStaffReport(filters);
    return { report };
  }
}
