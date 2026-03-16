import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/User';
import Negocio from '../models/Negocio';
import { enviarEmailRecuperacion } from '../services/emailService';
import { uploadImage } from '../utils/imageUpload';
import { AuthRequest } from '../middleware/auth';

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.userId).populate('negocioIds', 'nombre logo tipo');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        res.json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                name: user.nombre,
                nombre: user.nombre, // para compatibilidad con ambos
                role: user.rol,
                rol: user.rol,
                negocioIds: user.negocioIds,
                negocioActivo: user.negocioActivo
            }
        });
    } catch (error) {
        console.error('Error en getProfile:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Por favor ingresa usuario y contraseña' });
        }

        const user = await User.findOne({ email }).populate('negocioIds', 'nombre logo tipo categoria');
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';

        const token = jwt.sign(
            { userId: user._id },
            jwtSecret,
            { expiresIn: '30d' } as SignOptions
        );

        // Populate para que el frontend tenga los nombres de los negocios
        await user.populate('negocioIds', 'nombre logo tipo categoria');

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                nombre: user.nombre,
                rol: user.rol,
                negocioIds: user.negocioIds,
                negocioActivo: user.negocioActivo
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, nombre, negocioNombre, tipoNegocio, categoriaNegocio, direccion, telefono, logo } = req.body;

        if (!email || !password || !nombre || !negocioNombre) {
            return res.status(400).json({ message: 'Nombre, email, contraseña y nombre del negocio son obligatorios' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El email ya existe' });
        }

        const user = new User({
            email,
            password,
            nombre,
            rol: 'admin',
            negocioIds: [],
            negocioActivo: undefined
        });

        const savedUser = await user.save();

        // Subir logo a Cloudinary si existe (base64)
        let logoUrl = logo;
        if (logo && logo.startsWith('data:image')) {
            logoUrl = (await uploadImage(logo, 'logos_negocios')) || undefined;
        }

        const negocio = new Negocio({
            nombre: negocioNombre,
            tipo: tipoNegocio || 'comida',
            categoria: categoriaNegocio || 'COMIDA',
            propietario: savedUser._id,
            direccion,
            telefono,
            logo: logoUrl
        });

        const savedNegocio = await negocio.save();

        // Enlazar negocio al usuario
        savedUser.negocioIds = [savedNegocio._id as any];
        savedUser.negocioActivo = savedNegocio._id as any;
        await savedUser.save();

        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';

        const token = jwt.sign(
            { userId: savedUser._id },
            jwtSecret,
            { expiresIn: '30d' } as SignOptions
        );

        await savedUser.populate('negocioIds', 'nombre logo tipo categoria');

        res.status(201).json({
            success: true,
            token,
            user: {
                id: savedUser._id,
                email: savedUser.email,
                nombre: savedUser.nombre,
                rol: savedUser.rol,
                negocioIds: savedUser.negocioIds,
                negocioActivo: savedUser.negocioActivo
            }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Por favor ingresa tu email' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const resetToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '1h' }
        );

        await enviarEmailRecuperacion(email, resetToken);

        res.json({ success: true, message: 'Email de recuperación enviado' });
    } catch (error) {
        console.error('Error en forgotPassword:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: 'Token y contraseña son requeridos' });
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        user.password = password;
        await user.save();

        res.json({ success: true, message: 'Contraseña restablecida correctamente' });
    } catch (error) {
        console.error('Error en resetPassword:', error);
        res.status(500).json({ message: 'Token inválido o expirado' });
    }
};