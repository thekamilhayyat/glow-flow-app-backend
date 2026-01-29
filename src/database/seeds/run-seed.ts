import { DataSource } from 'typeorm';
import { SeedService } from './seed';
import { dataSourceOptions } from '../typeorm.data-source';

async function runSeed() {
  const dataSource = new DataSource(dataSourceOptions);
  
  try {
    await dataSource.initialize();
    console.log('📊 Database connection established');
    
    const seedService = new SeedService(dataSource);
    await seedService.seed();
    
    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeed();
