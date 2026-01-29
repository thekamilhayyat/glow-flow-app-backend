import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ProductEntity } from '../../database/entities/products.entity';
import { ManufacturerEntity } from '../../database/entities/manufacturers.entity';
import { ProductTypeEntity } from '../../database/entities/product_types.entity';
import { InventoryTransactionEntity, InventoryTxnType } from '../../database/entities/inventory_transactions.entity';

export interface ProductFilters {
  search?: string;
  typeId?: string;
  manufacturerId?: string;
  isActive?: boolean;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export interface StockAdjustment {
  productId: string;
  quantity: number;
  type: InventoryTxnType;
  notes?: string;
  referenceId?: string;
  performedBy?: string;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
    @InjectRepository(ManufacturerEntity)
    private readonly manufacturersRepository: Repository<ManufacturerEntity>,
    @InjectRepository(ProductTypeEntity)
    private readonly productTypesRepository: Repository<ProductTypeEntity>,
    @InjectRepository(InventoryTransactionEntity)
    private readonly inventoryTransactionsRepository: Repository<InventoryTransactionEntity>
  ) {}

  // Products
  async findAllProducts(filters: ProductFilters = {}): Promise<ProductEntity[]> {
    const queryBuilder = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.manufacturer', 'manufacturer')
      .leftJoinAndSelect('product.type', 'type');

    if (filters.search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.sku ILIKE :search OR product.barcode ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.typeId) {
      queryBuilder.andWhere('product.typeId = :typeId', { typeId: filters.typeId });
    }

    if (filters.manufacturerId) {
      queryBuilder.andWhere('product.manufacturerId = :manufacturerId', { manufacturerId: filters.manufacturerId });
    }

    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.lowStock) {
      queryBuilder.andWhere('product.quantityInStock <= product.lowStockThreshold');
    }

    queryBuilder.orderBy('product.name', 'ASC');

    if (filters.page && filters.limit) {
      queryBuilder.skip((filters.page - 1) * filters.limit).take(filters.limit);
    }

    return queryBuilder.getMany();
  }

  async findProductById(id: string): Promise<ProductEntity> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['manufacturer', 'type']
    });
    
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    
    return product;
  }

  async createProduct(productData: Partial<ProductEntity>): Promise<ProductEntity> {
    const product = this.productsRepository.create(productData);
    return this.productsRepository.save(product);
  }

  async updateProduct(id: string, productData: Partial<ProductEntity>): Promise<ProductEntity> {
    const product = await this.findProductById(id);
    Object.assign(product, productData);
    return this.productsRepository.save(product);
  }

  async removeProduct(id: string): Promise<void> {
    const product = await this.findProductById(id);
    await this.productsRepository.remove(product);
  }

  async adjustStock(adjustment: StockAdjustment): Promise<{ product: ProductEntity; transaction: InventoryTransactionEntity }> {
    const product = await this.findProductById(adjustment.productId);
    
    const quantityBefore = product.quantityInStock;
    const quantityAfter = quantityBefore + adjustment.quantity;

    if (quantityAfter < 0) {
      throw new Error('Insufficient stock for this adjustment');
    }

    // Update product quantity
    product.quantityInStock = quantityAfter;
    const updatedProduct = await this.productsRepository.save(product);

    // Create inventory transaction
    const transaction = this.inventoryTransactionsRepository.create({
      productId: adjustment.productId,
      type: adjustment.type,
      quantity: adjustment.quantity,
      quantityBefore,
      quantityAfter,
      notes: adjustment.notes,
      referenceId: adjustment.referenceId,
      performedBy: adjustment.performedBy
    });

    const savedTransaction = await this.inventoryTransactionsRepository.save(transaction);

    return { product: updatedProduct, transaction: savedTransaction };
  }

  // Manufacturers
  async findAllManufacturers(): Promise<ManufacturerEntity[]> {
    return this.manufacturersRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' }
    });
  }

  async createManufacturer(manufacturerData: Partial<ManufacturerEntity>): Promise<ManufacturerEntity> {
    const manufacturer = this.manufacturersRepository.create(manufacturerData);
    return this.manufacturersRepository.save(manufacturer);
  }

  async updateManufacturer(id: string, manufacturerData: Partial<ManufacturerEntity>): Promise<ManufacturerEntity> {
    const manufacturer = await this.manufacturersRepository.findOne({ where: { id } });
    if (!manufacturer) {
      throw new NotFoundException('Manufacturer not found');
    }
    Object.assign(manufacturer, manufacturerData);
    return this.manufacturersRepository.save(manufacturer);
  }

  async removeManufacturer(id: string): Promise<void> {
    const manufacturer = await this.manufacturersRepository.findOne({ where: { id } });
    if (!manufacturer) {
      throw new NotFoundException('Manufacturer not found');
    }
    await this.manufacturersRepository.remove(manufacturer);
  }

  // Product Types
  async findAllProductTypes(): Promise<ProductTypeEntity[]> {
    return this.productTypesRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', name: 'ASC' }
    });
  }

  async createProductType(typeData: Partial<ProductTypeEntity>): Promise<ProductTypeEntity> {
    const productType = this.productTypesRepository.create(typeData);
    return this.productTypesRepository.save(productType);
  }

  async updateProductType(id: string, typeData: Partial<ProductTypeEntity>): Promise<ProductTypeEntity> {
    const productType = await this.productTypesRepository.findOne({ where: { id } });
    if (!productType) {
      throw new NotFoundException('Product type not found');
    }
    Object.assign(productType, typeData);
    return this.productTypesRepository.save(productType);
  }

  async removeProductType(id: string): Promise<void> {
    const productType = await this.productTypesRepository.findOne({ where: { id } });
    if (!productType) {
      throw new NotFoundException('Product type not found');
    }
    await this.productTypesRepository.remove(productType);
  }
}
