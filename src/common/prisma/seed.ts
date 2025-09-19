import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // --- Seed Admin User ---
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      isActive: true,
      password: await bcrypt.hash('StrongPassword123!', 10),
      authStrategy: 'local',
      role: 'admin',
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
          phone: '+2348012345678',
        },
      },
    },
  });

  // --- Seed Alumni User ---
  await prisma.user.upsert({
    where: { email: 'alumni@example.com' },
    update: {},
    create: {
      email: 'alumni@example.com',
      isActive: true,
      password: await bcrypt.hash('AlumniPass123!', 10),
      authStrategy: 'local',
      role: 'alumni',
      profile: {
        create: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+2348098765432',
        },
      },
    },
  });

  // --- Seed Faculties and Departments ---
  const faculties = [
    {
      name: 'Faculty of Science',
      description: 'Covers science programs and research',
      departments: [
        { name: 'Computer Science', code: 'CSC' },
        { name: 'Biological Sciences', code: 'BIO' },
        { name: 'Chemistry', code: 'CHE' },
      ],
    },
    {
      name: 'Faculty of Arts and Education',
      description: 'Covers arts and education programs',
      departments: [
        { name: 'English', code: 'ENG' },
        { name: 'History', code: 'HIS' },
        { name: 'Educational Foundations', code: 'EDF' },
      ],
    },
    {
      name: 'Faculty of Social and Management Sciences',
      description: 'Covers social sciences and management programs',
      departments: [
        { name: 'Economics', code: 'ECO' },
        { name: 'Sociology', code: 'SOC' },
        { name: 'Business Administration', code: 'BUS' },
      ],
    },
  ];

  for (const faculty of faculties) {
    await prisma.faculty.upsert({
      where: { name: faculty.name },
      update: {},
      create: {
        name: faculty.name,
        description: faculty.description,
        departments: {
          create: faculty.departments,
        },
      },
    });
  }

  // --- Seed Announcement Categories ---
  await prisma.announcementCategory.upsert({
    where: { name: 'Alumni' },
    update: {},
    create: { name: 'Alumni' },
  });

  await prisma.announcementCategory.upsert({
    where: { name: 'University' },
    update: {},
    create: { name: 'University' },
  });

  console.log('✅ Seed completed: Users, Faculties, Departments, Announcement Categories');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
