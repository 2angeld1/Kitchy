import { Response } from 'express';
import Gasto, { IGasto } from '../models/Gasto';
import { AuthRequest } from '../middleware/auth';
import { startOfMonth, endOfMonth } from 'date-fns';

// Crear un nuevo gasto
export const crearGasto = async (req: AuthRequest, res: Response) => {
    try {
        const { descripcion, monto, subtotal, itbms, categoria, fecha, comprobante, proveedor, ruc, dv, nroFactura } = req.body;
        const userId = req.userId;

        const gasto = new Gasto({
            descripcion,
            monto,
            subtotal: subtotal || monto,
            itbms: itbms || 0,
            categoria: categoria || 'otro',
            fecha: fecha || new Date(),
            comprobante,
            proveedor,
            ruc,
            dv,
            nroFactura,
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

// Exportar gastos a CSV (excel friendly)
export const exportarGastosCsv = async (req: AuthRequest, res: Response) => {
    try {
        const { mes, anio, fechaDesde, fechaHasta } = req.query;
        let filtro: any = { negocioId: req.negocioId };

        if (fechaDesde || fechaHasta) {
            filtro.fecha = {};
            if (fechaDesde) filtro.fecha.$gte = new Date(fechaDesde as string);
            if (fechaHasta) filtro.fecha.$lte = new Date(fechaHasta as string);
        } else if (mes && anio) {
            const fecha = new Date(Number(anio), Number(mes) - 1, 1);
            filtro.fecha = {
                $gte: startOfMonth(fecha),
                $lte: endOfMonth(fecha)
            };
        }

        const gastos = await Gasto.find(filtro).sort({ fecha: 1 });

        // Cabeceras del CSV
        let csv = 'Fecha,Proveedor,RUC,DV,Factura,Descripcion,Categoria,Subtotal,ITBMS,Total\n';

        // Filas
        gastos.forEach(g => {
            const fechaFmt = g.fecha ? new Date(g.fecha).toLocaleDateString('es-PA') : '';
            const row = [
                fechaFmt,
                `"${g.proveedor || ''}"`,
                `"${g.ruc || ''}"`,
                `"${g.dv || ''}"`,
                `"${g.nroFactura || ''}"`,
                `"${g.descripcion || ''}"`,
                g.categoria,
                (g.subtotal || g.monto).toFixed(2),
                (g.itbms || 0).toFixed(2),
                (g.monto || 0).toFixed(2)
            ];
            csv += row.join(',') + '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=Reporte_Contable_Kitchy.csv`);
        res.status(200).send(csv);

    } catch (error: any) {
        console.error('Error al exportar gastos:', error);
        res.status(500).json({ message: 'Error al generar el reporte CSV', error: error.message });
    }
};
