import { PrismaClient } from "@prisma/client";

// Prisma 7 with prisma.config.ts handles the datasource URL
export const prisma = new PrismaClient({
  adapter: undefined as any, // Temporary workaround for Prisma 7 type requirements
});