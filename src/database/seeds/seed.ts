import { DataSource } from 'typeorm';
import { UserEntity } from '../entities/users.entity';
import { ClientEntity } from '../entities/clients.entity';
import { StaffEntity } from '../entities/staff.entity';
import { ServiceEntity } from '../entities/services.entity';
import { ManufacturerEntity } from '../entities/manufacturers.entity';
import { ProductTypeEntity } from '../entities/product_types.entity';
import { ProductEntity } from '../entities/products.entity';
import { BusinessSettingsEntity } from '../entities/business_settings.entity';
import * as bcrypt from 'bcrypt';

export class SeedService {
  constructor(private dataSource: DataSource) {}

  async seed() {
    console.log('🌱 Starting database seeding...');

    try {
      // Seed users
      await this.seedUsers();
      
      // Seed manufacturers
      await this.seedManufacturers();
      
      // Seed product types
      await this.seedProductTypes();
      
      // Seed products
      await this.seedProducts();
      
      // Seed clients
      await this.seedClients();
      
      // Seed staff
      await this.seedStaff();
      
      // Seed services
      await this.seedServices();
      
      // Seed business settings
      await this.seedBusinessSettings();

      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  private async seedUsers() {
    console.log('👤 Seeding users...');
    
    const userRepository = this.dataSource.getRepository(UserEntity);
    
    // Check if admin user already exists
    const existingAdmin = await userRepository.findOne({ where: { email: 'admin@glowdesk.com' } });
    if (existingAdmin) {
      console.log('Admin user already exists, skipping...');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = userRepository.create({
      email: 'admin@glowdesk.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true
    });

    await userRepository.save(adminUser);
    console.log('✅ Admin user created');
  }

  private async seedManufacturers() {
    console.log('🏭 Seeding manufacturers...');
    
    const manufacturerRepository = this.dataSource.getRepository(ManufacturerEntity);
    
    const manufacturers = [
      { name: 'L\'Oréal Professional', contactEmail: 'info@loreal.com', contactPhone: '+1-800-LOREAL' },
      { name: 'Wella Professionals', contactEmail: 'info@wella.com', contactPhone: '+1-800-WELLA' },
      { name: 'Schwarzkopf Professional', contactEmail: 'info@schwarzkopf.com', contactPhone: '+1-800-SCHWARZ' },
      { name: 'Redken', contactEmail: 'info@redken.com', contactPhone: '+1-800-REDKEN' },
      { name: 'Matrix', contactEmail: 'info@matrix.com', contactPhone: '+1-800-MATRIX' }
    ];

    for (const manufacturerData of manufacturers) {
      const existing = await manufacturerRepository.findOne({ where: { name: manufacturerData.name } });
      if (!existing) {
        const manufacturer = manufacturerRepository.create(manufacturerData);
        await manufacturerRepository.save(manufacturer);
      }
    }
    
    console.log('✅ Manufacturers seeded');
  }

  private async seedProductTypes() {
    console.log('📦 Seeding product types...');
    
    const productTypeRepository = this.dataSource.getRepository(ProductTypeEntity);
    
    const productTypes = [
      { name: 'Hair Care', description: 'Shampoos, conditioners, and hair treatments', displayOrder: 1 },
      { name: 'Hair Color', description: 'Hair coloring products and treatments', displayOrder: 2 },
      { name: 'Styling Products', description: 'Gels, sprays, and styling tools', displayOrder: 3 },
      { name: 'Skin Care', description: 'Facial and body care products', displayOrder: 4 },
      { name: 'Nail Care', description: 'Nail polish and nail care products', displayOrder: 5 }
    ];

    for (const typeData of productTypes) {
      const existing = await productTypeRepository.findOne({ where: { name: typeData.name } });
      if (!existing) {
        const productType = productTypeRepository.create(typeData);
        await productTypeRepository.save(productType);
      }
    }
    
    console.log('✅ Product types seeded');
  }

  private async seedProducts() {
    console.log('🛍️ Seeding products...');
    
    const productRepository = this.dataSource.getRepository(ProductEntity);
    const manufacturerRepository = this.dataSource.getRepository(ManufacturerEntity);
    const productTypeRepository = this.dataSource.getRepository(ProductTypeEntity);

    const loreal = await manufacturerRepository.findOne({ where: { name: 'L\'Oréal Professional' } });
    const wella = await manufacturerRepository.findOne({ where: { name: 'Wella Professionals' } });
    const hairCare = await productTypeRepository.findOne({ where: { name: 'Hair Care' } });
    const hairColor = await productTypeRepository.findOne({ where: { name: 'Hair Color' } });

    if (!loreal || !wella || !hairCare || !hairColor) {
      console.log('Required manufacturers or product types not found, skipping products...');
      return;
    }

    const products = [
      {
        name: 'L\'Oréal Professional Shampoo',
        sku: 'LP-SH-001',
        barcode: '1234567890123',
        manufacturerId: loreal.id,
        typeId: hairCare.id,
        costPrice: 15.00,
        sellingPrice: 25.00,
        quantityInStock: 50,
        lowStockThreshold: 10,
        isActive: true
      },
      {
        name: 'Wella Color Touch',
        sku: 'WC-CT-001',
        barcode: '1234567890124',
        manufacturerId: wella.id,
        typeId: hairColor.id,
        costPrice: 20.00,
        sellingPrice: 35.00,
        quantityInStock: 30,
        lowStockThreshold: 5,
        isActive: true
      }
    ];

    for (const productData of products) {
      const existing = await productRepository.findOne({ where: { sku: productData.sku } });
      if (!existing) {
        const product = productRepository.create(productData);
        await productRepository.save(product);
      }
    }
    
    console.log('✅ Products seeded');
  }

  private async seedClients() {
    console.log('👥 Seeding clients...');
    
    const clientRepository = this.dataSource.getRepository(ClientEntity);
    
    const clients = [
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0101',
        dateOfBirth: new Date('1990-05-15'),
        isVip: true,
        tags: ['premium', 'regular'],
        notes: 'Prefers morning appointments'
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@email.com',
        phone: '+1-555-0102',
        dateOfBirth: new Date('1985-08-22'),
        isVip: false,
        tags: ['new'],
        notes: 'Allergic to certain hair products'
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@email.com',
        phone: '+1-555-0103',
        dateOfBirth: new Date('1992-12-10'),
        isVip: true,
        tags: ['premium', 'referral'],
        notes: 'Referred by Sarah Johnson'
      }
    ];

    for (const clientData of clients) {
      const existing = await clientRepository.findOne({ where: { email: clientData.email } });
      if (!existing) {
        const client = clientRepository.create(clientData);
        await clientRepository.save(client);
      }
    }
    
    console.log('✅ Clients seeded');
  }

  private async seedStaff() {
    console.log('👨‍💼 Seeding staff...');
    
    const staffRepository = this.dataSource.getRepository(StaffEntity);
    
    const staffMembers = [
      {
        firstName: 'Jessica',
        lastName: 'Martinez',
        email: 'jessica.martinez@glowdesk.com',
        phone: '+1-555-0201',
        role: 'stylist',
        specialties: ['hair-cutting', 'hair-coloring'],
        hourlyRate: 25.00,
        commissionRate: 0.15,
        isActive: true
      },
      {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@glowdesk.com',
        phone: '+1-555-0202',
        role: 'stylist',
        specialties: ['hair-styling', 'beard-trimming'],
        hourlyRate: 22.00,
        commissionRate: 0.12,
        isActive: true
      },
      {
        firstName: 'Lisa',
        lastName: 'Anderson',
        email: 'lisa.anderson@glowdesk.com',
        phone: '+1-555-0203',
        role: 'receptionist',
        specialties: ['customer-service', 'scheduling'],
        hourlyRate: 18.00,
        commissionRate: 0.05,
        isActive: true
      }
    ];

    for (const staffData of staffMembers) {
      const existing = await staffRepository.findOne({ where: { email: staffData.email } });
      if (!existing) {
        const staff = staffRepository.create(staffData);
        await staffRepository.save(staff);
      }
    }
    
    console.log('✅ Staff seeded');
  }

  private async seedServices() {
    console.log('💇 Seeding services...');
    
    const serviceRepository = this.dataSource.getRepository(ServiceEntity);
    
    const services = [
      {
        name: 'Haircut',
        description: 'Professional haircut and styling',
        category: 'Hair Services',
        duration: 60,
        price: 45.00,
        displayOrder: 1,
        isActive: true
      },
      {
        name: 'Hair Color',
        description: 'Full hair coloring service',
        category: 'Hair Services',
        duration: 120,
        price: 85.00,
        displayOrder: 2,
        isActive: true
      },
      {
        name: 'Highlights',
        description: 'Partial or full highlights',
        category: 'Hair Services',
        duration: 90,
        price: 75.00,
        displayOrder: 3,
        isActive: true
      },
      {
        name: 'Facial',
        description: 'Deep cleansing facial treatment',
        category: 'Skin Services',
        duration: 75,
        price: 65.00,
        displayOrder: 4,
        isActive: true
      },
      {
        name: 'Manicure',
        description: 'Classic manicure with polish',
        category: 'Nail Services',
        duration: 45,
        price: 35.00,
        displayOrder: 5,
        isActive: true
      }
    ];

    for (const serviceData of services) {
      const existing = await serviceRepository.findOne({ where: { name: serviceData.name } });
      if (!existing) {
        const service = serviceRepository.create(serviceData);
        await serviceRepository.save(service);
      }
    }
    
    console.log('✅ Services seeded');
  }

  private async seedBusinessSettings() {
    console.log('⚙️ Seeding business settings...');
    
    const settingsRepository = this.dataSource.getRepository(BusinessSettingsEntity);
    
    const existingSettings = await settingsRepository.findOne({ where: { id: 1 } });
    if (existingSettings) {
      console.log('Business settings already exist, skipping...');
      return;
    }

    const businessSettings = settingsRepository.create({
      id: 1,
      businessName: 'Glowdesk Salon',
      businessEmail: 'info@glowdesk.com',
      businessPhone: '+1-555-0123',
      businessAddress: '123 Main St, City, State 12345',
      timezone: 'America/New_York',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      settings: {
        appointmentDuration: 60,
        bufferTime: 15,
        advanceBookingDays: 30,
        cancellationPolicy: '24 hours',
        noShowPolicy: 'Charge 50%',
        allowOnlineBooking: true,
        requireDeposit: false,
        depositAmount: 0,
        taxRate: 0.08,
        serviceChargeRate: 0.0,
        tipEnabled: true,
        smsNotifications: true,
        emailNotifications: true,
        reminderHours: 24,
        confirmationRequired: true,
        maxAppointmentsPerDay: 20,
        workingHours: {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '10:00', close: '16:00', closed: false },
          sunday: { open: '10:00', close: '16:00', closed: true }
        }
      }
    });

    await settingsRepository.save(businessSettings);
    console.log('✅ Business settings seeded');
  }
}
