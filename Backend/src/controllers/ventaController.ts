import { Response } from 'express';
import Venta, { IVenta } from '../models/Venta';
import Producto from '../models/Producto';
import Inventario from '../models/Inventario';
import Negocio from '../models/Negocio';
import { AuthRequest } from '../middleware/auth';
import { getPeriodRanges } from '../utils/date-ranges';

// Crear una nueva venta
export const crearVenta = async (req: AuthRequest, res: Response) => {
    try {
        const { items, metodoPago, cliente, notas, especialista } = req.body;
        const userId = req.userId;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'La venta debe tener al menos un producto' });
        }

        // Procesar items y calcular totales
        const itemsProcesados = [];
        let total = 0;

        // Array para guardar las deducciones necesarias del inventario
        const deduccionesInventario: { inventarioId: any, cantidadADescontar: number }[] = [];

        for (const item of items) {
            let itemData = null;
            const isManual = String(item.productoId).startsWith('manual-');

            // Solo buscar en DB si es un ID de Mongo válido y no es un item manual
            if (!isManual && item.productoId.length === 24) {
                itemData = await Producto.findOne({ _id: item.productoId, negocioId: req.negocioId });
            }

            let nombreProducto = item.nombre || '';
            let precioUnitario = item.precio || 0;
            let finalId = isManual ? null : item.productoId;

            if (itemData) {
                if (!itemData.disponible) {
                    return res.status(400).json({ message: `Producto no disponible: ${itemData.nombre}` });
                }
                nombreProducto = itemData.nombre;
                precioUnitario = itemData.precio;
                finalId = itemData._id;

                // Si tiene receta, descontar ingredientes
                if (itemData.ingredientes && itemData.ingredientes.length > 0) {
                    for (const ingrediente of itemData.ingredientes) {
                        deduccionesInventario.push({
                            inventarioId: ingrediente.inventario,
                            cantidadADescontar: ingrediente.cantidad * item.cantidad
                        });
                    }
                }
            } else if (!isManual) {
                // Si no es manual y no se encontró en Producto, buscamos en Inventario directamente (para reventa)
                const itemInv = await Inventario.findOne({ _id: item.productoId, negocioId: req.negocioId });
                if (itemInv) {
                    nombreProducto = itemInv.nombre;
                    precioUnitario = itemInv.precioVenta || itemInv.costoUnitario;
                    finalId = itemInv._id;
                    
                    // Descontar el item mismo del inventario
                    deduccionesInventario.push({
                        inventarioId: itemInv._id,
                        cantidadADescontar: item.cantidad
                    });
                } else {
                    // Si llegamos aquí y no es manual, es que el ID era basura o de otro negocio
                    return res.status(404).json({ message: `Item no encontrado: ${item.productoId}` });
                }
            }

            const subtotal = precioUnitario * item.cantidad;
            itemsProcesados.push({
                producto: finalId,
                nombreProducto,
                cantidad: item.cantidad,
                precioUnitario,
                subtotal
            });
            total += subtotal;
        }

        const venta = new Venta({
            items: itemsProcesados,
            total,
            metodoPago: metodoPago || 'efectivo',
            usuario: userId,
            negocioId: req.negocioId,
            cliente,
            notas,
            especialista
        });

        await venta.save();

        // Actualizar ventas acumuladas del negocio para el pilotaje/facturación
        const negocio = await Negocio.findById(req.negocioId);
        if (negocio) {
            const ahora = new Date();
            const fechaLimite = new Date(negocio.billingCycleStart);
            fechaLimite.setMonth(fechaLimite.getMonth() + 1);

            if (ahora > fechaLimite) {
                // Reiniciar ciclo si pasó un mes
                negocio.accumulatedSalesMonth = total;
                negocio.billingCycleStart = ahora;
            } else {
                negocio.accumulatedSalesMonth += total;
            }

            // Calcular comisión de esta venta basada en el acumulado mensual
            // Tiers: <700: 5%, 701-2000: 3%, >2000: 2%
            let porcentajeComision = 0.05;
            if (negocio.accumulatedSalesMonth > 2000) {
                porcentajeComision = 0.02;
            } else if (negocio.accumulatedSalesMonth > 700) {
                porcentajeComision = 0.03;
            }

            const comisionEstaVenta = total * porcentajeComision;

            // Actualizar balance y estadísticas de vida
            negocio.billing.balance += comisionEstaVenta;
            negocio.totalSalesLifetime += total;
            negocio.totalCommissionLifetime += comisionEstaVenta;

            // Actualizar estado de pago si tiene deuda considerable
            if (negocio.billing.balance > 50 && negocio.billing.paymentStatus === 'al_dia') {
                negocio.billing.paymentStatus = 'pendiente';
            }

            await negocio.save();
        }

        // Aplicar todas las deducciones del inventario (FILTRADO POR NEGOCIO)
        for (const deduccion of deduccionesInventario) {
            await Inventario.findOneAndUpdate(
                { _id: deduccion.inventarioId, negocioId: req.negocioId },
                { $inc: { cantidad: -deduccion.cantidadADescontar } }
            );
        }

        // Populate para devolver datos completos
        await venta.populate('usuario', 'nombre email');

        res.status(201).json({
            venta,
            inventarioActualizado: true,
            message: deduccionesInventario.length > 0
                ? 'Venta registrada y los insumos han sido descontados del inventario.'
                : 'Venta registrada.'
        });
    } catch (error: any) {
        console.error('Error al crear venta:', error);
        res.status(500).json({ message: 'Error al crear la venta', error: error.message });
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
            filtro.createdAt = {
                $gte: new Date(fechaInicio as string),
                $lte: new Date(fechaFin as string)
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
        const { items, metodoPago, cliente, notas, especialista } = req.body;
        const userId = req.userId;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'La venta debe tener al menos un producto' });
        }

        const ventaAnterior = await Venta.findOne({ _id: id, negocioId: req.negocioId });
        if (!ventaAnterior) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        let negocio = await Negocio.findById(req.negocioId);
        
        // ------------- 1. REVERTIR VENTA ANTERIOR -------------
        if (negocio) {
            let porcentajeAnterior = 0.05;
            if (negocio.accumulatedSalesMonth > 2000) porcentajeAnterior = 0.02;
            else if (negocio.accumulatedSalesMonth > 700) porcentajeAnterior = 0.03;
            
            const comisionAnterior = ventaAnterior.total * porcentajeAnterior;
            negocio.accumulatedSalesMonth = Math.max(0, negocio.accumulatedSalesMonth - ventaAnterior.total);
            negocio.billing.balance = Math.max(0, negocio.billing.balance - comisionAnterior);
            negocio.totalSalesLifetime = Math.max(0, negocio.totalSalesLifetime - ventaAnterior.total);
            negocio.totalCommissionLifetime = Math.max(0, negocio.totalCommissionLifetime - comisionAnterior);
            
            if (negocio.billing.balance <= 50 && negocio.billing.paymentStatus === 'pendiente') {
                negocio.billing.paymentStatus = 'al_dia';
            }
        }

        // Revertir inventario anterior
        for (const item of ventaAnterior.items) {
            const isManual = item.producto == null || String(item.producto).startsWith('manual-');
            if (isManual) continue;
            
            const prod = await Producto.findOne({ _id: item.producto, negocioId: req.negocioId });
            if (prod && prod.ingredientes && prod.ingredientes.length > 0) {
                for (const ing of prod.ingredientes) {
                    await Inventario.findOneAndUpdate(
                        { _id: ing.inventario, negocioId: req.negocioId },
                        { $inc: { cantidad: ing.cantidad * item.cantidad } }
                    );
                }
            } else {
                await Inventario.findOneAndUpdate(
                    { _id: item.producto, negocioId: req.negocioId },
                    { $inc: { cantidad: item.cantidad } }
                );
            }
        }

        // ------------- 2. APLICAR NUEVA VENTA -------------
        const itemsProcesados = [];
        let total = 0;
        const deduccionesInventario: { inventarioId: any, cantidadADescontar: number }[] = [];

        for (const item of items) {
            let itemData = null;
            const isManual = String(item.productoId).startsWith('manual-');

            if (!isManual && item.productoId && item.productoId.length === 24) {
                itemData = await Producto.findOne({ _id: item.productoId, negocioId: req.negocioId });
            }

            let nombreProducto = item.nombre || '';
            let precioUnitario = item.precio || 0;
            let finalId = isManual ? null : item.productoId;

            if (itemData) {
                if (!itemData.disponible) {
                    return res.status(400).json({ message: `Producto no disponible: ${itemData.nombre}` });
                }
                nombreProducto = itemData.nombre;
                precioUnitario = itemData.precio;
                finalId = itemData._id;

                if (itemData.ingredientes && itemData.ingredientes.length > 0) {
                    for (const ing of itemData.ingredientes) {
                        deduccionesInventario.push({
                            inventarioId: ing.inventario,
                            cantidadADescontar: ing.cantidad * item.cantidad
                        });
                    }
                }
            } else if (!isManual) {
                const itemInv = await Inventario.findOne({ _id: item.productoId, negocioId: req.negocioId });
                if (itemInv) {
                    nombreProducto = itemInv.nombre;
                    precioUnitario = itemInv.precioVenta || itemInv.costoUnitario;
                    finalId = itemInv._id;
                    deduccionesInventario.push({
                        inventarioId: itemInv._id,
                        cantidadADescontar: item.cantidad
                    });
                } else {
                    return res.status(404).json({ message: `Item no encontrado: ${item.productoId}` });
                }
            }

            const subtotal = precioUnitario * item.cantidad;
            itemsProcesados.push({
                producto: finalId,
                nombreProducto,
                cantidad: item.cantidad,
                precioUnitario,
                subtotal
            });
            total += subtotal;
        }

        ventaAnterior.items = itemsProcesados;
        ventaAnterior.total = total;
        ventaAnterior.metodoPago = metodoPago || ventaAnterior.metodoPago;
        ventaAnterior.cliente = cliente !== undefined ? cliente : ventaAnterior.cliente;
        ventaAnterior.notas = notas !== undefined ? notas : ventaAnterior.notas;
        ventaAnterior.especialista = especialista !== undefined ? especialista : ventaAnterior.especialista;

        await ventaAnterior.save();

        if (negocio) {
            negocio.accumulatedSalesMonth += total;
            
            let porcentajeNuevo = 0.05;
            if (negocio.accumulatedSalesMonth > 2000) porcentajeNuevo = 0.02;
            else if (negocio.accumulatedSalesMonth > 700) porcentajeNuevo = 0.03;

            const comisionNueva = total * porcentajeNuevo;
            negocio.billing.balance += comisionNueva;
            negocio.totalSalesLifetime += total;
            negocio.totalCommissionLifetime += comisionNueva;

            if (negocio.billing.balance > 50 && negocio.billing.paymentStatus === 'al_dia') {
                negocio.billing.paymentStatus = 'pendiente';
            }
            await negocio.save();
        }

        for (const ded of deduccionesInventario) {
            await Inventario.findOneAndUpdate(
                { _id: ded.inventarioId, negocioId: req.negocioId },
                { $inc: { cantidad: -ded.cantidadADescontar } }
            );
        }

        await ventaAnterior.populate('usuario', 'nombre email');

        res.status(200).json({
            venta: ventaAnterior,
            inventarioActualizado: true,
            message: 'Venta editada y el inventario ajustado.'
        });
    } catch (error: any) {
        console.error('Error al actualizar venta:', error);
        res.status(500).json({ message: 'Error al actualizar la venta', error: error.message });
    }
};
