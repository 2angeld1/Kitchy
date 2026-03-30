import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Venta from '../models/Venta';
import Inventario from '../models/Inventario';
import MovimientoInventario from '../models/MovimientoInventario';
import Producto from '../models/Producto';
import User from '../models/User';
import Gasto from '../models/Gasto';
import Negocio from '../models/Negocio';
import Especialista from '../models/Especialista';
import { getLatestContext } from '../services/marketContextService';
import { calcularPrecioSugerido, calcularMargenActual } from '../utils/pricing';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns';
import { getPeriodRanges } from '../utils/date-ranges';

// Dashboard general
export const obtenerDashboard = async (req: AuthRequest, res: Response) => {
    try {
        const { periodo = 'mes', fechaInicio, fechaFin } = req.query;
        const hoy = new Date();
        
        // Rangos para métricas generales (Hoy, Semana, Mes para los widgets superiores)
        const { inicio: inicioHoy, fin: finHoy } = getPeriodRanges('hoy', hoy);
        const { inicio: inicioSemana, fin: finSemana } = getPeriodRanges('semana', hoy);
        const { inicio: inicioMes, fin: finMes } = getPeriodRanges('mes', hoy);

        // Rango dinámico para el filtro seleccionado (lo que el usuario cambia en la UI)
        let inicioFiltro: Date;
        let finFiltro: Date;

        if (fechaInicio && fechaFin) {
            inicioFiltro = new Date(fechaInicio as string);
            finFiltro = new Date(fechaFin as string);
        } else {
            const ranges = getPeriodRanges(periodo as any, hoy);
            inicioFiltro = ranges.inicio;
            finFiltro = ranges.fin;
        }

        // Ventas del día
        const ventasHoy = await Venta.find({
            negocioId: req.negocioId,
            createdAt: { $gte: inicioHoy, $lte: finHoy }
        });
        const totalVentasHoy = ventasHoy.reduce((sum: number, v: any) => sum + v.total, 0);

        // Ventas de la semana
        const ventasSemana = await Venta.find({
            negocioId: req.negocioId,
            createdAt: { $gte: inicioSemana, $lte: finSemana }
        });
        const totalVentasSemana = ventasSemana.reduce((sum: number, v: any) => sum + v.total, 0);

        // Ventas del mes
        const ventasMes = await Venta.find({
            negocioId: req.negocioId,
            createdAt: { $gte: inicioMes, $lte: finMes }
        });
        const totalVentasMes = ventasMes.reduce((sum: number, v: any) => sum + v.total, 0);

        // Ventas del mes pasado (para comparativa)
        const inicioMesPasado = startOfMonth(subMonths(hoy, 1));
        const finMesPasado = endOfMonth(subMonths(hoy, 1));
        const ventasMesPasado = await Venta.find({
            negocioId: req.negocioId,
            createdAt: { $gte: inicioMesPasado, $lte: finMesPasado }
        });
        const totalVentasMesPasado = ventasMesPasado.reduce((sum: number, v: any) => sum + v.total, 0);

        // Inventario
        const inventario = await Inventario.find({ negocioId: req.negocioId });
        const valorInventario = inventario.reduce((sum, item) => sum + (item.cantidad * item.costoUnitario), 0);
        const itemsStockBajo = inventario.filter(item => item.cantidad <= item.cantidadMinima).length;

        // Costos de insumos del mes (entradas de inventario)
        const costosMovimientos = await MovimientoInventario.find({
            negocioId: req.negocioId,
            tipo: 'entrada',
            createdAt: { $gte: inicioMes, $lte: finMes }
        });
        const costosInsumosMes = costosMovimientos.reduce((sum: number, m: any) => sum + (m.costoTotal || 0), 0);

        // Gastos operativos del mes
        const gastosOperativosQuery = await Gasto.find({
            negocioId: req.negocioId,
            fecha: { $gte: inicioMes, $lte: finMes }
        });
        const totalGastosOperativosMes = gastosOperativosQuery.reduce((sum: number, g: any) => sum + g.monto, 0);

        const costosMes = costosInsumosMes + totalGastosOperativosMes;

        // Ganancia estimada del mes
        const gananciaMes = totalVentasMes - costosMes;

        // --- MÉTRICAS MES PASADO ---
        const costosMovimientosPasado = await MovimientoInventario.find({
            negocioId: req.negocioId,
            tipo: 'entrada',
            createdAt: { $gte: inicioMesPasado, $lte: finMesPasado }
        });
        const costosInsumosMesPasado = costosMovimientosPasado.reduce((sum: number, m: any) => sum + (m.costoTotal || 0), 0);

        const gastosOperativosPasado = await Gasto.find({
            negocioId: req.negocioId,
            fecha: { $gte: inicioMesPasado, $lte: finMesPasado }
        });
        const totalGastosOperativosMesPasado = gastosOperativosPasado.reduce((sum: number, g: any) => sum + g.monto, 0);

        const gananciaMesPasado = totalVentasMesPasado - (costosInsumosMesPasado + totalGastosOperativosMesPasado);
        const crecimientoGanancia = gananciaMesPasado > 0
            ? ((gananciaMes - gananciaMesPasado) / gananciaMesPasado) * 100
            : 0;

        // Merma del mes (desperdicio)
        const movimientosMerma = await MovimientoInventario.find({
            negocioId: req.negocioId,
            tipo: 'merma',
            createdAt: { $gte: inicioMes, $lte: finMes }
        }).populate('inventario');
        // 2.5 Productos con ingredientes escasos (RECETAS EN RIESGO)
        const productos = await Producto.find({ negocioId: req.negocioId, disponible: true });
        const productosEnRiesgo: { id: string, nombre: string, ingredientesFaltantes: string[] }[] = [];

        // Identificar qué ingredientes de qué producto están bajos
        for (const prod of (productos as any[])) {
            if (prod.ingredientes && prod.ingredientes.length > 0) {
                const faltantes: string[] = [];
                for (const ing of (prod.ingredientes as any[])) {
                    const invItem = (inventario as any[]).find((i: any) => i._id.toString() === (ing.inventario as any).toString());
                    if (invItem && invItem.cantidad <= invItem.cantidadMinima) {
                        faltantes.push(invItem.nombre);
                    }
                }
                if (faltantes.length > 0) {
                    productosEnRiesgo.push({
                        id: String((prod as any)._id),
                        nombre: prod.nombre,
                        ingredientesFaltantes: faltantes
                    });
                }
            }
        }

        const mermaMes = movimientosMerma.reduce((sum, m: any) => {
            const costo = m.inventario?.costoUnitario || 0;
            return sum + (Math.abs(m.cantidad) * costo);
        }, 0);

        // Vencimientos (próximos 7 días)
        const proximaSemana = new Date();
        proximaSemana.setDate(hoy.getDate() + 7);
        const itemsVenciendo = inventario.filter(item =>
            item.fechaVencimiento &&
            new Date(item.fechaVencimiento) >= hoy &&
            new Date(item.fechaVencimiento) <= proximaSemana
        ).length;

        // --- CAITLYN: VIGILANCIA DE MÁRGENES Y MERCADO ---
        const negocio = await Negocio.findById(req.negocioId);
        const margenObjetivo = negocio?.config?.margenObjetivo || 65;
        const marketContext = await getLatestContext();
        const alertasRentabilidad: any[] = [];

        for (const prod of (productos as any[])) {
            if (prod.ingredientes && prod.ingredientes.length > 0) {
                let costoTotal = 0;
                let alertasMercado: string[] = [];

                for (const ing of (prod.ingredientes as any[])) {
                    const invItem = (inventario as any[]).find((i: any) => i._id.toString() === (ing.inventario as any).toString());
                    if (invItem) {
                        costoTotal += (invItem.costoUnitario * ing.cantidad);

                        // Comparar con Merca Panamá si existe el dato
                        if (marketContext.MERCA && marketContext.MERCA.vegetales) {
                            const nombreNormalizado = invItem.nombre.toLowerCase();
                            const precioMercado = marketContext.MERCA.vegetales[nombreNormalizado] || 
                                                marketContext.MERCA.carnes[nombreNormalizado];

                            if (precioMercado && precioMercado > invItem.costoUnitario) {
                                alertasMercado.push(`El costo de ${invItem.nombre} en Merca Panamá ($${precioMercado}) es mayor a tu costo registrado ($${invItem.costoUnitario}).`);
                            }
                        }
                    }
                }
                
                const precio = prod.precio || 0;
                const margenActual = calcularMargenActual(precio, costoTotal);

                if (precio > 0 && (margenActual < margenObjetivo || alertasMercado.length > 0)) {
                    const precioSugerido = calcularPrecioSugerido(costoTotal, margenObjetivo);
                    alertasRentabilidad.push({
                        id: prod._id,
                        nombre: prod.nombre,
                        margenActual: margenActual.toFixed(1),
                        margenObjetivo,
                        precioActual: precio,
                        precioSugerido: precioSugerido.toFixed(2),
                        costoTotal: costoTotal.toFixed(2),
                        razon: alertasMercado.length > 0 ? alertasMercado[0] : 'Margen por debajo del objetivo',
                        alertaMercado: alertasMercado.length > 0
                    });
                }
            }
        }

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
                negocioId: req.negocioId,
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

        if (requestingUser && requestingUser.rol === 'admin') {
            const ventasTotal = await Venta.aggregate([
                { $match: { negocioId: req.negocioId } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$total" },
                        cantidad: { $sum: 1 }
                    }
                }
            ]);

            const costosTotal = await MovimientoInventario.aggregate([
                { $match: { negocioId: req.negocioId, tipo: 'entrada' } },
                { $group: { _id: null, total: { $sum: "$costoTotal" } } }
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

        // --- MÉTRICAS DE AHORRO KITCHY ✨ ---
        const totalVentasAnio = await Venta.countDocuments({ negocioId: req.negocioId });
        const totalMovsAnio = await MovimientoInventario.countDocuments({ negocioId: req.negocioId });
        const facturasIA = await Gasto.countDocuments({ negocioId: req.negocioId, comprobante: { $ne: null } });

        const minutosAhorrados = (totalVentasAnio * 0.5) + (totalMovsAnio * 1) + (facturasIA * 10);
        const hojasAhorradas = totalVentasAnio + Math.ceil(totalMovsAnio / 10);

        const crecimientoMes = totalVentasMesPasado > 0
            ? ((totalVentasMes - totalVentasMesPasado) / totalVentasMesPasado) * 100
            : 0;

        // Ventas recientes (para notificaciones)
        const ventasRecientes = await Venta.find({ negocioId: req.negocioId })
            .populate('especialista', 'nombre')
            .sort({ createdAt: -1 })
            .limit(5);

        // --- DASHBOARD ESPECÍFICO DE BELLEZA (COMISIONES) ---
        let comisionesResumen = undefined;
        
        if (negocio?.categoria?.toUpperCase() === 'BELLEZA') {
            const config = (negocio.comisionConfig as any) || { 
                tipo: 'fijo', 
                fijo: { porcentajeBarbero: 50, porcentajeDueno: 50 }, 
                escalonado: [], 
                cortesPorCiclo: 5 
            };
            
            const mongoose = require('mongoose');

            // Agrupar ventas por especialista del rango seleccionado usando agregación nativa
            const comisionesData = await Venta.aggregate([
                { 
                    $match: { 
                        negocioId: new mongoose.Types.ObjectId(req.negocioId as string), 
                        createdAt: { $gte: inicioFiltro, $lte: finFiltro },
                        especialista: { $exists: true, $ne: null }
                    } 
                },
                {
                    $group: {
                        _id: "$especialista",
                        totalGenerado: { $sum: "$total" },
                        cantidadServicios: { $sum: 1 }
                    }
                }
            ]);

            let totalEspecialistas = 0;
            let totalDueno = 0;
            let totalFacturadoRango = 0;

            const especialistasDetalle = await Promise.all(comisionesData.map(async (item) => {
                const espInfo = await Especialista.findById(item._id).select('nombre');
                
                let montoEspecialista = 0;
                let montoDueno = 0;
                let pctActual = 0;
                let totalServiciosReales = 0; // Contador por ítem/cantidad

                const esEscalonado = (config.tipo === 'escalonado' || (config.escalonado?.length > 0));

                const ventasEsp = await Venta.find({
                    negocioId: req.negocioId,
                    especialista: item._id,
                    createdAt: { $gte: inicioFiltro, $lte: finFiltro }
                }).sort({ createdAt: 1 });

                if (esEscalonado && config.escalonado?.length > 0) {
                    const tramos = [...config.escalonado].sort((a, b) => a.desde - b.desde);
                    
                    ventasEsp.forEach((v) => {
                        v.items.forEach(ítem => {
                            const valorUnitario = ítem.subtotal / ítem.cantidad;
                            for (let q = 0; q < ítem.cantidad; q++) {
                                totalServiciosReales++;
                                const tramo = tramos.find(t => totalServiciosReales >= t.desde && totalServiciosReales <= t.hasta) || tramos[tramos.length - 1];
                                montoEspecialista += valorUnitario * (tramo.porcentajeBarbero / 100);
                                montoDueno += valorUnitario * (tramo.porcentajeDueno / 100);
                                pctActual = tramo.porcentajeBarbero;
                            }
                        });
                    });
                } else {
                    ventasEsp.forEach(v => {
                        v.items.forEach(ítem => totalServiciosReales += ítem.cantidad);
                    });
                    pctActual = config.fijo?.porcentajeBarbero || config.porcentajeBarbero || 50;
                    const pctDueno = config.fijo?.porcentajeDueno || config.porcentajeDueno || 50;
                    montoEspecialista = item.totalGenerado * (pctActual / 100);
                    montoDueno = item.totalGenerado * (pctDueno / 100);
                }

                totalEspecialistas += montoEspecialista;
                totalDueno += montoDueno;
                totalFacturadoRango += item.totalGenerado;

                return {
                    id: item._id,
                    nombre: espInfo?.nombre || 'Desconocido',
                    servicios: totalServiciosReales, // <--- AHORA SÍ SON SERVICIOS REALES
                    generado: item.totalGenerado,
                    pago: montoEspecialista,
                    eficiencia: (totalServiciosReales / (periodo === 'hoy' ? 1 : periodo === 'semana' ? 7 : 15)).toFixed(1),
                    porcentajeActual: pctActual
                };
            }));

            comisionesResumen = {
                periodo: periodo,
                totalGenerado: totalFacturadoRango,
                pagoEspecialistas: totalEspecialistas,
                pagoDueno: totalDueno,
                totalServicios: comisionesData.reduce((sum: number, d: any) => sum + d.cantidadServicios, 0),
                especialistas: especialistasDetalle
            };
        }

        // --- NOTIFICACIONES ---
        const notificaciones = [];
        if (itemsStockBajo > 0) {
            notificaciones.push({
                id: 'stock',
                titulo: 'Inventario Bajo',
                mensaje: `Tienes ${itemsStockBajo} productos agotándose.`,
                tipo: 'warning',
                icon: 'cube-outline'
            });
        }
        
        if (negocio?.categoria?.toUpperCase() === 'BELLEZA') {
            // Caitlyn AI: Mirada estratégica SIEMPRE focalizada en hoy para el insight
            const config = (negocio.comisionConfig as any) || { escalonado: [] };
            const tramos = (config.escalonado || []).sort((a: any, b: any) => a.desde - b.desde);

            // Buscamos las ventas de HOY específicamente para este insight
            const ventasHoyBeauty = await Venta.find({
                negocioId: req.negocioId,
                createdAt: { $gte: inicioHoy, $lte: finHoy },
                especialista: { $exists: true, $ne: null }
            });

            const conteoHoy: { [key: string]: { nombre: string, servicios: number } } = {};
            
            for (const v of ventasHoyBeauty) {
                const espId = v.especialista!.toString();
                if (!conteoHoy[espId]) {
                    const esp = await Especialista.findById(espId).select('nombre');
                    conteoHoy[espId] = { nombre: esp?.nombre || 'Especialista', servicios: 0 };
                }
                
                let servsVenta = 0;
                v.items.forEach(i => servsVenta += i.cantidad);
                conteoHoy[espId].servicios += servsVenta;
            }

            const topEspHoy = Object.values(conteoHoy).sort((a, b) => b.servicios - a.servicios)[0];

            if (topEspHoy && topEspHoy.servicios >= 1) {
                let mensajeContext = `¡${topEspHoy.nombre.split(' ')[0]} lleva ${topEspHoy.servicios} servicios hoy!`;
                
                // Calcular si alcanzó un tramo hoy
                if (tramos.length > 0) {
                    const tramo = tramos.find((t: any) => topEspHoy.servicios >= t.desde && topEspHoy.servicios <= t.hasta) || tramos[tramos.length - 1];
                    if (tramo && tramo.porcentajeBarbero > 50) {
                        mensajeContext += ` Ya está en su tramo del ${tramo.porcentajeBarbero}%. 🚀`;
                    }
                }
                
                notificaciones.push({
                    id: 'caitlyn-beauty-insight',
                    titulo: 'Insight de Caitlyn AI ✨',
                    mensaje: mensajeContext,
                    tipo: 'info',
                    icon: 'flash-outline'
                });
            }
        }

        res.json({
            ventas: {
                hoy: { total: totalVentasHoy, cantidad: ventasHoy.length },
                semana: { total: totalVentasSemana, cantidad: ventasSemana.length },
                mes: { total: totalVentasMes, cantidad: ventasMes.length },
                mesPasado: { total: totalVentasMesPasado, cantidad: ventasMesPasado.length },
                crecimiento: crecimientoMes.toFixed(1),
                recientes: ventasRecientes
            },
            inventario: {
                valorTotal: valorInventario.toFixed(2),
                itemsStockBajo,
                itemsVenciendo,
                totalItems: inventario.length,
                productosEnRiesgo: productosEnRiesgo.slice(0, 5),
                alertasRentabilidad
            },
            finanzas: {
                ingresosMes: totalVentasMes.toFixed(2),
                costosMes: costosInsumosMes.toFixed(2),
                gastosMes: totalGastosOperativosMes.toFixed(2),
                mermaMes: mermaMes.toFixed(2),
                gananciaMes: gananciaMes.toFixed(2),
                gananciaMesPasado: gananciaMesPasado.toFixed(2),
                crecimientoGanancia: crecimientoGanancia.toFixed(1)
            },
            ahorro: {
                tiempoHoras: (minutosAhorrados / 60).toFixed(1),
                hojasPapel: hojasAhorradas,
                calificacion: minutosAhorrados > 500 ? 'Pro' : minutosAhorrados > 100 ? 'Eficiente' : 'Iniciado'
            },
            historico,
            comisiones: comisionesResumen,
            notificaciones,
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
            negocioId: req.negocioId,
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
            negocioId: req.negocioId,
            createdAt: { $gte: inicio, $lte: fin }
        });
        const ingresos = ventas.reduce((sum, v) => sum + v.total, 0);

        // Egresos (compras de inventario)
        const movimientos = await MovimientoInventario.find({
            negocioId: req.negocioId,
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
