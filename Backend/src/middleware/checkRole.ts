import { Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthRequest } from './auth';

export const checkRole = (roles: string[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const user = await User.findById(req.userId);
            
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            if (!roles.includes(user.rol)) {
                return res.status(403).json({ message: 'Acceso denegado: No tienes permisos suficientes' });
            }

            next();
        } catch (error) {
            console.error('Error en checkRole:', error);
            res.status(500).json({ message: 'Error del servidor' });
        }
    };
};
