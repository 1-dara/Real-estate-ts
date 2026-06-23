import express from 'express';
import multer from 'multer';
import { authenticateToken, requireAgent } from '../middleware/authMiddleware.js';
import {
    createProperty,
    getProperties,
    getProperty,
    updateProperty,
    deleteProperty
} from '../controllers/propertyController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all properties with filters and pagination
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [apartment, house, land, commercial]
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: bedrooms
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, sold, rented]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of properties with pagination
 */
router.get('/', getProperties);

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create a new property listing (agents only)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - city
 *               - address
 *               - bedrooms
 *               - bathrooms
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               city:
 *                 type: string
 *               address:
 *                 type: string
 *               bedrooms:
 *                 type: integer
 *               bathrooms:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [apartment, house, land, commercial]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Property created successfully
 *       403:
 *         description: Only agents can create properties
 */
router.post('/', authenticateToken, requireAgent, upload.array('images', 10), createProperty);

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get a single property with reviews
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Property details with reviews
 *       404:
 *         description: Property not found
 */
router.get('/:id', getProperty);

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Update a property (agent owner only)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [available, sold, rented]
 *     responses:
 *       200:
 *         description: Property updated
 *       403:
 *         description: Not authorized
 */
router.put('/:id', authenticateToken, requireAgent, updateProperty);

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Delete a property (agent owner only)
 *     tags: [Properties]
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
 *         description: Property deleted
 *       403:
 *         description: Not authorized
 */
router.delete('/:id', authenticateToken, requireAgent, deleteProperty);

export default router;
