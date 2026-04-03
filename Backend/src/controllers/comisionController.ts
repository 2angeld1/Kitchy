import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Venta from '../models/Venta';
import Producto from '../models/Producto';
import Negocio from '../models/Negocio';
import { getPeriodRanges } from '../utils/date-ranges';

/**
 * Calcula las comisiones de los especialistas (barberos/estilistas).
 * Lógica: Por cada N cortes (ciclo), se divide el ingreso según el porcentaje configurado.
 * Default: 50/50 cada 5 cortes o escalonado por volumen.
 */
export const calcularComisiones = async (req: AuthRequest, res: Response) => {
    try {
        const { mes, anio, periodo = 'mes', fechaInicio, fechaFin } = req.query;

        const negocio = await Negocio.findById(req.negocioId);
        if (!negocio || negocio.categoria?.toUpperCase() !== 'BELLEZA') {
            return res.status(400).json({ message: 'Este módulo solo está disponible para negocios de Salud y Bienestar.' });
        }

        const config = (negocio.comisionConfig as any) || {
            tipo: 'fijo',
            fijo: {
                porcentajeBarbero: 50,
                porcentajeDueno: 50
            },
            escalonado: [],
            cortesPorCiclo: 5
        };

        // Determinar rango de fechas
        let inicio: Date;
        let fin: Date;
        const ahora = new Date();
        const year = anio ? parseInt(anio as string) : ahora.getFullYear();
        const month = mes ? parseInt(mes as string) - 1 : ahora.getMonth();
        const baseDate = new Date(year, month);

        if (fechaInicio && fechaFin) {
            inicio = new Date(fechaInicio as string);
            fin = new Date(fechaFin as string);
        } else {
            const ranges = getPeriodRanges(periodo as any, baseDate);
            inicio = ranges.inicio;
            fin = ranges.fin;
        }

        // Obtener todas las ventas del mes que tengan especialista asignado
        const ventas = await Venta.find({
            negocioId: req.negocioId,
            especialista: { $ne: null },
            createdAt: { $gte: inicio, $lte: fin }
        }).populate('especialista', 'nombre imagen comision tipoComision').sort({ createdAt: 1 });

        // Agrupar por especialista
        const comisionesPorEspecialista: {
            [key: string]: {
                id: string;
                nombre: string;
                imagen?: string;
                totalServicios: number;
                totalIngreso: number;
                ciclosCompletos: number;
                montoEspecialista: number;
                montoDueno: number;
                porcentajeActual?: number;
                serviciosDetalle: { fecha: string; servicio: string; monto: number }[];
            }
        } = {};

        for (const venta of ventas) {
            const esp = venta.especialista as any;
            if (!esp) continue;
            const espId = esp._id?.toString() || esp.toString();
            const nombre = esp.nombre || 'Sin nombre';
            const imagen = esp.imagen || null;

            if (!comisionesPorEspecialista[espId]) {
                comisionesPorEspecialista[espId] = {
                    id: espId,
                    nombre,
                    imagen,
                    totalServicios: 0,
                    totalIngreso: 0,
                    ciclosCompletos: 0,
                    montoEspecialista: 0,
                    montoDueno: 0,
                    serviciosDetalle: []
                };
            }

            const entry = comisionesPorEspecialista[espId];
            
            // Sumar cada ítem por separado para el conteo real
            let serviciosEnEstaVenta = 0;
            venta.items.forEach(item => {
                serviciosEnEstaVenta += item.cantidad;
            });

            entry.totalServicios += serviciosEnEstaVenta;
            entry.totalIngreso += venta.total;

            // Detalle de cada servicio
            const servicioNombres = venta.items.map(i => i.nombreProducto).join(', ');
            entry.serviciosDetalle.push({
                fecha: venta.createdAt?.toISOString().split('T')[0] || '',
                servicio: servicioNombres,
                monto: venta.total
            });
        }

        // Calcular comisiones finales aplicando lógica escalonada o fija
        // Ahora se respeta el tipoComision individual de cada especialista
        for (const espId in comisionesPorEspecialista) {
            const entry = comisionesPorEspecialista[espId];
            
            // Buscar el tipo de comisión individual del especialista
            const espVenta = ventas.find(v => (v.especialista as any)._id?.toString() === espId);
            const espObj = espVenta?.especialista as any;
            const tipoIndividual = espObj?.tipoComision; // 'fijo' | 'escalonado' | null
            const comisionIndividual = espObj?.comision; // % personalizado

            // Si el especialista tiene tipo individual 'fijo', usar su % personal
            const usarFijo = tipoIndividual === 'fijo' 
                || (tipoIndividual == null && config.tipo === 'fijo');

            if (!usarFijo && config.escalonado?.length > 0) {
                // MODO ESCALONADO
                const tramos = [...config.escalonado].sort((a, b) => a.desde - b.desde);
                let contadorServiciosGlobal = 0;
                let montoEsp = 0;
                let montoLocal = 0;
                let ultimoPct = tramos[0].porcentajeBarbero;

                const ventasBarbero = ventas.filter(v => (v.especialista as any)._id?.toString() === espId || v.especialista?.toString() === espId);

                ventasBarbero.forEach(v => {
                    v.items.forEach(item => {
                        const valorUnitario = item.subtotal / item.cantidad;
                        for (let q = 0; q < item.cantidad; q++) {
                            contadorServiciosGlobal++;
                            const tramo = tramos.find(t => contadorServiciosGlobal >= t.desde && contadorServiciosGlobal <= t.hasta) || tramos[tramos.length - 1];
                            montoEsp += valorUnitario * (tramo.porcentajeBarbero / 100);
                            montoLocal += valorUnitario * (tramo.porcentajeDueno / 100);
                            ultimoPct = tramo.porcentajeBarbero;
                        }
                    });
                });

                entry.montoEspecialista = montoEsp;
                entry.montoDueno = montoLocal;
                entry.porcentajeActual = ultimoPct;
            } else {
                // MODO FIJO - usar comisión individual si existe, sino la global
                const pctBarbero = (tipoIndividual === 'fijo' && comisionIndividual != null)
                    ? comisionIndividual
                    : (config.fijo?.porcentajeBarbero || config.porcentajeBarbero || 50);
                const pctDueno = 100 - pctBarbero;
                entry.montoEspecialista = entry.totalIngreso * (pctBarbero / 100);
                entry.montoDueno = entry.totalIngreso * (pctDueno / 100);
                entry.porcentajeActual = pctBarbero;
            }

            entry.ciclosCompletos = Math.floor(entry.totalServicios / config.cortesPorCiclo);
        }

        const resultado = Object.values(comisionesPorEspecialista).sort(
            (a, b) => b.totalServicios - a.totalServicios
        );

        const totalGeneral = resultado.reduce((sum, e) => sum + e.totalIngreso, 0);
        const totalEspecialistas = resultado.reduce((sum, e) => sum + e.montoEspecialista, 0);
        const totalDueno = resultado.reduce((sum, e) => sum + e.montoDueno, 0);

        // ============ COMISIONES DE REVENTA ============
        // Calcular comisiones por productos de reventa vendidos por cada especialista
        const comisionReventaConfig = (negocio as any).comisionReventa || { porcentajeGlobal: 10 };
        const pctReventaGlobal = comisionReventaConfig.porcentajeGlobal || 10;

        // Buscar productos de inventario que sean de reventa
        const Inventario = require('../models/Inventario').default;
        const inventarioReventa = await Inventario.find({ 
            negocioId: req.negocioId, 
            categoria: 'reventa' 
        }).select('nombre precioVenta comisionEspecialista _id');

        // Map de IDs de productos de reventa para búsqueda rápida
        const reventaMap = new Map<string, any>();
        inventarioReventa.forEach((inv: any) => {
            reventaMap.set(inv._id.toString(), inv);
        });

        // Buscar las ventas que contienen esos productos de reventa
        const reventaPorEspecialista: {
            [key: string]: {
                id: string;
                nombre: string;
                totalProductosVendidos: number;
                totalIngresoReventa: number;
                comisionReventa: number;
                porcentajeReventa: number;
                detalle: { producto: string; cantidad: number; monto: number; comision: number }[];
            }
        } = {};

        // Revisar cada venta para extraer items de reventa
        for (const venta of ventas) {
            const esp = venta.especialista as any;
            if (!esp) continue;
            const espId = esp._id?.toString() || esp.toString();
            const nombre = esp.nombre || 'Sin nombre';

            for (const item of venta.items) {
                const productoId = item.producto?.toString();
                
                // Verificar si este producto está en el inventario de reventa
                // PRIORIDAD 1: Buscar por ID directo (más preciso)
                // PRIORIDAD 2: Buscar por nombre (como respaldo si el ID no cruza por alguna razón)
                const invMatch = reventaMap.get(productoId) || 
                                 inventarioReventa.find((inv: any) => inv.nombre.toLowerCase() === item.nombreProducto.toLowerCase());

                if (invMatch) {
                    if (!reventaPorEspecialista[espId]) {
                        reventaPorEspecialista[espId] = {
                            id: espId,
                            nombre,
                            totalProductosVendidos: 0,
                            totalIngresoReventa: 0,
                            comisionReventa: 0,
                            porcentajeReventa: pctReventaGlobal,
                            detalle: []
                        };
                    }

                    const entry = reventaPorEspecialista[espId];
                    // Usar override de producto o global
                    const pctProducto = invMatch.comisionEspecialista ?? pctReventaGlobal;
                    const comisionItem = item.subtotal * (pctProducto / 100);

                    entry.totalProductosVendidos += item.cantidad;
                    entry.totalIngresoReventa += item.subtotal;
                    entry.comisionReventa += comisionItem;
                    entry.porcentajeReventa = pctProducto;
                    entry.detalle.push({
                        producto: item.nombreProducto,
                        cantidad: item.cantidad,
                        monto: item.subtotal,
                        comision: comisionItem
                    });
                }
            }
        }

        const reventaResultado = Object.values(reventaPorEspecialista).sort(
            (a, b) => b.totalIngresoReventa - a.totalIngresoReventa
        );

        const totalReventaIngreso = reventaResultado.reduce((sum, e) => sum + e.totalIngresoReventa, 0);
        const totalReventaComision = reventaResultado.reduce((sum, e) => sum + e.comisionReventa, 0);

        res.json({
            periodo: {
                mes: month + 1,
                anio: year,
                desde: inicio.toISOString(),
                hasta: fin.toISOString()
            },
            config: config,
            comisionReventaConfig,
            resumen: {
                totalGeneral: totalGeneral.toFixed(2),
                totalEspecialistas: totalEspecialistas.toFixed(2),
                totalDueno: totalDueno.toFixed(2),
                totalServicios: resultado.reduce((sum, e) => sum + e.totalServicios, 0),
                // Resumen de Reventa
                totalReventaIngreso: totalReventaIngreso.toFixed(2),
                totalReventaComision: totalReventaComision.toFixed(2),
            },
            especialistas: resultado,
            reventaEspecialistas: reventaResultado
        });
    } catch (error: any) {
        console.error('Error calculando comisiones:', error);
        res.status(500).json({ message: 'Error al calcular comisiones', error: error.message });
    }
};
