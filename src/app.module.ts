import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigFactory } from './database/typeorm.config';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { StaffModule } from './modules/staff/staff.module';
import { ServicesCatalogModule } from './modules/services/services.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { SalesModule } from './modules/sales/sales.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { BusinessSettingsModule } from './modules/business-settings/business-settings.module';
import { ReportsModule } from './modules/reports/reports.module';
import { PublicBookingModule } from './modules/public-booking/public-booking.module';
import { ClientPortalModule } from './modules/client-portal/client-portal.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: typeOrmConfigFactory }),
    HealthModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    StaffModule,
    ServicesCatalogModule,
    AppointmentsModule,
    SalesModule,
    InventoryModule,
    BusinessSettingsModule,
    ReportsModule,
    PublicBookingModule,
    ClientPortalModule
  ]
})
export class AppModule {}


