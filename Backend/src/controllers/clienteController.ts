import { Response } from 'express';
import Cliente from '../models/Cliente';
import { AuthRequest } from '../middleware/auth';

export const buscarClientes = async (req: AuthRequest, res: Response) => {
    try {
        const { q } = req.query;
        const negocioId = req.negocioId;

        if (!q || String(q).length < 3) {
            return res.json([]);
        }

        // Buscar por nombre (regex), teléfono o email
        const clientes = await Cliente.find({
            negocioId,
            $or: [
                { nombre: { $regex: q, $options: 'i' } },
                { telefono: { $regex: q } },
                { email: { $regex: q, $options: 'i' } }
            ]
        }).limit(10);

        res.json(clientes);
    } catch (error: any) {
        res.status(500).json({ message: 'Error al buscar clientes', error: error.message });
    }
};

export const obtenerClientesRecientes = async (req: AuthRequest, res: Response) => {
    try {
        const negocioId = req.negocioId;
        const clientes = await Cliente.find({ negocioId })
            .sort({ ultimaVisita: -1 })
            .limit(10);
        res.json(clientes);
    } catch (error: any) {
        res.status(500).json({ message: 'Error al obtener clientes recientes', error: error.message });
    }
};
