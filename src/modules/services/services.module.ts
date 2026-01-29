import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceEntity } from '../../database/entities/services.entity';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceEntity])],
  providers: [ServicesService],
  controllers: [ServicesController],
  exports: [ServicesService]
})
export class ServicesCatalogModule {}


