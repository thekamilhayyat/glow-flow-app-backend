import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffEntity } from '../../database/entities/staff.entity';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StaffEntity])],
  providers: [StaffService],
  controllers: [StaffController],
  exports: [StaffService]
})
export class StaffModule {}


