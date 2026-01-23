import { Request, Response } from 'express';
import MenuConfig from '../models/MenuConfig';

// Get menu configuration (public - no auth required)
export const getMenuConfig = async (req: Request, res: Response) => {
    try {
        // There should only be one config document, get or create it
        let config = await MenuConfig.findOne();
        
        if (!config) {
            // Create default config if none exists
            config = await MenuConfig.create({});
        }
        
        res.json(config);
    } catch (error: any) {
        res.status(500).json({ message: 'Error al obtener configuración', error: error.message });
    }
};

// Update menu configuration (protected - admin only)
export const updateMenuConfig = async (req: Request, res: Response) => {
    try {
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

        // Find the single config or create one
        let config = await MenuConfig.findOne();
        
        if (!config) {
            config = new MenuConfig({});
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
