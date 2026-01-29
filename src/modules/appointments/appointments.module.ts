import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentEntity } from '../../database/entities/appointments.entity';
import { AppointmentServicesEntity } from '../../database/entities/appointment_services.entity';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AppointmentEntity, AppointmentServicesEntity])],
  providers: [AppointmentsService],
  controllers: [AppointmentsController],
  exports: [AppointmentsService]
})
export class AppointmentsModule {}


