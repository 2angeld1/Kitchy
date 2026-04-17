import { Response } from 'express';
import Venta, { IVenta } from '../models/Venta';
import Producto from '../models/Producto';
import Inventario from '../models/Inventario';
import Negocio from '../models/Negocio';
import { AuthRequest } from '../middleware/auth';
import { getPeriodRanges } from '../utils/date-ranges';
import { crearVentaService, actualizarVentaService } from '../services/ventaService';

// Crear una nueva venta
export const crearVenta = async (req: AuthRequest, res: Response) => {
    try {
        const { items, metodoPago, cliente, notas, especialista, pagoCombinado } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'La venta debe tener al menos un producto' });
        }

        const result = await crearVentaService(
            items,
            metodoPago,
            cliente,
            notas,
            especialista,
            req.userId as string,
            req.negocioId as string,
            pagoCombinado
        );

        res.status(201).json({
            venta: result.venta,
            inventarioActualizado: result.inventarioActualizado,
            message: result.deduccionesAplicadas
                ? 'Venta registrada y los insumos han sido descontados del inventario.'
                : 'Venta registrada.'
        });
    } catch (error: any) {
        console.error('Error al crear venta:', error);
        
        // Retornar 400 o 404 para errores lógicos conocidos
        let status = 500;
        if (error.message.includes('Producto no disponible')) status = 400;
        if (error.message.includes('Item no encontrado')) status = 404;
        
        res.status(status).json({ message: 'Error al crear la venta', error: error.message });
    }
};

// Obtener todas las ventas (con filtros)
export const obtenerVentas = async (req: AuthRequest, res: Response) => {
    try {
        const { fecha, fechaInicio, fechaFin, usuario, metodoPago, limite = 50 } = req.query;
        const filtro: any = { negocioId: req.negocioId };

        if (fecha) {
            // Ajuste para Panamá (-5h): Para ver "Hoy" local, buscamos desde las 05:00 UTC de hoy hasta las 04:59 UTC de mañana
            const base = new Date(fecha as string);
            const inicio = new Date(base);
            inicio.setUTCHours(5, 0, 0, 0); // 00:00 AM Panamá
            
            const fin = new Date(inicio);
            fin.setUTCDate(fin.getUTCDate() + 1);
            fin.setUTCMilliseconds(-1); // 23:59:59 PM Panamá

            filtro.createdAt = {
                $gte: inicio,
                $lte: fin
            };
        } else if (fechaInicio && fechaFin) {
            const inicio = new Date(fechaInicio as string);
            inicio.setUTCHours(5, 0, 0, 0); // 00:00 AM Panamá

            const fin = new Date(fechaFin as string);
            fin.setUTCDate(fin.getUTCDate() + 1);
            fin.setUTCHours(4, 59, 59, 999); // 23:59:59 PM Panamá

            filtro.createdAt = {
                $gte: inicio,
                $lte: fin
            };
        } else if (fechaInicio) {
            filtro.createdAt = { $gte: new Date(fechaInicio as string) };
        } else if (fechaFin) {
            filtro.createdAt = { $lte: new Date(fechaFin as string) };
        }

        if (usuario) {
            filtro.usuario = usuario;
        }
        if (metodoPago) {
            filtro.metodoPago = metodoPago;
        }

        const ventas = await Venta.find(filtro)
            .sort({ createdAt: -1 })
            .limit(Number(limite))
            .populate('usuario', 'nombre email')
            .populate('especialista', 'nombre comision tipoComision')
            .populate('items.producto', 'nombre precio categoria');

        res.json(ventas);
    } catch (error: any) {
        console.error('Error al obtener ventas:', error);
        res.status(500).json({ message: 'Error al obtener ventas', error: error.message });
    }
};

// Obtener una venta por ID
export const obtenerVentaPorId = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const venta = await Venta.findOne({ _id: id, negocioId: req.negocioId })
            .populate('usuario', 'nombre email')
            .populate('items.producto', 'nombre precio categoria');

        if (!venta) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        res.json(venta);
    } catch (error: any) {
        console.error('Error al obtener venta:', error);
        res.status(500).json({ message: 'Error al obtener la venta', error: error.message });
    }
};

// Obtener ventas del día
export const obtenerVentasHoy = async (req: AuthRequest, res: Response) => {
    try {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);

        const ventas = await Venta.find({
            negocioId: req.negocioId,
            createdAt: { $gte: hoy, $lt: manana }
        })
            .sort({ createdAt: -1 })
            .populate('usuario', 'nombre email');

        const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);
        const cantidadVentas = ventas.length;

        res.json({
            ventas,
            resumen: {
                totalVentas,
                cantidadVentas,
                fecha: hoy.toISOString().split('T')[0]
            }
        });
    } catch (error: any) {
        console.error('Error al obtener ventas del día:', error);
        res.status(500).json({ message: 'Error al obtener ventas del día', error: error.message });
    }
};

// Obtener estadísticas de ventas
export const obtenerEstadisticas = async (req: AuthRequest, res: Response) => {
    try {
        const { fechaInicio, fechaFin } = req.query;

        let filtro: any = { negocioId: req.negocioId };
        if (fechaInicio && fechaFin) {
            const inicio = new Date(fechaInicio as string);
            inicio.setUTCHours(5, 0, 0, 0);

            const fin = new Date(fechaFin as string);
            fin.setUTCDate(fin.getUTCDate() + 1);
            fin.setUTCHours(4, 59, 59, 999);

            filtro.createdAt = {
                $gte: inicio,
                $lte: fin
            };
        } else if (fechaInicio) {
            filtro.createdAt = { $gte: new Date(fechaInicio as string) };
        } else if (fechaFin) {
            filtro.createdAt = { $lte: new Date(fechaFin as string) };
        }

        const ventas = await Venta.find(filtro);

        const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);
        const cantidadVentas = ventas.length;
        const promedioVenta = cantidadVentas > 0 ? totalVentas / cantidadVentas : 0;

        // Ventas por método de pago
        const ventasPorMetodo: { [key: string]: { cantidad: number; total: number } } = {};
        ventas.forEach(venta => {
            if (!ventasPorMetodo[venta.metodoPago]) {
                ventasPorMetodo[venta.metodoPago] = { cantidad: 0, total: 0 };
            }
            ventasPorMetodo[venta.metodoPago].cantidad++;
            ventasPorMetodo[venta.metodoPago].total += venta.total;
        });

        // Productos más vendidos
        const productosCantidad: { [key: string]: { nombre: string; cantidad: number; total: number } } = {};
        ventas.forEach(venta => {
            venta.items.forEach(item => {
                const key = item.nombreProducto;
                if (!productosCantidad[key]) {
                    productosCantidad[key] = { nombre: key, cantidad: 0, total: 0 };
                }
                productosCantidad[key].cantidad += item.cantidad;
                productosCantidad[key].total += item.subtotal;
            });
        });

        const productosMasVendidos = Object.values(productosCantidad)
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 10);

        res.json({
            totalVentas,
            cantidadVentas,
            promedioVenta: promedioVenta.toFixed(2),
            ventasPorMetodo,
            productosMasVendidos
        });
    } catch (error: any) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
    }
};

// Eliminar venta (solo admin)
export const eliminarVenta = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const venta = await Venta.findOneAndDelete({ _id: id, negocioId: req.negocioId });
        if (!venta) {
            return res.status(404).json({ message: 'Venta no encontrada o no pertenece a tu negocio' });
        }

        res.json({ message: 'Venta eliminada correctamente' });
    } catch (error: any) {
        console.error('Error al eliminar venta:', error);
        res.status(500).json({ message: 'Error al eliminar la venta', error: error.message });
    }
};

// Actualizar una venta existente
export const actualizarVenta = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { items, metodoPago, cliente, notas, especialista, pagoCombinado } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'La venta debe tener al menos un producto' });
        }

        const venta = await actualizarVentaService(
            id,
            items,
            metodoPago,
            cliente,
            notas,
            especialista,
            req.userId as string,
            req.negocioId as string,
            pagoCombinado
        );

        res.status(200).json({
            venta,
            inventarioActualizado: true,
            message: 'Venta editada y el inventario ajustado.'
        });
    } catch (error: any) {
        console.error('Error al actualizar venta:', error);
        
        if (error.message === 'NOT_FOUND') {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }
        
        let status = 500;
        if (error.message.includes('Producto no disponible')) status = 400;
        if (error.message.includes('Item no encontrado')) status = 404;
        
        res.status(status).json({ message: 'Error al actualizar la venta', error: error.message });
    }
};
