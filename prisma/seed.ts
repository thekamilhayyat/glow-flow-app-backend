import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.SALON_OWNER,
      emailVerified: true,
      isActive: true,
    },
  });

  console.log('Created user:', user.email);

  const salon = await prisma.salon.upsert({
    where: { slug: 'demo-salon' },
    update: {},
    create: {
      name: 'Demo Salon',
      slug: 'demo-salon',
      ownerId: user.id,
      isActive: true,
    },
  });

  console.log('Created salon:', salon.name);

  await prisma.salonMember.upsert({
    where: {
      salonId_userId: {
        salonId: salon.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      salonId: salon.id,
      userId: user.id,
      role: UserRole.SALON_OWNER,
      isActive: true,
    },
  });

  await prisma.salonSettings.upsert({
    where: { salonId: salon.id },
    update: {},
    create: {
      salonId: salon.id,
      businessName: 'Demo Salon',
      businessEmail: 'demo@example.com',
      businessPhone: '+1234567890',
      businessAddress: '123 Main St',
      businessCity: 'New York',
      businessState: 'NY',
      businessZip: '10001',
      businessCountry: 'USA',
      businessHours: {
        monday: { open: '09:00', close: '18:00', isClosed: false },
        tuesday: { open: '09:00', close: '18:00', isClosed: false },
        wednesday: { open: '09:00', close: '18:00', isClosed: false },
        thursday: { open: '09:00', close: '18:00', isClosed: false },
        friday: { open: '09:00', close: '18:00', isClosed: false },
        saturday: { open: '09:00', close: '17:00', isClosed: false },
        sunday: { isClosed: true },
      },
      bookingAdvanceDays: 90,
      bookingCancellationHours: 24,
      allowOnlineBooking: true,
      requireConfirmation: false,
      autoConfirm: false,
      bufferTimeMinutes: 15,
      taxEnabled: false,
      taxRate: 0,
      taxIncluded: false,
      requireDeposit: false,
      depositAmount: 0,
      depositPercentage: 0,
      emailNotifications: {
        appointmentConfirmation: true,
        appointmentReminder: true,
        appointmentCancellation: true,
        newBooking: true,
        paymentReceipt: true,
      },
      smsNotifications: {
        appointmentReminder: false,
        appointmentConfirmation: false,
      },
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { currentSalonId: salon.id },
  });

  console.log('Seeding completed!');
  console.log('Login credentials:');
  console.log('Email: admin@example.com');
  console.log('Password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
