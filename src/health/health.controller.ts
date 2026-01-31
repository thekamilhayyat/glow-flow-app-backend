import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor() {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check' })
  health(): { status: string; uptime: number; timestamp: string } {
    // Instant response - no dependencies, no awaits, no database
    // This endpoint MUST NEVER hang or block
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
