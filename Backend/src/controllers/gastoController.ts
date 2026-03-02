import { Response } from 'express';
import Gasto, { IGasto } from '../models/Gasto';
import { AuthRequest } from '../middleware/auth';
import { startOfMonth, endOfMonth } from 'date-fns';

// Crear un nuevo gasto
export const crearGasto = async (req: AuthRequest, res: Response) => {
    try {
        const { descripcion, monto, categoria, fecha, comprobante } = req.body;
        const userId = req.userId;

        const gasto = new Gasto({
            descripcion,
            monto,
            categoria: categoria || 'otro',
            fecha: fecha || new Date(),
            comprobante,
            usuario: userId,
            negocioId: req.negocioId
        });

        await gasto.save();
        res.status(201).json(gasto);
    } catch (error: any) {
        console.error('Error al crear gasto:', error);
        res.status(500).json({ message: 'Error al registrar el gasto', error: error.message });
    }
};

// Obtener gastos (con filtros por mes por defecto)
export const obtenerGastos = async (req: AuthRequest, res: Response) => {
    try {
        const { mes, anio, categoria } = req.query;
        let filtro: any = { negocioId: req.negocioId };

        if (mes && anio) {
            const fecha = new Date(Number(anio), Number(mes) - 1, 1);
            filtro.fecha = {
                $gte: startOfMonth(fecha),
                $lte: endOfMonth(fecha)
            };
        }

        if (categoria) {
            filtro.categoria = categoria;
        }

        const gastos = await Gasto.find(filtro).sort({ fecha: -1 });
        res.json(gastos);
    } catch (error: any) {
        console.error('Error al obtener gastos:', error);
        res.status(500).json({ message: 'Error al obtener los gastos', error: error.message });
    }
};

// Eliminar gasto
export const eliminarGasto = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const gasto = await Gasto.findOneAndDelete({ _id: id, negocioId: req.negocioId });

        if (!gasto) {
            return res.status(404).json({ message: 'Gasto no encontrado' });
        }

        res.json({ message: 'Gasto eliminado correctamente' });
    } catch (error: any) {
        console.error('Error al eliminar gasto:', error);
        res.status(500).json({ message: 'Error al eliminar el gasto', error: error.message });
    }
};
