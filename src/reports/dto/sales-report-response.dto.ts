import { ApiProperty } from '@nestjs/swagger';

export class SalesReportResponseDto {
  @ApiProperty({ example: 15000.50, description: 'Total revenue from succeeded payments' })
  totalRevenue: number;

  @ApiProperty({ example: 150, description: 'Total number of succeeded payment transactions' })
  totalTransactions: number;

  @ApiProperty({ example: 100.00, description: 'Average ticket value' })
  averageTicket: number;
}
