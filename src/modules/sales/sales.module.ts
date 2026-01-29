import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleEntity } from '../../database/entities/sales.entity';
import { SaleItemEntity } from '../../database/entities/sale_items.entity';
import { PaymentMethodEntity } from '../../database/entities/payment_methods.entity';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SaleEntity, SaleItemEntity, PaymentMethodEntity])],
  providers: [SalesService],
  controllers: [SalesController],
  exports: [SalesService]
})
export class SalesModule {}


