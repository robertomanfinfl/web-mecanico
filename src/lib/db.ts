import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalDb = globalThis as typeof globalThis & { workshopDb?: PrismaClient };

export function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Configura DATABASE_URL.");
  return globalDb.workshopDb ??= new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}
