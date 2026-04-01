import { PrismaClient } from '@prisma/client';

export default async function globalTeardown() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.DATABASE_URL ||
          'postgresql://postgres:docker@localhost:5432/prismaapi',
      },
    },
  });

  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
}
