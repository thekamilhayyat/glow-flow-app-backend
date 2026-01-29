import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../database/entities/products.entity';
import { ManufacturerEntity } from '../../database/entities/manufacturers.entity';
import { ProductTypeEntity } from '../../database/entities/product_types.entity';
import { InventoryTransactionEntity } from '../../database/entities/inventory_transactions.entity';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([
    ProductEntity, 
    ManufacturerEntity, 
    ProductTypeEntity, 
    InventoryTransactionEntity
  ])],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService]
})
export class InventoryModule {}


