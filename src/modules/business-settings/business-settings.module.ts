import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessSettingsEntity } from '../../database/entities/business_settings.entity';
import { BusinessSettingsService } from './business-settings.service';
import { BusinessSettingsController } from './business-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessSettingsEntity])],
  providers: [BusinessSettingsService],
  controllers: [BusinessSettingsController],
  exports: [BusinessSettingsService]
})
export class BusinessSettingsModule {}


