import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Venta from '../models/Venta';
import Producto from '../models/Producto';
import Negocio from '../models/Negocio';
import { startOfMonth, endOfMonth } from 'date-fns';

/**
 * Calcula las comisiones de los especialistas (barberos/estilistas).
 * Lógica: Por cada N cortes (ciclo), se divide el ingreso según el porcentaje configurado.
 * Default: 50/50 cada 5 cortes.
 */
export const calcularComisiones = async (req: AuthRequest, res: Response) => {
    try {
        const { mes, anio } = req.query;

        const negocio = await Negocio.findById(req.negocioId);
        if (!negocio || negocio.categoria !== 'BELLEZA') {
            return res.status(400).json({ message: 'Este módulo solo está disponible para negocios de Salud y Bienestar.' });
        }

        const config = negocio.comisionConfig || {
            porcentajeBarbero: 50,
            porcentajeDueno: 50,
            cortesPorCiclo: 5
        };

        // Determinar rango de fechas
        const ahora = new Date();
        const year = anio ? parseInt(anio as string) : ahora.getFullYear();
        const month = mes ? parseInt(mes as string) - 1 : ahora.getMonth();
        const inicio = startOfMonth(new Date(year, month));
        const fin = endOfMonth(new Date(year, month));

        // Obtener todas las ventas del mes que tengan especialista asignado
        const ventas = await Venta.find({
            negocioId: req.negocioId,
            especialista: { $ne: null },
            createdAt: { $gte: inicio, $lte: fin }
        }).populate('especialista', 'nombre imagen');

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
            entry.totalServicios += 1;
            entry.totalIngreso += venta.total;

            // Detalle de cada servicio
            const servicioNombres = venta.items.map(i => i.nombreProducto).join(', ');
            entry.serviciosDetalle.push({
                fecha: venta.createdAt?.toISOString().split('T')[0] || '',
                servicio: servicioNombres,
                monto: venta.total
            });
        }

        // Calcular comisiones por ciclos
        for (const espId in comisionesPorEspecialista) {
            const entry = comisionesPorEspecialista[espId];
            entry.ciclosCompletos = Math.floor(entry.totalServicios / config.cortesPorCiclo);
            entry.montoEspecialista = entry.totalIngreso * (config.porcentajeBarbero / 100);
            entry.montoDueno = entry.totalIngreso * (config.porcentajeDueno / 100);
        }

        const resultado = Object.values(comisionesPorEspecialista).sort(
            (a, b) => b.totalServicios - a.totalServicios
        );

        const totalGeneral = resultado.reduce((sum, e) => sum + e.totalIngreso, 0);
        const totalEspecialistas = resultado.reduce((sum, e) => sum + e.montoEspecialista, 0);
        const totalDueno = resultado.reduce((sum, e) => sum + e.montoDueno, 0);

        res.json({
            periodo: {
                mes: month + 1,
                anio: year,
                desde: inicio.toISOString(),
                hasta: fin.toISOString()
            },
            config: {
                porcentajeBarbero: config.porcentajeBarbero,
                porcentajeDueno: config.porcentajeDueno,
                cortesPorCiclo: config.cortesPorCiclo
            },
            resumen: {
                totalGeneral: totalGeneral.toFixed(2),
                totalEspecialistas: totalEspecialistas.toFixed(2),
                totalDueno: totalDueno.toFixed(2),
                totalServicios: resultado.reduce((sum, e) => sum + e.totalServicios, 0)
            },
            especialistas: resultado
        });
    } catch (error: any) {
        console.error('Error calculando comisiones:', error);
        res.status(500).json({ message: 'Error al calcular comisiones', error: error.message });
    }
};
