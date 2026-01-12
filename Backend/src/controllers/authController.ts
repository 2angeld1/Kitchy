import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/User';
import { enviarEmailRecuperacion } from '../services/emailService'; // Importa el servicio

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body; // Cambia username por email

        // Validar datos
        if (!email || !password) {
            return res.status(400).json({ message: 'Por favor ingresa usuario y contraseña' });
        }

        // Buscar usuario
        const user = await User.findOne({ email }); // Cambia username por email
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar token
        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';

        const token = jwt.sign(
            { userId: user._id },
            jwtSecret,
            { expiresIn: '30d' } as SignOptions
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email, // Cambia username a email
                nombre: user.nombre,
                rol: user.rol
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, nombre, rol } = req.body; // Quita username

        // Validar datos
        if (!email || !password || !nombre) { // Quita username
            return res.status(400).json({ message: 'Por favor completa todos los campos' });
        }

        // Verificar si el usuario ya existe (solo por email)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El email ya existe' });
        }

        // Crear nuevo usuario
        const user = new User({
            email, // Quita username
            password,
            nombre,
            rol: 'usuario' // Siempre asignar rol 'usuario' por defecto en el registro
        });

        await user.save();

        // Generar token
        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';

        const token = jwt.sign(
            { userId: user._id },
            jwtSecret,
            { expiresIn: '30d' } as SignOptions
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email, // Cambia username a email
                nombre: user.nombre,
                rol: user.rol
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

        // Buscar usuario por email (asumiendo que agregas un campo 'email' al modelo User)
        const user = await User.findOne({ email }); // Cambia si usas username
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Generar token de reset (expira en 1 hora)
        const resetToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '1h' }
        );

        // Enviar email
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

        // Verificar token
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Actualizar contraseña
        user.password = password; // Se hashea automáticamente por el pre-save hook
        await user.save();

        res.json({ success: true, message: 'Contraseña restablecida correctamente' });
    } catch (error) {
        console.error('Error en resetPassword:', error);
        res.status(500).json({ message: 'Token inválido o expirado' });
    }
};