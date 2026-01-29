import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Query, 
  Body, 
  UseGuards 
} from '@nestjs/common';
import { InventoryService, ProductFilters, StockAdjustment } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../database/entities/users.entity';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Products
  @Get('products')
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff, UserRole.receptionist)
  async findAllProducts(@Query() filters: ProductFilters) {
    const products = await this.inventoryService.findAllProducts(filters);
    return { data: products };
  }

  @Get('products/:id')
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff, UserRole.receptionist)
  async findProductById(@Param('id') id: string) {
    const product = await this.inventoryService.findProductById(id);
    return { product };
  }

  @Post('products')
  @Roles(UserRole.admin, UserRole.manager)
  async createProduct(@Body() productData: any) {
    const product = await this.inventoryService.createProduct(productData);
    return { product };
  }

  @Put('products/:id')
  @Roles(UserRole.admin, UserRole.manager)
  async updateProduct(@Param('id') id: string, @Body() productData: any) {
    const product = await this.inventoryService.updateProduct(id, productData);
    return { product };
  }

  @Delete('products/:id')
  @Roles(UserRole.admin, UserRole.manager)
  async removeProduct(@Param('id') id: string) {
    await this.inventoryService.removeProduct(id);
    return { message: 'Product deleted successfully' };
  }

  @Post('products/adjust-stock')
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff)
  async adjustStock(@Body() adjustment: StockAdjustment) {
    const result = await this.inventoryService.adjustStock(adjustment);
    return result;
  }

  // Manufacturers
  @Get('manufacturers')
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff, UserRole.receptionist)
  async findAllManufacturers() {
    const manufacturers = await this.inventoryService.findAllManufacturers();
    return { data: manufacturers };
  }

  @Post('manufacturers')
  @Roles(UserRole.admin, UserRole.manager)
  async createManufacturer(@Body() manufacturerData: any) {
    const manufacturer = await this.inventoryService.createManufacturer(manufacturerData);
    return { manufacturer };
  }

  @Put('manufacturers/:id')
  @Roles(UserRole.admin, UserRole.manager)
  async updateManufacturer(@Param('id') id: string, @Body() manufacturerData: any) {
    const manufacturer = await this.inventoryService.updateManufacturer(id, manufacturerData);
    return { manufacturer };
  }

  @Delete('manufacturers/:id')
  @Roles(UserRole.admin, UserRole.manager)
  async removeManufacturer(@Param('id') id: string) {
    await this.inventoryService.removeManufacturer(id);
    return { message: 'Manufacturer deleted successfully' };
  }

  // Product Types
  @Get('product-types')
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff, UserRole.receptionist)
  async findAllProductTypes() {
    const productTypes = await this.inventoryService.findAllProductTypes();
    return { data: productTypes };
  }

  @Post('product-types')
  @Roles(UserRole.admin, UserRole.manager)
  async createProductType(@Body() typeData: any) {
    const productType = await this.inventoryService.createProductType(typeData);
    return { productType };
  }

  @Put('product-types/:id')
  @Roles(UserRole.admin, UserRole.manager)
  async updateProductType(@Param('id') id: string, @Body() typeData: any) {
    const productType = await this.inventoryService.updateProductType(id, typeData);
    return { productType };
  }

  @Delete('product-types/:id')
  @Roles(UserRole.admin, UserRole.manager)
  async removeProductType(@Param('id') id: string) {
    await this.inventoryService.removeProductType(id);
    return { message: 'Product type deleted successfully' };
  }
}
