import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const parsed = new URL(process.env.DATABASE_URL as string);

const adapter = new PrismaPg({
    host: parsed.hostname,
    port: parseInt(parsed.port),
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.slice(1).split('?')[0],
    ssl: { rejectUnauthorized: false }
});

const prisma = new PrismaClient({ adapter });

export default prisma;
