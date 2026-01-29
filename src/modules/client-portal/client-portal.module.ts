import { Module } from '@nestjs/common';
import { ClientPortalController } from './client-portal.controller';

@Module({
  controllers: [ClientPortalController]
})
export class ClientPortalModule {}


