import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adaptador = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const globalParaPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const db: PrismaClient =
  globalParaPrisma.prisma ?? new PrismaClient({ adapter: adaptador });

if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prisma = db;
}
