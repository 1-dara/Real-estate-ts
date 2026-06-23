import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
    createReview,
    getReviews,
    deleteReview
} from '../controllers/reviewController.js';

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /api/properties/{propertyId}/reviews:
 *   get:
 *     summary: Get all reviews for a property
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews with average rating
 */
router.get('/', getReviews);

/**
 * @swagger
 * /api/properties/{propertyId}/reviews:
 *   post:
 *     summary: Add a review to a property
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: Great property, very spacious
 *     responses:
 *       201:
 *         description: Review created
 *       400:
 *         description: Already reviewed or self-review attempted
 */
router.post('/', authenticateToken, createReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete your own review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Review deleted
 *       403:
 *         description: Not authorized
 */
router.delete('/:id', authenticateToken, deleteReview);

export default router;
