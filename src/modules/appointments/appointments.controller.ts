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
import { AppointmentsService, AppointmentFilters, ConflictCheck } from './appointments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../database/entities/users.entity';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff, UserRole.receptionist)
  async findAll(@Query() filters: AppointmentFilters) {
    const appointments = await this.appointmentsService.findAll(filters);
    return { data: appointments };
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff, UserRole.receptionist)
  async findOne(@Param('id') id: string) {
    const appointment = await this.appointmentsService.findOne(id);
    return { appointment };
  }

  @Post()
  @Roles(UserRole.admin, UserRole.manager, UserRole.receptionist)
  async create(@Body() appointmentData: any) {
    const appointment = await this.appointmentsService.create(appointmentData);
    return { appointment };
  }

  @Put(':id')
  @Roles(UserRole.admin, UserRole.manager, UserRole.receptionist)
  async update(@Param('id') id: string, @Body() appointmentData: any) {
    const appointment = await this.appointmentsService.update(id, appointmentData);
    return { appointment };
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.manager, UserRole.receptionist)
  async remove(@Param('id') id: string) {
    await this.appointmentsService.remove(id);
    return { message: 'Appointment deleted successfully' };
  }

  @Post(':id/check-in')
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff)
  async checkIn(@Param('id') id: string) {
    const appointment = await this.appointmentsService.checkIn(id);
    return { appointment };
  }

  @Post(':id/complete')
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff)
  async complete(@Param('id') id: string) {
    const appointment = await this.appointmentsService.complete(id);
    return { appointment };
  }

  @Post('check-availability')
  @Roles(UserRole.admin, UserRole.manager, UserRole.receptionist)
  async checkAvailability(@Body() check: ConflictCheck) {
    return this.appointmentsService.checkAvailability(check);
  }
}
