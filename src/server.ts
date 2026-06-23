import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

const app = express();
app.use(express.json());

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Real Estate API (TypeScript Edition)',
            version: '2.0.0',
            description: 'Enhanced Real Estate REST API rebuilt in TypeScript with Node.js, Express, Prisma and PostgreSQL — demonstrating cross-stack re-architecture from the original Python/FastAPI version',
        },
        servers: [
            {
                url: 'http://localhost:3002',
                description: 'Local server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.ts'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/', (req, res) => {
    res.json({
        message: 'Real Estate API (TypeScript Edition) is running',
        docs: '/docs',
        version: '2.0.0'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/properties/:propertyId/reviews', reviewRoutes);
app.use('/api/reviews', reviewRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Docs at http://localhost:${PORT}/docs`);
});
