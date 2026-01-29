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
import { ClientsService, ClientFilters } from './clients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../database/entities/users.entity';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff, UserRole.receptionist)
  async findAll(@Query() filters: ClientFilters) {
    return this.clientsService.findAll(filters);
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff, UserRole.receptionist)
  async findOne(@Param('id') id: string) {
    const client = await this.clientsService.findOne(id);
    const stats = await this.clientsService.getClientStats(id);
    
    return {
      client,
      stats
    };
  }

  @Post()
  @Roles(UserRole.admin, UserRole.manager, UserRole.receptionist)
  async create(@Body() clientData: any) {
    return this.clientsService.create(clientData);
  }

  @Put(':id')
  @Roles(UserRole.admin, UserRole.manager, UserRole.receptionist)
  async update(@Param('id') id: string, @Body() clientData: any) {
    return this.clientsService.update(id, clientData);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.manager)
  async remove(@Param('id') id: string) {
    await this.clientsService.remove(id);
    return { message: 'Client deleted successfully' };
  }

  @Get(':id/appointments')
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff, UserRole.receptionist)
  async getClientAppointments(@Param('id') id: string) {
    // Placeholder - will be implemented with appointments module
    return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }

  @Get(':id/purchases')
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff, UserRole.receptionist)
  async getClientPurchases(@Param('id') id: string) {
    // Placeholder - will be implemented with sales module
    return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }
}
