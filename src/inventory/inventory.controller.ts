import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { CurrentSalon } from '../common/decorators/current-salon.decorator';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Inventory')
@Controller('inventory')
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('products')
  @ApiOperation({ summary: 'Get products' })
  @ApiResponse({ status: 200 })
  async getProducts(
    @CurrentSalon() salonId: string,
    @Query() query: any,
  ): Promise<PaginatedResponseDto<ProductResponseDto>> {
    return await this.inventoryService.findAll(salonId, query);
  }

  @Get('products/low-stock')
  @ApiOperation({ summary: 'Get low stock products' })
  @ApiResponse({ status: 200 })
  async getLowStock(
    @CurrentSalon() salonId: string,
    @Query('threshold') threshold?: string,
  ): Promise<SuccessResponseDto<any>> {
    const result = await this.inventoryService.getLowStock(
      salonId,
      threshold ? parseInt(threshold) : 10,
    );
    return { data: result.data, meta: result.meta };
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async getProduct(
    @CurrentSalon() salonId: string,
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<ProductResponseDto>> {
    const result = await this.inventoryService.findOne(salonId, id);
    return { data: result };
  }

  @Post('products')
  @ApiOperation({ summary: 'Create product' })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  async createProduct(
    @CurrentSalon() salonId: string,
    @Body() createDto: CreateProductDto,
  ): Promise<SuccessResponseDto<ProductResponseDto>> {
    const result = await this.inventoryService.create(salonId, createDto);
    return { data: result };
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async updateProduct(
    @CurrentSalon() salonId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateProductDto,
  ): Promise<SuccessResponseDto<ProductResponseDto>> {
    const result = await this.inventoryService.update(salonId, id, updateDto);
    return { data: result };
  }

  @Post('products/:id/adjust-stock')
  @ApiOperation({ summary: 'Adjust product stock' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async adjustStock(
    @CurrentSalon() salonId: string,
    @Param('id') id: string,
    @Body() adjustDto: AdjustStockDto,
  ): Promise<SuccessResponseDto<ProductResponseDto>> {
    const result = await this.inventoryService.adjustStock(salonId, id, adjustDto);
    return { data: result };
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 200 })
  async deleteProduct(
    @CurrentSalon() salonId: string,
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<any>> {
    const result = await this.inventoryService.remove(salonId, id);
    return { data: result };
  }
}
