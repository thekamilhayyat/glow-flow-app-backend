import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmPaymentDto {
  @ApiProperty({ example: 'pi_xxx' })
  @IsString()
  @IsNotEmpty()
  paymentIntentId: string;
}
