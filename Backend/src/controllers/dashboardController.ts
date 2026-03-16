import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Venta from '../models/Venta';
import Inventario from '../models/Inventario';
import MovimientoInventario from '../models/MovimientoInventario';
import Producto from '../models/Producto';
import User from '../models/User';
import Gasto from '../models/Gasto';
import Negocio from '../models/Negocio';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns';

// Dashboard general
export const obtenerDashboard = async (req: AuthRequest, res: Response) => {
    try {
        const { periodo = 'mes' } = req.query;
        const hoy = new Date();
        
        // Rangos para métricas generales (se mantienen para el resto del dashboard)
        const inicioHoy = startOfDay(hoy);
        const finHoy = endOfDay(hoy);
        const inicioSemana = startOfWeek(hoy, { weekStartsOn: 1 });
        const finSemana = endOfWeek(hoy, { weekStartsOn: 1 });
        const inicioMes = startOfMonth(hoy);
        const finMes = endOfMonth(hoy);

        // Dinamismo para el rango del dashboard/comisiones
        let inicioFiltro = inicioMes;
        let finFiltro = finMes;

        switch(periodo) {
            case 'hoy':
                inicioFiltro = inicioHoy;
                finFiltro = finHoy;
                break;
            case 'semana':
                inicioFiltro = inicioSemana;
                finFiltro = finSemana;
                break;
            case 'quincena':
                // Últimos 15 días para ser prácticos
                inicioFiltro = subDays(hoy, 15);
                finFiltro = finHoy;
                break;
            case 'mes':
                inicioFiltro = inicioMes;
                finFiltro = finMes;
                break;
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
            .sort({ createdAt: -1 })
            .limit(5);

        // --- DASHBOARD ESPECÍFICO DE BELLEZA (COMISIONES) ---
        let comisionesResumen = undefined;
        const negocio = await Negocio.findById(req.negocioId);
        
        if (negocio?.categoria === 'BELLEZA') {
            const config = negocio.comisionConfig || { porcentajeBarbero: 50, porcentajeDueno: 50, cortesPorCiclo: 5 };
            
            // Agrupar ventas por especialista del rango seleccionado
            const comisionesData = await Venta.aggregate([
                { 
                    $match: { 
                        negocioId: req.negocioId, 
                        createdAt: { $gte: inicioFiltro, $lte: finFiltro },
                        especialista: { $ne: null }
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
                const espUser = await User.findById(item._id).select('nombre');
                
                const montoEspecialista = item.totalGenerado * (config.porcentajeBarbero / 100);
                const montoDueno = item.totalGenerado * (config.porcentajeDueno / 100);

                totalEspecialistas += montoEspecialista;
                totalDueno += montoDueno;
                totalFacturadoRango += item.totalGenerado;

                return {
                    id: item._id,
                    nombre: espUser?.nombre || 'Desconocido',
                    servicios: item.cantidadServicios,
                    generado: item.totalGenerado,
                    pago: montoEspecialista,
                    eficiencia: (item.cantidadServicios / (periodo === 'hoy' ? 1 : periodo === 'semana' ? 7 : 15)).toFixed(1)
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
                productosEnRiesgo: productosEnRiesgo.slice(0, 5)
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
