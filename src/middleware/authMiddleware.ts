import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface AuthRequest extends Request {
    userId?: number;
    userRole?: string;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
        if (err) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    });
}

export function requireAgent(req: AuthRequest, res: Response, next: NextFunction): void {
    if (req.userRole !== 'agent') {
        res.status(403).json({ error: 'Only agents can perform this action' });
        return;
    }
    next();
}
