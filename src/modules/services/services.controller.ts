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
import { ServicesService, ServiceFilters } from './services.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../database/entities/users.entity';

@Controller('services')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff, UserRole.receptionist)
  async findAll(@Query() filters: ServiceFilters) {
    return { data: await this.servicesService.findAll(filters) };
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff, UserRole.receptionist)
  async findOne(@Param('id') id: string) {
    const service = await this.servicesService.findOne(id);
    return { service };
  }

  @Post()
  @Roles(UserRole.admin, UserRole.manager)
  async create(@Body() serviceData: any) {
    return this.servicesService.create(serviceData);
  }

  @Put(':id')
  @Roles(UserRole.admin, UserRole.manager)
  async update(@Param('id') id: string, @Body() serviceData: any) {
    return this.servicesService.update(id, serviceData);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.manager)
  async remove(@Param('id') id: string) {
    await this.servicesService.remove(id);
    return { message: 'Service deleted successfully' };
  }
}
