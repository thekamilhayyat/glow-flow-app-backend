import { ApiProperty } from '@nestjs/swagger';

export class InventoryReportResponseDto {
  @ApiProperty({ example: 5, description: 'Number of products with low stock (≤10)' })
  lowStock: number;

  @ApiProperty({ example: 3, description: 'Number of products out of stock (stock = 0)' })
  outOfStock: number;

  @ApiProperty({ example: 50, description: 'Total number of active products' })
  totalProducts: number;
}
