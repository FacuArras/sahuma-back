import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function getPrismaClient() {
    try {
        return globalForPrisma.prisma ?? new PrismaClient();
    } catch {
        return new PrismaClient();
    }
}

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
