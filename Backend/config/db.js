
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import prismaPackage from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const { PrismaClient } = prismaPackage;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
});

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Error connecting to database:", error);
        throw error;
    }
};

const disconnectDB = async () => {
    try {
        await prisma.$disconnect();
        console.log("Database disconnected successfully");
    } catch (error) {
        console.error("Error disconnecting database:", error);
    }
};

export {connectDB, disconnectDB, prisma};
