import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { obtenerDashboardDataService, reporteVentasService, reporteGananciasService } from '../services/dashboardService';

// Dashboard general
export const obtenerDashboard = async (req: AuthRequest, res: Response) => {
    try {
        const { periodo = 'mes', fechaInicio, fechaFin } = req.query;
        
        const data = await obtenerDashboardDataService(
            req.negocioId as string,
            req.userId as string,
            periodo as string,
            fechaInicio as string,
            fechaFin as string
        );

        res.json(data);
    } catch (error: any) {
        console.error('Error al obtener dashboard:', error);
        res.status(500).json({ message: 'Error al obtener dashboard', error: error.message });
    }
};

// Reporte de ventas por período
export const reporteVentas = async (req: AuthRequest, res: Response) => {
    try {
        const { fechaInicio, fechaFin, agruparPor = 'dia' } = req.query;

        const data = await reporteVentasService(
            req.negocioId as string,
            fechaInicio as string,
            fechaFin as string,
            agruparPor as string
        );

        res.json(data);
    } catch (error: any) {
        console.error('Error al generar reporte:', error);
        res.status(500).json({ message: 'Error al generar reporte', error: error.message });
    }
};

// Reporte de ganancias y pérdidas
export const reporteGanancias = async (req: AuthRequest, res: Response) => {
    try {
        const { fechaInicio, fechaFin } = req.query;

        const data = await reporteGananciasService(
            req.negocioId as string,
            fechaInicio as string,
            fechaFin as string
        );

        res.json(data);
    } catch (error: any) {
        console.error('Error al generar reporte de ganancias:', error);
        res.status(500).json({ message: 'Error al generar reporte', error: error.message });
    }
};
