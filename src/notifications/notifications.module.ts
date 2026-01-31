import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { InAppNotificationsService } from './in-app-notifications.service';
import { InAppNotificationsController } from './in-app-notifications.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InAppNotificationsController],
  providers: [NotificationsService, InAppNotificationsService],
  exports: [NotificationsService, InAppNotificationsService],
})
export class NotificationsModule {}
