import { useState } from 'react';
import { useIonViewWillEnter, useIonViewDidLeave } from '@ionic/react';
import { getDashboard } from '../services/api';

export interface DashboardData {
    ventas: {
        hoy: { total: number; cantidad: number };
        semana: { total: number; cantidad: number };
        mes: { total: number; cantidad: number };
    };
    inventario: {
        valorTotal: string;
        itemsStockBajo: number;
        totalItems: number;
    };
    finanzas: {
        ingresosMes: string;
        costosMes: string;
        gananciaMes: string;
    };
    historico?: {
        ventasTotal: string;
        cantidadTotal: number;
        gananciaTotal: string;
    };
    productosMasVendidos: { nombre: string; cantidad: number; total: number }[];
    ventasUltimos7Dias: { fecha: string; total: number; cantidad: number }[];
}

export const useDashboard = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const cargarDashboard = async (background = false) => {
        if (!background) setLoading(true);
        try {
            const response = await getDashboard();
            setData(response.data);
            if (!background) setError('');
        } catch (err) {
            console.error(err);
            if (!background) setError('Error al cargar dashboard');
        } finally {
            if (!background) setLoading(false);
        }
    };

    useIonViewWillEnter(() => {
        cargarDashboard();
        const interval = setInterval(() => cargarDashboard(true), 5000);
        (window as any).dashboardInterval = interval;
    });

    useIonViewDidLeave(() => {
        if ((window as any).dashboardInterval) {
            clearInterval((window as any).dashboardInterval);
        }
    });

    const handleRefresh = async (event: CustomEvent) => {
        await cargarDashboard();
        event.detail.complete();
    };

    const clearError = () => setError('');

    return {
        data,
        loading,
        error,
        handleRefresh,
        clearError
    };
};
