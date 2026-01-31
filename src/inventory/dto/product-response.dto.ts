import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  salonId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  sku?: string;

  @ApiProperty()
  price: number;

  @ApiProperty({ required: false })
  cost?: number;

  @ApiProperty()
  stock: number;

  @ApiProperty({ required: false })
  category?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
