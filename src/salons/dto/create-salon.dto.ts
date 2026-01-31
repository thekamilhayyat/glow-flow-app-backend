import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateSalonDto {
  @ApiProperty({ example: 'Beautiful Hair Salon' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}
