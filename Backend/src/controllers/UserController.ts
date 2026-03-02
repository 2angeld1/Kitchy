import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Obtener usuarios del mismo negocio
export const getUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await User.find(
            { negocioIds: req.negocioId },
            '-password'
        );
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

// Crear usuario dentro del negocio (solo admin)
export const createUser = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password, nombre, rol } = req.body;

        if (!email || !password || !nombre) {
            return res.status(400).json({ message: 'Email, contraseña y nombre son obligatorios' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        // El admin solo puede crear usuarios con rol 'usuario'
        const newUser = new User({
            email,
            password,
            nombre,
            rol: 'usuario', // Siempre se crea como usuario, no como admin
            negocioIds: [req.negocioId],
            negocioActivo: req.negocioId
        });

        await newUser.save();

        res.status(201).json({
            _id: newUser._id,
            email: newUser.email,
            nombre: newUser.nombre,
            rol: newUser.rol,
            negocioIds: newUser.negocioIds,
            negocioActivo: newUser.negocioActivo
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error al crear usuario' });
    }
};

// Cambiar rol de usuario (solo dentro de su negocio)
export const updateUserRole = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { rol } = req.body;

        const validRoles = ['admin', 'usuario'];

        if (!validRoles.includes(rol)) {
            return res.status(400).json({ message: 'Rol inválido' });
        }

        // Verificar que el usuario pertenece al mismo negocio
        const user = await User.findOne({ _id: id, negocioIds: req.negocioId });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado en tu negocio' });
        }

        user.rol = rol;
        await user.save();

        res.json({
            _id: user._id,
            email: user.email,
            nombre: user.nombre,
            rol: user.rol,
            negocioIds: user.negocioIds,
            negocioActivo: user.negocioActivo
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ message: 'Error al actualizar rol de usuario' });
    }
};

// Eliminar usuario (solo dentro de su negocio, no se puede borrar admin)
export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // No puedes borrarte a ti mismo
        if (id === req.userId) {
            return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });
        }

        // Verificar que el usuario pertenece al mismo negocio
        const user = await User.findOne({ _id: id, negocioIds: req.negocioId });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado en tu negocio' });
        }

        // No se puede borrar a un admin (solo desde el panel web futuro)
        if (user.rol === 'admin') {
            return res.status(403).json({ message: 'No puedes eliminar a un administrador. Contacta soporte.' });
        }

        await User.findByIdAndDelete(id);

        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error al eliminar usuario' });
    }
};
