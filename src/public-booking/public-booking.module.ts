import { Module } from '@nestjs/common';
import { PublicBookingService } from './public-booking.service';
import { PublicBookingController } from './public-booking.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PublicBookingController],
  providers: [PublicBookingService],
  exports: [PublicBookingService],
})
export class PublicBookingModule {}
