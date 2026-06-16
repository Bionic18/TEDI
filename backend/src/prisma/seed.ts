import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.mjs';

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Admin user ---
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      roles: ['admin'],
      active: true,
    },
    create: {
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      roles: ['admin'],
      active: true,
    },
  });

  // --- Simple user ---
  const userPasswordHash = await bcrypt.hash('user1234', 10);
  await prisma.user.upsert({
    where: { username: 'user' },
    update: {
      email: 'user@example.com',
      passwordHash: userPasswordHash,
      roles: ['user'],
      active: true,
    },
    create: {
      username: 'user',
      email: 'user@example.com',
      passwordHash: userPasswordHash,
      roles: ['user'],
      active: true,
    },
  });

  // --- Organizer user (owns the sample events below) ---
  const organizerPasswordHash = await bcrypt.hash('organizer1234', 10);
  const organizer = await prisma.user.upsert({
    where: { username: 'organizer' },
    update: {
      email: 'organizer@example.com',
      passwordHash: organizerPasswordHash,
      roles: ['user'],
      active: true,
    },
    create: {
      username: 'organizer',
      email: 'organizer@example.com',
      passwordHash: organizerPasswordHash,
      roles: ['user'],
      active: true,
    },
  });

  // --- Sample events (the same mock data the frontend used) ---
  // Wiped and reinserted on each seed so re-running stays idempotent.
  await prisma.event.deleteMany({ where: { organizerId: organizer.id } });
  await prisma.event.createMany({
    data: [
      {
        name: 'Jaul',
        description: 'Jaul Concert in Athens!',
        venue: 'Technopolis',
        address: 'Pireos 100',
        city: 'Athens',
        country: 'Greece',
        startDateTime: new Date('2026-06-19T20:00:00'),
        endDateTime: new Date('2026-06-20T00:00:00'),
        capacity: 5000,
        status: 'PUBLISHED',
        organizerId: organizer.id,
      },
      {
        name: 'Sponty',
        description: 'Sponty Concert in Athens!',
        venue: 'Plato Academy Park',
        address: 'Monastiriou & Tilefanous',
        city: 'Athens',
        country: 'Greece',
        startDateTime: new Date('2026-06-13T22:00:00'),
        endDateTime: new Date('2026-06-13T23:00:00'),
        capacity: 10000,
        status: 'PUBLISHED',
        organizerId: organizer.id,
      },
      {
        name: 'Pepsi MAX presents Parklife 2026 - Saturday',
        description: 'Skepta Concert in Manchester!',
        venue: 'Heaton Park',
        address: 'Middleton Road',
        city: 'Manchester',
        country: 'United Kingdom',
        startDateTime: new Date('2026-06-20T20:00:00'),
        endDateTime: new Date('2026-06-20T23:30:00'),
        capacity: 30000,
        status: 'PUBLISHED',
        organizerId: organizer.id,
      },
    ],
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
