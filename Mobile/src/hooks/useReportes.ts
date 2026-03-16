import { useState, useCallback } from 'react';
import { getSalesReport, getFinancialReport } from '../services/api';

export interface FinancialSummary {
    ingresos: string;
    egresos: string;
    ganancia: string;
    margen: string;
}

export interface DailyBreakdown {
    fecha: string;
    ingresos: number;
    egresos: number;
    ganancia: number;
}

export const useReportes = () => {
    const [loading, setLoading] = useState(false);
    const [salesData, setSalesData] = useState<any>(null);
    const [financialData, setFinancialData] = useState<{
        resumen: FinancialSummary;
        desgloseDiario: DailyBreakdown[];
        periodo: { inicio: string; fin: string };
    } | null>(null);
    const [error, setError] = useState('');

    const cargarReporteFinanciero = useCallback(async (fechaInicio?: string, fechaFin?: string) => {
        setLoading(true);
        setError('');
        try {
            const params = { fechaInicio, fechaFin };
            const res = await getFinancialReport(params);
            setFinancialData(res.data);
        } catch (err: any) {
            setError('Error al cargar reporte financiero');
        } finally {
            setLoading(false);
        }
    }, []);

    const cargarReporteVentas = useCallback(async (fechaInicio?: string, fechaFin?: string, agruparPor = 'dia') => {
        setLoading(true);
        setError('');
        try {
            const params = { fechaInicio, fechaFin, agruparPor };
            const res = await getSalesReport(params);
            setSalesData(res.data);
        } catch (err: any) {
            setError('Error al cargar reporte de ventas');
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        salesData,
        financialData,
        error,
        cargarReporteFinanciero,
        cargarReporteVentas
    };
};
