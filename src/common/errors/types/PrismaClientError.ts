import { Prisma } from '@prisma/client';

export type PrismaClientError = Prisma.PrismaClientKnownRequestError & {
  meta?: { target: string };
};
