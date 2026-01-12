import { Response } from 'express';
import Venta, { IVenta } from '../models/Venta';
import Producto from '../models/Producto';
import { AuthRequest } from '../middleware/auth';

// Crear una nueva venta
export const crearVenta = async (req: AuthRequest, res: Response) => {
    try {
        const { items, metodoPago, cliente, notas } = req.body;
        const userId = req.userId;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'La venta debe tener al menos un producto' });
        }

        // Procesar items y calcular totales
        const itemsProcesados = [];
        let total = 0;

        for (const item of items) {
            const producto = await Producto.findById(item.productoId);
            if (!producto) {
                return res.status(404).json({ message: `Producto no encontrado: ${item.productoId}` });
            }
            if (!producto.disponible) {
                return res.status(400).json({ message: `Producto no disponible: ${producto.nombre}` });
            }

            const subtotal = producto.precio * item.cantidad;
            itemsProcesados.push({
                producto: producto._id,
                nombreProducto: producto.nombre,
                cantidad: item.cantidad,
                precioUnitario: producto.precio,
                subtotal
            });
            total += subtotal;
        }

        const venta = new Venta({
            items: itemsProcesados,
            total,
            metodoPago: metodoPago || 'efectivo',
            usuario: userId,
            cliente,
            notas
        });

        await venta.save();
        
        // Populate para devolver datos completos
        await venta.populate('usuario', 'nombre email');
        
        res.status(201).json(venta);
    } catch (error: any) {
        console.error('Error al crear venta:', error);
        res.status(500).json({ message: 'Error al crear la venta', error: error.message });
    }
};

// Obtener todas las ventas (con filtros)
export const obtenerVentas = async (req: AuthRequest, res: Response) => {
    try {
        const { fechaInicio, fechaFin, usuario, metodoPago, limite = 50 } = req.query;
        const filtro: any = {};

        if (fechaInicio && fechaFin) {
            filtro.createdAt = {
                $gte: new Date(fechaInicio as string),
                $lte: new Date(fechaFin as string)
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
            .populate('usuario', 'nombre email');

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
        const venta = await Venta.findById(id)
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

        let filtroFecha: any = {};
        if (fechaInicio && fechaFin) {
            filtroFecha.createdAt = {
                $gte: new Date(fechaInicio as string),
                $lte: new Date(fechaFin as string)
            };
        }

        const ventas = await Venta.find(filtroFecha);

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

        const venta = await Venta.findByIdAndDelete(id);
        if (!venta) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        res.json({ message: 'Venta eliminada correctamente' });
    } catch (error: any) {
        console.error('Error al eliminar venta:', error);
        res.status(500).json({ message: 'Error al eliminar la venta', error: error.message });
    }
};
