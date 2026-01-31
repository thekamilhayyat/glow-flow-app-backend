import { ApiProperty } from '@nestjs/swagger';

export class AppointmentsReportResponseDto {
  @ApiProperty({ example: 100, description: 'Total number of appointments' })
  total: number;

  @ApiProperty({ example: 75, description: 'Number of completed appointments' })
  completed: number;

  @ApiProperty({ example: 15, description: 'Number of cancelled appointments' })
  cancelled: number;

  @ApiProperty({ example: 10, description: 'Number of no-show appointments' })
  noShow: number;
}
