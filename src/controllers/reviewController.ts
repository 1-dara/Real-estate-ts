import { Response } from 'express';
import prisma from '../lib/prisma.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export async function createReview(req: AuthRequest, res: Response): Promise<void> {
    try {
        const propertyId = parseInt(req.params.propertyId);
        const { rating, comment } = req.body;

        if (rating < 1 || rating > 5) {
            res.status(400).json({ error: 'Rating must be between 1 and 5' });
            return;
        }

        const property = await prisma.property.findUnique({ where: { id: propertyId } });
        if (!property) {
            res.status(404).json({ error: 'Property not found' });
            return;
        }

        if (property.agentId === req.userId) {
            res.status(400).json({ error: 'Agents cannot review their own properties' });
            return;
        }

        const review = await prisma.review.create({
            data: {
                rating: parseInt(rating),
                comment,
                userId: req.userId as number,
                propertyId
            },
            include: { user: { select: { id: true, name: true } } }
        });

        res.status(201).json(review);
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'You have already reviewed this property' });
            return;
        }
        res.status(500).json({ error: error.message });
    }
}

export async function getReviews(req: AuthRequest, res: Response): Promise<void> {
    try {
        const propertyId = parseInt(req.params.propertyId);

        const reviews = await prisma.review.findMany({
            where: { propertyId },
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' }
        });

        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : null;

        res.json({ averageRating, count: reviews.length, reviews });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteReview(req: AuthRequest, res: Response): Promise<void> {
    try {
        const existing = await prisma.review.findUnique({
            where: { id: parseInt(req.params.id) }
        });

        if (!existing) {
            res.status(404).json({ error: 'Review not found' });
            return;
        }

        if (existing.userId !== req.userId) {
            res.status(403).json({ error: 'You can only delete your own reviews' });
            return;
        }

        await prisma.review.delete({ where: { id: parseInt(req.params.id) } });

        res.json({ message: 'Review deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
