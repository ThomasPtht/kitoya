// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sports = [
    { name: 'Football' },
    // { name: 'Basketball' },
    // { name: 'Baseball' },
    // { name: 'Hockey' },
    // { name: 'Rugby' },
    // { name: 'Foot US' },
  ];

  for (const sport of sports) {
    await prisma.sport.upsert({
      where: { name: sport.name },
      update: {},
      create: sport,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
