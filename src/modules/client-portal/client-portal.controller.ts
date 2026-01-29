import { Controller, Get, Query } from '@nestjs/common';

@Controller('client-portal')
export class ClientPortalController {
  @Get('appointments')
  list(@Query('token') token: string) {
    // token will be validated server-side later
    return { token, upcoming: [], past: [] };
  }
}


