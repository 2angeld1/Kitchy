import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Especialista from '../models/Especialista';

export const getEspecialistas = async (req: AuthRequest, res: Response) => {
    try {
        const especialistas = await Especialista.find({ negocioId: req.negocioId, activo: true });
        res.json(especialistas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener especialistas' });
    }
};

export const crearEspecialista = async (req: AuthRequest, res: Response) => {
    try {
        const { nombre, comision } = req.body;
        const nuevo = new Especialista({
            nombre,
            comision: comision || 50,
            negocioId: req.negocioId
        });
        await nuevo.save();
        res.status(201).json(nuevo);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear especialista' });
    }
};

export const eliminarEspecialista = async (req: AuthRequest, res: Response) => {
    try {
        await Especialista.findByIdAndUpdate(req.params.id, { activo: false });
        res.json({ message: 'Especialista dado de baja correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar' });
    }
};
