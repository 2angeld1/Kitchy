import { Request, Response } from 'express';
import MenuConfig from '../models/MenuConfig';

// Get menu configuration (public - query ?negocioId=xxx required)
export const getMenuConfig = async (req: Request, res: Response) => {
    try {
        const { negocioId } = req.query;
        if (!negocioId) {
            return res.status(400).json({ message: 'negocioId es requerido' });
        }

        let config = await MenuConfig.findOne({ negocioId });

        if (!config) {
            return res.status(404).json({ message: 'Configuración no encontrada para este negocio' });
        }

        res.json(config);
    } catch (error: any) {
        res.status(500).json({ message: 'Error al obtener configuración', error: error.message });
    }
};

import { AuthRequest } from '../middleware/auth';

// Update menu configuration (protected - admin only)
export const updateMenuConfig = async (req: AuthRequest, res: Response) => {
    try {
        const negocioId = req.negocioId;
        if (!negocioId) {
            return res.status(403).json({ message: 'No tienes un negocio asociado' });
        }
        const {
            nombreRestaurante,
            subtitulo,
            tema,
            colorPrimario,
            colorSecundario,
            imagenHero,
            telefono,
            direccion,
            horario,
            redesSociales
        } = req.body;

        // Find the config or create one for this business
        let config = await MenuConfig.findOne({ negocioId });

        if (!config) {
            config = new MenuConfig({ negocioId });
        }

        // Update fields if provided
        if (nombreRestaurante !== undefined) config.nombreRestaurante = nombreRestaurante;
        if (subtitulo !== undefined) config.subtitulo = subtitulo;
        if (tema !== undefined) config.tema = tema;
        if (colorPrimario !== undefined) config.colorPrimario = colorPrimario;
        if (colorSecundario !== undefined) config.colorSecundario = colorSecundario;
        if (imagenHero !== undefined) config.imagenHero = imagenHero;
        if (telefono !== undefined) config.telefono = telefono;
        if (direccion !== undefined) config.direccion = direccion;
        if (horario !== undefined) config.horario = horario;
        if (redesSociales !== undefined) config.redesSociales = redesSociales;

        await config.save();

        res.json(config);
    } catch (error: any) {
        res.status(500).json({ message: 'Error al actualizar configuración', error: error.message });
    }
};
