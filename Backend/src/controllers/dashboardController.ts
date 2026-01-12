import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Venta from '../models/Venta';
import Inventario from '../models/Inventario';
import MovimientoInventario from '../models/MovimientoInventario';
import User from '../models/User';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';

// Dashboard general
export const obtenerDashboard = async (req: AuthRequest, res: Response) => {
    try {
        const hoy = new Date();
        const inicioHoy = startOfDay(hoy);
        const finHoy = endOfDay(hoy);
        const inicioSemana = startOfWeek(hoy, { weekStartsOn: 1 });
        const finSemana = endOfWeek(hoy, { weekStartsOn: 1 });
        const inicioMes = startOfMonth(hoy);
        const finMes = endOfMonth(hoy);

        // Ventas del día
        const ventasHoy = await Venta.find({
            createdAt: { $gte: inicioHoy, $lte: finHoy }
        });
        const totalVentasHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0);

        // Ventas de la semana
        const ventasSemana = await Venta.find({
            createdAt: { $gte: inicioSemana, $lte: finSemana }
        });
        const totalVentasSemana = ventasSemana.reduce((sum, v) => sum + v.total, 0);

        // Ventas del mes
        const ventasMes = await Venta.find({
            createdAt: { $gte: inicioMes, $lte: finMes }
        });
        const totalVentasMes = ventasMes.reduce((sum, v) => sum + v.total, 0);

        // Inventario
        const inventario = await Inventario.find();
        const valorInventario = inventario.reduce((sum, item) => sum + (item.cantidad * item.costoUnitario), 0);
        const itemsStockBajo = inventario.filter(item => item.cantidad <= item.cantidadMinima).length;

        // Costos del mes (entradas de inventario)
        const costosMovimientos = await MovimientoInventario.find({
            tipo: 'entrada',
            createdAt: { $gte: inicioMes, $lte: finMes }
        });
        const costosMes = costosMovimientos.reduce((sum, m) => sum + (m.costoTotal || 0), 0);

        // Ganancia estimada del mes
        const gananciaMes = totalVentasMes - costosMes;

        // Productos más vendidos del mes
        const productosCantidad: { [key: string]: { nombre: string; cantidad: number; total: number } } = {};
        ventasMes.forEach(venta => {
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
            .slice(0, 5);

        // Ventas últimos 7 días para gráfico
        const ventasUltimos7Dias = [];
        for (let i = 6; i >= 0; i--) {
            const dia = subDays(hoy, i);
            const inicioDia = startOfDay(dia);
            const finDia = endOfDay(dia);
            const ventasDia = await Venta.find({
                createdAt: { $gte: inicioDia, $lte: finDia }
            });
            ventasUltimos7Dias.push({
                fecha: inicioDia.toISOString().split('T')[0],
                total: ventasDia.reduce((sum, v) => sum + v.total, 0),
                cantidad: ventasDia.length
            });
        }

        // Datos históricos (Admin only)
        let historico = undefined;
        const requestingUser = await User.findById(req.userId);
        
        if (requestingUser && (requestingUser.rol === 'admin' || requestingUser.rol === 'superadmin')) {
             const ventasTotal = await Venta.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$total" },
                        cantidad: { $sum: 1 }
                    }
                }
            ]);
            
            const costosTotal = await MovimientoInventario.aggregate([
                { $match: { tipo: 'entrada' } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$costoTotal" }
                    }
                }
            ]);

            const totalVentasHist = ventasTotal.length > 0 ? ventasTotal[0].total : 0;
            const totalCostosHist = costosTotal.length > 0 ? costosTotal[0].total : 0;
            const gananciaHist = totalVentasHist - totalCostosHist;

            historico = {
                ventasTotal: totalVentasHist.toFixed(2),
                cantidadTotal: ventasTotal.length > 0 ? ventasTotal[0].cantidad : 0,
                gananciaTotal: gananciaHist.toFixed(2)
            };
        }

        res.json({
            ventas: {
                hoy: { total: totalVentasHoy, cantidad: ventasHoy.length },
                semana: { total: totalVentasSemana, cantidad: ventasSemana.length },
                mes: { total: totalVentasMes, cantidad: ventasMes.length }
            },
            inventario: {
                valorTotal: valorInventario.toFixed(2),
                itemsStockBajo,
                totalItems: inventario.length
            },
            finanzas: {
                ingresosMes: totalVentasMes.toFixed(2),
                costosMes: costosMes.toFixed(2),
                gananciaMes: gananciaMes.toFixed(2)
            },
            historico,
            productosMasVendidos,
            ventasUltimos7Dias
        });
    } catch (error: any) {
        console.error('Error al obtener dashboard:', error);
        res.status(500).json({ message: 'Error al obtener dashboard', error: error.message });
    }
};

// Reporte de ventas por período
export const reporteVentas = async (req: AuthRequest, res: Response) => {
    try {
        const { fechaInicio, fechaFin, agruparPor = 'dia' } = req.query;

        let inicio: Date;
        let fin: Date;

        if (fechaInicio && fechaFin) {
            inicio = new Date(fechaInicio as string);
            fin = new Date(fechaFin as string);
        } else {
            // Por defecto, último mes
            fin = endOfDay(new Date());
            inicio = startOfMonth(new Date());
        }

        const ventas = await Venta.find({
            createdAt: { $gte: inicio, $lte: fin }
        }).sort({ createdAt: 1 });

        // Agrupar según parámetro
        const ventasAgrupadas: { [key: string]: { fecha: string; total: number; cantidad: number } } = {};

        ventas.forEach(venta => {
            let key: string;
            const fecha = new Date(venta.createdAt!);

            switch (agruparPor) {
                case 'hora':
                    key = `${fecha.toISOString().split('T')[0]} ${fecha.getHours()}:00`;
                    break;
                case 'semana':
                    const inicioSemana = startOfWeek(fecha, { weekStartsOn: 1 });
                    key = `Semana ${inicioSemana.toISOString().split('T')[0]}`;
                    break;
                case 'mes':
                    key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
                    break;
                default: // dia
                    key = fecha.toISOString().split('T')[0];
            }

            if (!ventasAgrupadas[key]) {
                ventasAgrupadas[key] = { fecha: key, total: 0, cantidad: 0 };
            }
            ventasAgrupadas[key].total += venta.total;
            ventasAgrupadas[key].cantidad++;
        });

        const totalGeneral = ventas.reduce((sum, v) => sum + v.total, 0);
        const cantidadTotal = ventas.length;

        res.json({
            periodo: { inicio, fin },
            datos: Object.values(ventasAgrupadas),
            resumen: {
                totalGeneral: totalGeneral.toFixed(2),
                cantidadTotal,
                promedioPorVenta: cantidadTotal > 0 ? (totalGeneral / cantidadTotal).toFixed(2) : '0.00'
            }
        });
    } catch (error: any) {
        console.error('Error al generar reporte:', error);
        res.status(500).json({ message: 'Error al generar reporte', error: error.message });
    }
};

// Reporte de ganancias y pérdidas
export const reporteGanancias = async (req: AuthRequest, res: Response) => {
    try {
        const { fechaInicio, fechaFin } = req.query;

        let inicio: Date;
        let fin: Date;

        if (fechaInicio && fechaFin) {
            inicio = new Date(fechaInicio as string);
            fin = new Date(fechaFin as string);
        } else {
            fin = endOfDay(new Date());
            inicio = startOfMonth(new Date());
        }

        // Ingresos (ventas)
        const ventas = await Venta.find({
            createdAt: { $gte: inicio, $lte: fin }
        });
        const ingresos = ventas.reduce((sum, v) => sum + v.total, 0);

        // Egresos (compras de inventario)
        const movimientos = await MovimientoInventario.find({
            tipo: 'entrada',
            createdAt: { $gte: inicio, $lte: fin }
        });
        const egresos = movimientos.reduce((sum, m) => sum + (m.costoTotal || 0), 0);

        // Ganancia neta
        const ganancia = ingresos - egresos;
        const margen = ingresos > 0 ? ((ganancia / ingresos) * 100) : 0;

        // Desglose por día
        const diasMap: { [key: string]: { ingresos: number; egresos: number } } = {};

        ventas.forEach(venta => {
            const key = venta.createdAt!.toISOString().split('T')[0];
            if (!diasMap[key]) diasMap[key] = { ingresos: 0, egresos: 0 };
            diasMap[key].ingresos += venta.total;
        });

        movimientos.forEach(mov => {
            const key = mov.createdAt!.toISOString().split('T')[0];
            if (!diasMap[key]) diasMap[key] = { ingresos: 0, egresos: 0 };
            diasMap[key].egresos += mov.costoTotal || 0;
        });

        const desgloseDiario = Object.entries(diasMap)
            .map(([fecha, data]) => ({
                fecha,
                ingresos: data.ingresos,
                egresos: data.egresos,
                ganancia: data.ingresos - data.egresos
            }))
            .sort((a, b) => a.fecha.localeCompare(b.fecha));

        res.json({
            periodo: { inicio, fin },
            resumen: {
                ingresos: ingresos.toFixed(2),
                egresos: egresos.toFixed(2),
                ganancia: ganancia.toFixed(2),
                margen: margen.toFixed(2) + '%'
            },
            desgloseDiario
        });
    } catch (error: any) {
        console.error('Error al generar reporte de ganancias:', error);
        res.status(500).json({ message: 'Error al generar reporte', error: error.message });
    }
};
