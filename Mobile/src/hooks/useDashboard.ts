import { useState, useEffect, useCallback } from 'react';
import { getDashboard } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

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
    metodosPago: { metodo: string; total: number; cantidad: number; porcentaje: number }[];
}

export const useDashboard = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const cargarDashboard = async (isRefreshing = false) => {
        if (isRefreshing) {
            setRefreshing(true);
        } else if (!data) {
            // Solo muestra cargando principal si no hay datos iniciales
            setLoading(true);
        }

        try {
            const response = await getDashboard();
            setData(response.data);
            setError('');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Error al cargar dashboard');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // useFocusEffect funciona igual que useIonViewWillEnter, se ejecuta 
    // cuando la pantalla del Stack gana el "foco" (es visitada por el usuario).
    useFocusEffect(
        useCallback(() => {
            cargarDashboard();
            // Polling en segundo plano cada 5 seg
            const interval = setInterval(() => cargarDashboard(true), 5000);

            // Función cleanup (se ejecuta al salir de la pantalla)
            return () => clearInterval(interval);
        }, [])
    );

    const onRefresh = useCallback(async () => {
        await cargarDashboard(true);
    }, []);

    const clearError = () => setError('');

    return {
        data,
        loading,
        refreshing,
        error,
        onRefresh,
        clearError
    };
};
