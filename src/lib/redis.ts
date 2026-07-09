import dotenv from 'dotenv';
dotenv.config();

import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export async function getCache(key: string): Promise<any> {
    try {
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
}

export async function setCache(key: string, value: any, expireSeconds: number = 300): Promise<void> {
    try {
        await redis.setex(key, expireSeconds, JSON.stringify(value));
    } catch {
        // fail silently
    }
}

export async function deleteCache(key: string): Promise<void> {
    try {
        await redis.del(key);
    } catch {
        // fail silently
    }
}

export async function deletePattern(pattern: string): Promise<void> {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch {
        // fail silently
    }
}

export default redis;
