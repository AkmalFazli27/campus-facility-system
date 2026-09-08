// Titik impor tunggal database untuk Route Handler: `import { db } from "@/lib/db"`.
// Singleton agar hot-reload dev tidak membanjiri MySQL dengan koneksi baru.
// Semua query lewat sini otomatis ter-type dari `prisma/schema.prisma`.
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
