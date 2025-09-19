import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { User } from '../decorators/param-decorator/User.decorator';
import { UserType } from '@/modules/user/types';

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
      role: UserType.SUPER_ADMIN,
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
          phone: '+2348012345678',
        },
      },
    },
  });

  // --- Seed ADMIN User ---
  await prisma.user.upsert({
    where: { email: 'sales@example.com' },
    update: {},
    create: {
      email: 'sales@example.com',
      isActive: true,
      password: await bcrypt.hash('SalesPass123!', 10),
      role: UserType.SALES_ADMIN,
      profile: {
        create: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+2348098765432',
        },
      },
    },
  });


 
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
