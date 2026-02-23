import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
    userId?: string;
    file?: any;
    userRole?: string;
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token, autorización denegada' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token no válido' });
    }
};

export const adminOnly = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (user.rol !== 'admin' && user.rol !== 'superadmin') {
            return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
        }

        req.userRole = user.rol;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error verificando permisos' });
    }
};
