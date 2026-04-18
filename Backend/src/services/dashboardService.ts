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
import mongoose from 'mongoose';

export const obtenerDashboardDataService = async (
    negocioId: string, 
    userId: string, 
    periodo: string, 
    fechaInicio?: string, 
    fechaFin?: string
) => {
    const hoy = new Date();
    
    // Rangos para métricas generales (Hoy, Semana, Mes para los widgets superiores)
    const { inicio: inicioHoy, fin: finHoy } = getPeriodRanges('hoy', hoy);
    const { inicio: inicioSemana, fin: finSemana } = getPeriodRanges('semana', hoy);
    const { inicio: inicioMes, fin: finMes } = getPeriodRanges('mes', hoy);

    // Rango dinámico para el filtro seleccionado
    let inicioFiltro: Date;
    let finFiltro: Date;

    if (fechaInicio && fechaFin) {
        inicioFiltro = new Date(fechaInicio);
        finFiltro = new Date(fechaFin);
    } else {
        const ranges = getPeriodRanges(periodo as any, hoy);
        inicioFiltro = ranges.inicio;
        finFiltro = ranges.fin;
    }

    // Ventas del día, semana, mes, mes pasado
    const ventasHoy = await Venta.find({ negocioId, createdAt: { $gte: inicioHoy, $lte: finHoy } });
    const totalVentasHoy = ventasHoy.reduce((sum: number, v: any) => sum + v.total, 0);

    const ventasSemana = await Venta.find({ negocioId, createdAt: { $gte: inicioSemana, $lte: finSemana } });
    const totalVentasSemana = ventasSemana.reduce((sum: number, v: any) => sum + v.total, 0);

    const ventasMes = await Venta.find({ negocioId, createdAt: { $gte: inicioMes, $lte: finMes } });
    const totalVentasMes = ventasMes.reduce((sum: number, v: any) => sum + v.total, 0);

    const inicioMesPasado = startOfMonth(subMonths(hoy, 1));
    const finMesPasado = endOfMonth(subMonths(hoy, 1));
    const ventasMesPasado = await Venta.find({ negocioId, createdAt: { $gte: inicioMesPasado, $lte: finMesPasado } });
    const totalVentasMesPasado = ventasMesPasado.reduce((sum: number, v: any) => sum + v.total, 0);

    // Inventario
    const inventario = await Inventario.find({ negocioId });
    const valorInventario = inventario.reduce((sum, item) => sum + (item.cantidad * item.costoUnitario), 0);
    const itemsStockBajo = inventario.filter(item => item.cantidad <= item.cantidadMinima).length;

    // Costos de insumos del mes (entradas de inventario) e operativos
    const costosMovimientos = await MovimientoInventario.find({
        negocioId, tipo: 'entrada', createdAt: { $gte: inicioMes, $lte: finMes }
    });
    const costosInsumosMes = costosMovimientos.reduce((sum: number, m: any) => sum + (m.costoTotal || 0), 0);

    const gastosOperativosQuery = await Gasto.find({ negocioId, fecha: { $gte: inicioMes, $lte: finMes } });
    const totalGastosOperativosMes = gastosOperativosQuery.reduce((sum: number, g: any) => sum + g.monto, 0);

    const costosMes = costosInsumosMes + totalGastosOperativosMes;
    const gananciaMes = totalVentasMes - costosMes;

    // --- MÉTRICAS MES PASADO ---
    const costosMovimientosPasado = await MovimientoInventario.find({
        negocioId, tipo: 'entrada', createdAt: { $gte: inicioMesPasado, $lte: finMesPasado }
    });
    const costosInsumosMesPasado = costosMovimientosPasado.reduce((sum: number, m: any) => sum + (m.costoTotal || 0), 0);

    const gastosOperativosPasado = await Gasto.find({ negocioId, fecha: { $gte: inicioMesPasado, $lte: finMesPasado } });
    const totalGastosOperativosMesPasado = gastosOperativosPasado.reduce((sum: number, g: any) => sum + g.monto, 0);

    const gananciaMesPasado = totalVentasMesPasado - (costosInsumosMesPasado + totalGastosOperativosMesPasado);
    const crecimientoGanancia = gananciaMesPasado > 0 ? ((gananciaMes - gananciaMesPasado) / gananciaMesPasado) * 100 : 0;

    // Merma del mes (desperdicio)
    const movimientosMerma = await MovimientoInventario.find({
        negocioId, tipo: 'merma', createdAt: { $gte: inicioMes, $lte: finMes }
    }).populate('inventario');

    const productos = await Producto.find({ negocioId, disponible: true });
    const productosEnRiesgo: { id: string, nombre: string, ingredientesFaltantes: string[] }[] = [];

    for (const prod of (productos as any[])) {
        if (prod.ingredientes && prod.ingredientes.length > 0) {
            const faltantes: string[] = [];
            for (const ing of (prod.ingredientes as any[])) {
                if (!ing.inventario) continue; // Protección: el ingrediente no tiene referencia a inventario
                const invItem = (inventario as any[]).find((i: any) => i._id && i._id.toString() === ing.inventario.toString());
                if (invItem && invItem.cantidad <= invItem.cantidadMinima) {
                    faltantes.push(invItem.nombre);
                }
            }
            if (faltantes.length > 0) {
                productosEnRiesgo.push({ id: String((prod as any)._id), nombre: prod.nombre, ingredientesFaltantes: faltantes });
            }
        }
    }

    const mermaMes = movimientosMerma.reduce((sum, m: any) => {
        const costo = m.inventario?.costoUnitario || 0;
        return sum + (Math.abs(m.cantidad) * costo);
    }, 0);

    const proximaSemana = new Date();
    proximaSemana.setDate(hoy.getDate() + 7);
    const itemsVenciendo = inventario.filter(item =>
        item.fechaVencimiento && new Date(item.fechaVencimiento) >= hoy && new Date(item.fechaVencimiento) <= proximaSemana
    ).length;

    // --- CAITLYN: VIGILANCIA DE MÁRGENES Y MERCADO ---
    const negocio = await Negocio.findById(negocioId);
    const margenObjetivo = negocio?.config?.margenObjetivo || 65;
    const marketContext = await getLatestContext();
    const alertasRentabilidad: any[] = [];

    for (const prod of (productos as any[])) {
        if (prod.ingredientes && prod.ingredientes.length > 0) {
            let costoTotal = 0;
            let alertasMercado: string[] = [];

            for (const ing of (prod.ingredientes as any[])) {
                if (!ing.inventario) continue; // Protección: el ingrediente no tiene referencia a inventario
                const invItem = (inventario as any[]).find((i: any) => i._id && i._id.toString() === ing.inventario.toString());
                if (invItem) {
                    costoTotal += (invItem.costoUnitario * ing.cantidad);

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
    const productosMasVendidos = Object.values(productosCantidad).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);

    const ventasUltimos7Dias = [];
    for (let i = 6; i >= 0; i--) {
        const dia = subDays(hoy, i);
        const inicioDia = startOfDay(dia);
        const finDia = endOfDay(dia);
        const ventasDia = await Venta.find({ negocioId, createdAt: { $gte: inicioDia, $lte: finDia } });
        ventasUltimos7Dias.push({
            fecha: inicioDia.toISOString().split('T')[0],
            total: ventasDia.reduce((sum, v) => sum + v.total, 0),
            cantidad: ventasDia.length
        });
    }

    let historico = undefined;
    const requestingUser = await User.findById(userId);

    if (requestingUser && requestingUser.rol === 'admin') {
        const ventasTotal = await Venta.aggregate([
            { $match: { negocioId: new mongoose.Types.ObjectId(negocioId) } },
            { $group: { _id: null, total: { $sum: "$total" }, cantidad: { $sum: 1 } } }
        ]);

        const costosTotal = await MovimientoInventario.aggregate([
            { $match: { negocioId: new mongoose.Types.ObjectId(negocioId), tipo: 'entrada' } },
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

    const totalVentasAnio = await Venta.countDocuments({ negocioId });
    const totalMovsAnio = await MovimientoInventario.countDocuments({ negocioId });
    const facturasIA = await Gasto.countDocuments({ negocioId, comprobante: { $ne: null } });

    const minutosAhorrados = (totalVentasAnio * 0.5) + (totalMovsAnio * 1) + (facturasIA * 10);
    const hojasAhorradas = totalVentasAnio + Math.ceil(totalMovsAnio / 10);

    const crecimientoMes = totalVentasMesPasado > 0 ? ((totalVentasMes - totalVentasMesPasado) / totalVentasMesPasado) * 100 : 0;

    const ventasRecientes = await Venta.find({ negocioId }).populate('especialista', 'nombre').sort({ createdAt: -1 }).limit(5);

    // --- DASHBOARD ESPECÍFICO DE BELLEZA ---
    let comisionesResumen = undefined;
    
    if (negocio?.categoria?.toUpperCase() === 'BELLEZA') {
        const config = (negocio.comisionConfig as any) || { tipo: 'fijo', fijo: { porcentajeBarbero: 50, porcentajeDueno: 50 }, escalonado: [], cortesPorCiclo: 5 };
        
        const comisionesData = await Venta.aggregate([
            { $match: { negocioId: new mongoose.Types.ObjectId(negocioId), createdAt: { $gte: inicioFiltro, $lte: finFiltro }, especialista: { $exists: true, $ne: null } } },
            { $group: { _id: "$especialista", totalGenerado: { $sum: "$total" }, cantidadServicios: { $sum: 1 } } }
        ]);

        let totalEspecialistas = 0;
        let totalDueno = 0;
        let totalFacturadoRango = 0;

        const especialistasDetalle = await Promise.all(comisionesData.map(async (item) => {
            const espInfo = await Especialista.findById(item._id).select('nombre');
            let montoEspecialista = 0;
            let montoDueno = 0;
            let pctActual = 0;
            let totalServiciosReales = 0;

            const esEscalonado = (config.tipo === 'escalonado' || (config.escalonado?.length > 0));

            const ventasEsp = await Venta.find({
                negocioId, especialista: item._id, createdAt: { $gte: inicioFiltro, $lte: finFiltro }
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
                servicios: totalServiciosReales,
                generado: item.totalGenerado,
                pago: montoEspecialista,
                eficiencia: (totalServiciosReales / (periodo === 'hoy' ? 1 : periodo === 'semana' ? 7 : 15)).toFixed(1),
                porcentajeActual: pctActual
            };
        }));

        comisionesResumen = {
            periodo, totalGenerado: totalFacturadoRango, pagoEspecialistas: totalEspecialistas,
            pagoDueno: totalDueno, totalServicios: comisionesData.reduce((sum: number, d: any) => sum + d.cantidadServicios, 0),
            especialistas: especialistasDetalle
        };
    }

    const notificaciones = [];
    if (itemsStockBajo > 0) {
        notificaciones.push({ id: 'stock', titulo: 'Inventario Bajo', mensaje: `Tienes ${itemsStockBajo} productos agotándose.`, tipo: 'warning', icon: 'cube-outline' });
    }
    
    if (negocio?.categoria?.toUpperCase() === 'BELLEZA') {
        const config = (negocio.comisionConfig as any) || { escalonado: [] };
        const tramos = (config.escalonado || []).sort((a: any, b: any) => a.desde - b.desde);

        const ventasHoyBeauty = await Venta.find({
            negocioId, createdAt: { $gte: inicioHoy, $lte: finHoy }, especialista: { $exists: true, $ne: null }
        });

        const conteoHoy: { [key: string]: { nombre: string, servicios: number } } = {};
        
        for (const v of ventasHoyBeauty) {
            if (!v.especialista) continue; // Protección: venta sin especialista asignado
            const espId = v.especialista.toString();
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
            if (tramos.length > 0) {
                const tramo = tramos.find((t: any) => topEspHoy.servicios >= t.desde && topEspHoy.servicios <= t.hasta) || tramos[tramos.length - 1];
                if (tramo && tramo.porcentajeBarbero > 50) {
                    mensajeContext += ` Ya está en su tramo del ${tramo.porcentajeBarbero}%. 🚀`;
                }
            }
            notificaciones.push({ id: 'caitlyn-beauty-insight', titulo: 'Insight de Caitlyn AI ✨', mensaje: mensajeContext, tipo: 'info', icon: 'flash-outline' });
        }
    }

    return {
        ventas: { hoy: { total: totalVentasHoy, cantidad: ventasHoy.length }, semana: { total: totalVentasSemana, cantidad: ventasSemana.length }, mes: { total: totalVentasMes, cantidad: ventasMes.length }, mesPasado: { total: totalVentasMesPasado, cantidad: ventasMesPasado.length }, crecimiento: crecimientoMes.toFixed(1), recientes: ventasRecientes },
        inventario: { valorTotal: valorInventario.toFixed(2), itemsStockBajo, itemsVenciendo, totalItems: inventario.length, productosEnRiesgo: productosEnRiesgo.slice(0, 5), alertasRentabilidad },
        finanzas: { ingresosMes: totalVentasMes.toFixed(2), costosMes: costosInsumosMes.toFixed(2), gastosMes: totalGastosOperativosMes.toFixed(2), mermaMes: mermaMes.toFixed(2), gananciaMes: gananciaMes.toFixed(2), gananciaMesPasado: gananciaMesPasado.toFixed(2), crecimientoGanancia: crecimientoGanancia.toFixed(1) },
        ahorro: { tiempoHoras: (minutosAhorrados / 60).toFixed(1), hojasPapel: hojasAhorradas, calificacion: minutosAhorrados > 500 ? 'Pro' : minutosAhorrados > 100 ? 'Eficiente' : 'Iniciado' },
        historico, comisiones: comisionesResumen, notificaciones, productosMasVendidos, ventasUltimos7Dias
    };
};

export const reporteVentasService = async (negocioId: string, fechaInicio?: string, fechaFin?: string, agruparPor: string = 'dia') => {
    let inicio: Date;
    let fin: Date;

    if (fechaInicio && fechaFin) {
        inicio = new Date(fechaInicio);
        fin = new Date(fechaFin);
    } else {
        fin = endOfDay(new Date());
        inicio = startOfMonth(new Date());
    }

    const ventas = await Venta.find({ negocioId, createdAt: { $gte: inicio, $lte: fin } }).sort({ createdAt: 1 });

    const ventasAgrupadas: { [key: string]: { fecha: string; total: number; cantidad: number } } = {};

    ventas.forEach(venta => {
        let key: string;
        const fecha = new Date(venta.createdAt!);

        switch (agruparPor) {
            case 'hora': key = `${fecha.toISOString().split('T')[0]} ${fecha.getHours()}:00`; break;
            case 'semana': const inicioSemana = startOfWeek(fecha, { weekStartsOn: 1 }); key = `Semana ${inicioSemana.toISOString().split('T')[0]}`; break;
            case 'mes': key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`; break;
            default: key = fecha.toISOString().split('T')[0];
        }

        if (!ventasAgrupadas[key]) ventasAgrupadas[key] = { fecha: key, total: 0, cantidad: 0 };
        ventasAgrupadas[key].total += venta.total;
        ventasAgrupadas[key].cantidad++;
    });

    const totalGeneral = ventas.reduce((sum, v) => sum + v.total, 0);
    const cantidadTotal = ventas.length;

    return {
        periodo: { inicio, fin },
        datos: Object.values(ventasAgrupadas),
        resumen: {
            totalGeneral: totalGeneral.toFixed(2),
            cantidadTotal,
            promedioPorVenta: cantidadTotal > 0 ? (totalGeneral / cantidadTotal).toFixed(2) : '0.00'
        }
    };
};

export const reporteGananciasService = async (negocioId: string, fechaInicio?: string, fechaFin?: string) => {
    let inicio: Date;
    let fin: Date;

    if (fechaInicio && fechaFin) {
        inicio = new Date(fechaInicio);
        fin = new Date(fechaFin);
    } else {
        fin = endOfDay(new Date());
        inicio = startOfMonth(new Date());
    }

    const ventas = await Venta.find({ negocioId, createdAt: { $gte: inicio, $lte: fin } });
    const ingresos = ventas.reduce((sum, v) => sum + v.total, 0);

    const movimientos = await MovimientoInventario.find({ negocioId, tipo: 'entrada', createdAt: { $gte: inicio, $lte: fin } });
    const egresos = movimientos.reduce((sum, m) => sum + (m.costoTotal || 0), 0);

    const ganancia = ingresos - egresos;
    const margen = ingresos > 0 ? ((ganancia / ingresos) * 100) : 0;

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
        .map(([fecha, data]) => ({ fecha, ingresos: data.ingresos, egresos: data.egresos, ganancia: data.ingresos - data.egresos }))
        .sort((a, b) => a.fecha.localeCompare(b.fecha));

    return {
        periodo: { inicio, fin },
        resumen: { ingresos: ingresos.toFixed(2), egresos: egresos.toFixed(2), ganancia: ganancia.toFixed(2), margen: margen.toFixed(2) + '%' },
        desgloseDiario
    };
};
