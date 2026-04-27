import { Response } from 'express';
import Negocio from '../models/Negocio';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { uploadImage } from '../utils/imageUpload';
import jwt, { SignOptions } from 'jsonwebtoken';

// Conseguir los negocios del usuario actual
export const getUserNegocios = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.userId).populate('negocioIds', 'nombre logo tipo categoria config comisionConfig pilotStatus pilotStartDate accumulatedSalesMonth billingCycleStart onboardingStep');
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
        const { nombre, tipo, categoria, direccion, telefono, logo, googleMapsReviewUrl } = req.body;

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
            logo: logoUrl,
            googleMapsReviewUrl
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
        await user.populate([
            { path: 'negocioIds', select: 'nombre logo tipo categoria comisionConfig onboardingStep telefono' },
            { path: 'negocioActivo', select: 'nombre logo tipo categoria comisionConfig onboardingStep telefono' }
        ]);

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
        await user.populate([
            { path: 'negocioIds', select: 'nombre logo tipo categoria comisionConfig onboardingStep telefono' },
            { path: 'negocioActivo', select: 'nombre logo tipo categoria comisionConfig onboardingStep telefono' }
        ]);

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

// Actualizar configuración de comisiones (BELLEZA: Fijo o Escalonado)
export const updateComisionConfig = async (req: AuthRequest, res: Response) => {
    try {
        const { tipo, fijo, escalonado, cortesPorCiclo, tareas, bonoPorTarea } = req.body;

        const negocio = await Negocio.findById(req.negocioId);
        if (!negocio) {
            return res.status(404).json({ message: 'Negocio no encontrado' });
        }

        negocio.comisionConfig = {
            tipo: tipo || 'escalonado',
            fijo: fijo || { porcentajeBarbero: 50, porcentajeDueno: 50 },
            escalonado: escalonado || [],
            cortesPorCiclo: Number(cortesPorCiclo || 5),
            tareas: tareas || negocio.comisionConfig?.tareas || [],
            bonoPorTarea: bonoPorTarea !== undefined ? Number(bonoPorTarea) : (negocio.comisionConfig?.bonoPorTarea ?? 5)
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

// Actualizar configuración de comisiones de REVENTA (% global para venta de productos)
export const updateComisionReventaConfig = async (req: AuthRequest, res: Response) => {
    try {
        const { porcentajeGlobal } = req.body;

        const negocio = await Negocio.findById(req.negocioId);
        if (!negocio) {
            return res.status(404).json({ message: 'Negocio no encontrado' });
        }

        (negocio as any).comisionReventa = {
            porcentajeGlobal: Number(porcentajeGlobal) || 10
        };

        await negocio.save();

        res.json({
            success: true,
            message: 'Comisión de reventa actualizada',
            comisionReventa: (negocio as any).comisionReventa
        });
    } catch (error) {
        console.error('Error updating comision reventa config:', error);
        res.status(500).json({ message: 'Error al actualizar comisión de reventa' });
    }
};

// Obtener los detalles del negocio actual
export const obtenerNegocioActual = async (req: AuthRequest, res: Response) => {
    try {
        const negocio = await Negocio.findById(req.negocioId);
        if (!negocio) {
            return res.status(404).json({ message: 'Negocio no encontrado' });
        }
        res.json(negocio);
    } catch (error) {
        console.error('Error fetching business info:', error);
        res.status(500).json({ message: 'Error al obtener información del negocio' });
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

// Actualizar el paso de onboarding del usuario
export const updateOnboardingStep = async (req: AuthRequest, res: Response) => {
    try {
        const { step } = req.body;
        const negocioId = req.negocioId;

        if (step === undefined || typeof step !== 'number') {
            return res.status(400).json({ message: 'Paso de onboarding inválido' });
        }

        const negocio = await Negocio.findById(negocioId);
        if (!negocio) {
            return res.status(404).json({ message: 'Negocio no encontrado' });
        }

        negocio.onboardingStep = step;
        await negocio.save();

        res.json({ success: true, onboardingStep: negocio.onboardingStep, message: 'Paso actualizado' });
    } catch (error) {
        console.error('Error updating onboarding step:', error);
        res.status(500).json({ message: 'Error al actualizar paso de onboarding' });
    }
};

export const updateNegocio = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, tipo, categoria, direccion, telefono, logo, horarios, googleMapsReviewUrl } = req.body;

        const negocio = await Negocio.findById(id);
        if (!negocio) {
            return res.status(404).json({ message: 'Negocio no encontrado' });
        }

        if (negocio.propietario.toString() !== req.userId) {
            return res.status(403).json({ message: 'No tienes permiso para editar este negocio' });
        }

        let logoUrl = logo;
        if (logo && logo.startsWith('data:image')) {
            logoUrl = (await uploadImage(logo, 'logos_negocios')) || undefined;
        }

        negocio.nombre = nombre || negocio.nombre;
        negocio.tipo = tipo || negocio.tipo;
        negocio.categoria = categoria || negocio.categoria;
        negocio.direccion = direccion !== undefined ? direccion : negocio.direccion;
        negocio.telefono = telefono !== undefined ? telefono : negocio.telefono;
        if (logoUrl) negocio.logo = logoUrl;
        if (horarios) negocio.horarios = horarios;
        if (googleMapsReviewUrl !== undefined) negocio.googleMapsReviewUrl = googleMapsReviewUrl;

        await negocio.save();
        res.json({ success: true, negocio });
    } catch (error) {
        console.error('Error updating negocio:', error);
        res.status(500).json({ message: 'Error al actualizar negocio' });
    }
};

export const deleteNegocio = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const negocio = await Negocio.findById(id);
        if (!negocio) {
            return res.status(404).json({ message: 'Negocio no encontrado' });
        }

        if (negocio.propietario.toString() !== req.userId) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este negocio' });
        }

        await Negocio.findByIdAndDelete(id);

        const user = await User.findById(req.userId);
        if (user) {
            user.negocioIds = user.negocioIds.filter(nid => nid.toString() !== id);
            if (user.negocioActivo?.toString() === id) {
                user.negocioActivo = user.negocioIds.length > 0 ? user.negocioIds[0] : undefined as any;
            }
            await user.save();
        }

        res.json({ success: true, message: 'Negocio eliminado correctamente' });
    } catch (error) {
        console.error('Error deleting negocio:', error);
        res.status(500).json({ message: 'Error al eliminar negocio' });
    }
};
