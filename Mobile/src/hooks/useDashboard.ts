import { useState, useEffect, useCallback, useMemo } from 'react';
import { getDashboard } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime } from '../utils/date-helpers';

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
        alertasRentabilidad: {
            id: string;
            nombre: string;
            margenActual: string;
            margenObjetivo: number;
            precioActual: number;
            precioSugerido: string;
            costoTotal: string;
        }[];
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
    comisiones?: {
        totalGenerado: number;
        pagoEspecialistas: number;
        pagoDueno: number;
        totalServicios: number;
        especialistas: {
            id: string;
            nombre: string;
            servicios: number;
            generado: number;
            pago: number;
            eficiencia: string;
            porcentajeActual: number;
        }[];
    };
    notificaciones?: { id: string; titulo: string; mensaje: string; tipo: string; icon: string }[];
}

export const useDashboard = (periodo = 'mes', caitlynAdvice?: string | null) => {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const cargarDashboard = async (isRefreshing = false) => {
        if (isRefreshing) {
            setRefreshing(true);
        } else if (!data) {
            setLoading(true);
        }

        try {
            const response = await getDashboard({ periodo });
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

    const negocioId = useMemo(() => {
        if (!user?.negocioActivo) return null;
        return typeof user.negocioActivo === 'object' ? user.negocioActivo._id : user.negocioActivo;
    }, [user?.negocioActivo]);

    useFocusEffect(
        useCallback(() => {
            cargarDashboard();

            // Configurar WebSockets para tiempo real
            let socket: any;
            
            if (negocioId) {
                const { io } = require('socket.io-client');
                const baseUrl = require('../config/api').default.replace('/api', '');
                
                socket = io(baseUrl, {
                    query: { negocioId },
                    transports: ['websocket']
                });

                socket.on('dashboard_update', (payload: any) => {
                    console.log('⚡ Dashboard Update Recibido vía Socket:', payload.tipo);
                    cargarDashboard(true); // Refrescar data sin loading spinner
                });

                socket.on('connect_error', (error: any) => {
                    console.warn('⚠️ Error de conexión Socket:', error.message);
                });
            }

            return () => {
                if (socket) {
                    socket.disconnect();
                }
            };
        }, [negocioId, periodo])
    );

    const onRefresh = useCallback(async () => {
        await cargarDashboard(true);
    }, []);

    // Handlers para acciones desde el Dashboard
    const handleAjustarPrecio = async (id: string) => {
        try {
            const { autoAjustarPrecio } = await import('../services/api');
            await autoAjustarPrecio(id);
            setSuccess('Precio actualizado correctamente');
            onRefresh();
            return true;
        } catch (err) {
            setError('No se pudo actualizar el precio');
            return false;
        }
    };

    const handleAjustarTodosLosPrecios = async () => {
        try {
            setLoading(true);
            const { autoAjustarPrecio } = await import('../services/api');
            
            const alertas = data?.inventario?.alertasRentabilidad || [];
            if (alertas.length === 0) return true;
            
            await Promise.all(alertas.map(a => autoAjustarPrecio(a.id)));
            
            setSuccess(`¡${alertas.length} precios actualizados correctamente!`);
            onRefresh();
            return true;
        } catch (err) {
            setError('Error al actualizar precios en batería');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Lógica de Negocio: Generar notificaciones basadas en la data
    const notifications = useMemo(() => {
        if (!data) return [];
        const notifs: any[] = [];

        // Detectar categoría para personalizar emojis y términos
        const negocio = user?.negocioActivo && typeof user.negocioActivo === 'object' ? user.negocioActivo : null;
        const isComida = negocio?.categoria === 'COMIDA';
        const emojiVenta = isComida ? '🍔' : '💈';
        const labelActor = isComida ? 'Vendedor' : 'Barbero';

        if (data.ventas.recientes) {
            data.ventas.recientes.forEach((v: any) => {
                // Si el especialista es solo un ID, tratar de encontrarlo en la data de comisiones
                let nombreVendedor = labelActor;
                if (v.especialista?.nombre) {
                    nombreVendedor = v.especialista.nombre.split(' ')[0];
                } else if (v.especialista && data.comisiones?.especialistas) {
                    const found = data.comisiones.especialistas.find((e: any) => e.id === v.especialista || e._id === v.especialista);
                    if (found) nombreVendedor = found.nombre.split(' ')[0];
                }

                const itemsStr = v.items?.map((i: any) => i.nombreProducto || i.producto?.nombre || i.nombre || (isComida ? 'Producto' : 'Servicio')).join(', ') || (isComida ? 'un producto' : 'un servicio');
                const detalle = v.cliente ? `a ${v.cliente}` : '';
                
                notifs.push({
                    id: v._id,
                    title: `Venta Procesada ${emojiVenta}`,
                    message: `${nombreVendedor} cobró: ${itemsStr}. Total: $${v.total.toFixed(2)} ${detalle}`,
                    time: formatRelativeTime(v.createdAt || v.fecha)
                });
            });
        }

        if (data.inventario.itemsStockBajo > 0) {
            notifs.push({
                id: 'low-stock',
                title: 'Stock Bajo',
                message: `Atención: Tienes ${data.inventario.itemsStockBajo} productos con stock crítico.`,
                time: 'Hoy'
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

        if (caitlynAdvice) {
            notifs.unshift({
                id: 'caitlyn-ai-insight',
                title: 'Caitlyn AI',
                message: caitlynAdvice,
                time: 'Ahora mismo',
                type: 'ai'
            });
        }

        // Incorporar notificaciones enviadas por el servidor
        if (data.notificaciones) {
            data.notificaciones.forEach((n: any) => {
                // Evitar duplicados si ya existen por lógica local
                if (!notifs.find(existing => existing.id === n.id)) {
                    notifs.push({
                        id: n.id,
                        title: n.titulo,
                        message: n.mensaje,
                        time: 'Alerta',
                        type: n.tipo
                    });
                }
            });
        }

        return notifs;
    }, [data, caitlynAdvice]);

    return {
        data,
        loading,
        refreshing,
        error,
        success,
        notifications,
        onRefresh,
        handleAjustarPrecio,
        handleAjustarTodosLosPrecios,
        clearError: () => setError(''),
        clearSuccess: () => setSuccess('')
    };
};
