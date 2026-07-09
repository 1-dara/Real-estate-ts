import { Request, Response } from 'express';
import dotenv from 'dotenv';
import prisma from '../lib/prisma.js';
import cloudinary from '../lib/cloudinary.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { getCache, setCache, deleteCache, deletePattern } from '../lib/redis.js';

dotenv.config();

export async function createProperty(req: AuthRequest, res: Response): Promise<void> {
    try {
        const { title, description, price, city, address, bedrooms, bathrooms, type } = req.body;

        const files = req.files as Express.Multer.File[];
        const imageUrls: string[] = [];

        if (files && files.length > 0) {
            for (const file of files) {
                const result = await new Promise<any>((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { folder: 'real-estate-ts' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    ).end(file.buffer);
                });
                imageUrls.push(result.secure_url);
            }
        }

        const property = await prisma.property.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                city,
                address,
                bedrooms: parseInt(bedrooms),
                bathrooms: parseInt(bathrooms),
                type,
                images: imageUrls,
                agentId: req.userId as number
            },
            include: {
                agent: { select: { id: true, name: true, email: true, phone: true } }
            }
        });

        await deletePattern('re-ts:properties:*');

        res.status(201).json(property);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function getProperties(req: Request, res: Response): Promise<void> {
    try {
        const {
            city, type, minPrice, maxPrice,
            bedrooms, status, page = '1', limit = '10'
        } = req.query;

        const cacheKey = `re-ts:properties:city=${city}:type=${type}:min=${minPrice}:max=${maxPrice}:beds=${bedrooms}:status=${status}:page=${page}:limit=${limit}`;

        const cached = await getCache(cacheKey);
        if (cached) {
            res.json(cached);
            return;
        }

        const where: any = {};
        if (city) where.city = { contains: city as string, mode: 'insensitive' };
        if (type) where.type = type;
        if (status) where.status = status;
        if (bedrooms) where.bedrooms = parseInt(bedrooms as string);
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice as string);
            if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
        }

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const [properties, total] = await Promise.all([
            prisma.property.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    agent: { select: { id: true, name: true, email: true, phone: true } },
                    reviews: { select: { rating: true } }
                }
            }),
            prisma.property.count({ where })
        ]);

        const propertiesWithRating = properties.map(p => ({
            ...p,
            averageRating: p.reviews.length > 0
                ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
                : null,
            reviewCount: p.reviews.length
        }));

        const response = {
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            properties: propertiesWithRating
        };

        await setCache(cacheKey, response, 300);

        res.json(response);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function getProperty(req: Request, res: Response): Promise<void> {
    try {
        const cacheKey = `re-ts:property:${req.params.id}`;

        const cached = await getCache(cacheKey);
        if (cached) {
            res.json(cached);
            return;
        }

        const property = await prisma.property.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                agent: { select: { id: true, name: true, email: true, phone: true } },
                reviews: {
                    include: { user: { select: { id: true, name: true } } },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!property) {
            res.status(404).json({ error: 'Property not found' });
            return;
        }

        const averageRating = property.reviews.length > 0
            ? property.reviews.reduce((sum, r) => sum + r.rating, 0) / property.reviews.length
            : null;

        const response = { ...property, averageRating };

        await setCache(cacheKey, response, 300);

        res.json(response);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function updateProperty(req: AuthRequest, res: Response): Promise<void> {
    try {
        const existing = await prisma.property.findUnique({
            where: { id: parseInt(req.params.id) }
        });

        if (!existing) {
            res.status(404).json({ error: 'Property not found' });
            return;
        }

        if (existing.agentId !== req.userId) {
            res.status(403).json({ error: 'You can only update your own properties' });
            return;
        }

        const { title, description, price, city, address, bedrooms, bathrooms, type, status } = req.body;

        const property = await prisma.property.update({
            where: { id: parseInt(req.params.id) },
            data: {
                title: title ?? existing.title,
                description: description ?? existing.description,
                price: price ? parseFloat(price) : existing.price,
                city: city ?? existing.city,
                address: address ?? existing.address,
                bedrooms: bedrooms ? parseInt(bedrooms) : existing.bedrooms,
                bathrooms: bathrooms ? parseInt(bathrooms) : existing.bathrooms,
                type: type ?? existing.type,
                status: status ?? existing.status
            }
        });

        await deleteCache(`re-ts:property:${req.params.id}`);
        await deletePattern('re-ts:properties:*');

        res.json(property);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteProperty(req: AuthRequest, res: Response): Promise<void> {
    try {
        const existing = await prisma.property.findUnique({
            where: { id: parseInt(req.params.id) }
        });

        if (!existing) {
            res.status(404).json({ error: 'Property not found' });
            return;
        }

        if (existing.agentId !== req.userId) {
            res.status(403).json({ error: 'You can only delete your own properties' });
            return;
        }

        await prisma.review.deleteMany({ where: { propertyId: parseInt(req.params.id) } });
        await prisma.property.delete({ where: { id: parseInt(req.params.id) } });

        await deleteCache(`re-ts:property:${req.params.id}`);
        await deletePattern('re-ts:properties:*');

        res.json({ message: 'Property deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
