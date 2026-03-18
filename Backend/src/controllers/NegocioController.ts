import { Response } from 'express';
import Negocio from '../models/Negocio';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { uploadImage } from '../utils/imageUpload';
import jwt, { SignOptions } from 'jsonwebtoken';

// Conseguir los negocios del usuario actual
export const getUserNegocios = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.userId).populate('negocioIds', 'nombre logo tipo categoria config pilotStatus pilotStartDate accumulatedSalesMonth billingCycleStart');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user.negocioIds);
    } catch (error) {
        console.error('Error fetching user negocios:', error);
        res.status(500).json({ message: 'Error al obtener negocios' });
    }
};

// Crear un nuevo negocio (solo admin)
export const createNegocio = async (req: AuthRequest, res: Response) => {
    try {
        const { nombre, tipo, categoria, direccion, telefono, logo } = req.body;

        if (!nombre) {
            return res.status(400).json({ message: 'El nombre del negocio es obligatorio' });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Subir logo a Cloudinary si existe (base64)
        let logoUrl = logo;
        if (logo && logo.startsWith('data:image')) {
            logoUrl = (await uploadImage(logo, 'logos_negocios')) || undefined;
        }

        const nuevoNegocio = new Negocio({
            nombre,
            tipo: tipo || 'comida',
            categoria: categoria || 'COMIDA',
            propietario: user._id,
            direccion,
            telefono,
            logo: logoUrl
        });

        const savedNegocio = await nuevoNegocio.save();

        // Enlazar al usuario
        user.negocioIds.push(savedNegocio._id as any);
        // Opcional: ¿cambiar al negocio nuevo automáticamente?
        user.negocioActivo = savedNegocio._id as any;
        await user.save();

        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
        const token = jwt.sign(
            { userId: user._id },
            jwtSecret,
            { expiresIn: '30d' } as SignOptions
        );

        // Populate para que el usuario tenga los objetos negocio completos
        await user.populate('negocioIds', 'nombre logo tipo categoria');

        res.status(201).json({
            success: true,
            negocio: savedNegocio,
            token, // Retornamos un token nuevo por si en el frontend lo necesitan
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
        console.error('Error creating negocio:', error);
        res.status(500).json({ message: 'Error al crear negocio' });
    }
};

// Cambiar negocio activo
export const switchNegocio = async (req: AuthRequest, res: Response) => {
    try {
        const { negocioId } = req.params;

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar que el negocio al que quiere cambiar le pertenece
        const hasAccess = user.negocioIds.some(id => id.toString() === negocioId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'No tienes acceso a este negocio' });
        }

        user.negocioActivo = negocioId as any;
        await user.save();

        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
        const token = jwt.sign(
            { userId: user._id },
            jwtSecret,
            { expiresIn: '30d' } as SignOptions
        );

        // Retornamos el user completo con los negocios parseados si es necesario, 
        // pero basta con actualizar token y context allá
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
            },
            message: 'Negocio cambiado correctamente'
        });
    } catch (error) {
        console.error('Error switching negocio:', error);
        res.status(500).json({ message: 'Error al cambiar de negocio' });
    }
};

// Actualizar configuración de comisiones (solo para BELLEZA)
export const updateComisionConfig = async (req: AuthRequest, res: Response) => {
    try {
        const { porcentajeBarbero, porcentajeDueno, cortesPorCiclo } = req.body;

        const negocio = await Negocio.findById(req.negocioId);
        if (!negocio) {
            return res.status(404).json({ message: 'Negocio no encontrado' });
        }

        negocio.comisionConfig = {
            porcentajeBarbero: Number(porcentajeBarbero),
            porcentajeDueno: Number(porcentajeDueno),
            cortesPorCiclo: Number(cortesPorCiclo)
        };

        await negocio.save();

        res.json({
            success: true,
            message: 'Configuración de comisiones actualizada',
            config: negocio.comisionConfig
        });
    } catch (error) {
        console.error('Error updating comision config:', error);
        res.status(500).json({ message: 'Error al actualizar configuración' });
    }
};

// Actualizar configuración del negocio (como el margen objetivo)
export const updateConfig = async (req: AuthRequest, res: Response) => {
    try {
        const { margenObjetivo, impuesto, moneda } = req.body;
        const negocioId = req.negocioId;

        const negocio = await Negocio.findById(negocioId);
        if (!negocio) {
            return res.status(404).json({ message: 'Negocio no encontrado' });
        }

        if (margenObjetivo !== undefined) negocio.config.margenObjetivo = margenObjetivo;
        if (impuesto !== undefined) negocio.config.impuesto = impuesto;
        if (moneda !== undefined) negocio.config.moneda = moneda;

        await negocio.save();

        res.json({ message: 'Configuración actualizada', config: negocio.config });
    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).json({ message: 'Error al actualizar configuración del negocio' });
    }
};
