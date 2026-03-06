import { useState, useEffect, useCallback, useMemo } from 'react';
import { getDashboard } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export interface DashboardData {
    ventas: {
        hoy: { total: number; cantidad: number };
        semana: { total: number; cantidad: number };
        mes: { total: number; cantidad: number };
        mesPasado: { total: number; cantidad: number };
        crecimiento: string;
        recientes: any[];
    };
    inventario: {
        valorTotal: string;
        itemsStockBajo: number;
        itemsVenciendo: number;
        totalItems: number;
        productosEnRiesgo: { id: string; nombre: string; ingredientesFaltantes: string[] }[];
    };
    finanzas: {
        ingresosMes: string;
        costosMes: string;
        gastosMes: string;
        mermaMes: string;
        gananciaMes: string;
        gananciaMesPasado: string;
        crecimientoGanancia: string;
    };
    ahorro: {
        tiempoHoras: string;
        hojasPapel: number;
        calificacion: string;
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
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const cargarDashboard = async (isRefreshing = false) => {
        if (isRefreshing) {
            setRefreshing(true);
        } else if (!data) {
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

    useFocusEffect(
        useCallback(() => {
            cargarDashboard();
            const interval = setInterval(() => cargarDashboard(true), 15000); // 15 seg es más que suficiente
            return () => clearInterval(interval);
        }, [user?.negocioActivo])
    );

    const onRefresh = useCallback(async () => {
        await cargarDashboard(true);
    }, []);

    // Lógica de Negocio: Generar notificaciones basadas en la data
    const notifications = useMemo(() => {
        if (!data) return [];
        const notifs = [];

        if (data.ventas.recientes) {
            data.ventas.recientes.slice(0, 3).forEach((v: any) => {
                notifs.push({
                    id: v._id,
                    title: 'Venta Nueva',
                    message: `Se registró una venta por $${v.total.toFixed(2)}`,
                    time: 'Hoy'
                });
            });
        }

        if (data.inventario.itemsStockBajo > 0) {
            notifs.push({
                id: 'low-stock',
                title: 'Stock Bajo',
                message: `Atención: Tienes ${data.inventario.itemsStockBajo} productos con stock crítico.`,
                time: 'Ahora'
            });
        }

        if (data.inventario.itemsVenciendo > 0) {
            notifs.push({
                id: 'expiring-soon',
                title: 'Vencimientos',
                message: `${data.inventario.itemsVenciendo} productos están por vencer esta semana.`,
                time: 'Alerta'
            });
        }

        return notifs;
    }, [data]);

    return {
        data,
        loading,
        refreshing,
        error,
        notifications,
        onRefresh,
        clearError: () => setError('')
    };
};
