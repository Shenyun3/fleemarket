import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// 确保在开发环境下热重载时，不会因为重复创建连接池而耗尽数据库连接
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

// 1. 创建 pg 数据库连接池
const pool = new Pool({ connectionString });

// 2. 将连接池包装成 Prisma 7 适配器
const adapter = new PrismaPg(pool);

// 3. 实例化客户端
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
