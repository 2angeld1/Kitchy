import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProductos, createVenta, getEspecialistas, getVentas } from '../services/api';
import Toast from 'react-native-toast-message';
import { getTodayLocalString } from '../utils/date-helpers';

export interface Producto {
    _id: string;
    nombre: string;
    precio: number;
    categoria: string;
    isInventory?: boolean;
}

export interface Especialista {
    _id: string;
    nombre: string;
    rol: string;
}

export const useBellezaVentas = () => {
    const { user } = useAuth();
    const [servicios, setServicios] = useState<Producto[]>([]);
    const [productosVenta, setProductosVenta] = useState<Producto[]>([]);
    const [especialistas, setEspecialistas] = useState<(Especialista & { conteoDia?: number })[]>([]);
    const [ventas, setVentas] = useState<any[]>([]);
    const [showHistorial, setShowHistorial] = useState(false);
    const [loading, setLoading] = useState(false);

    // Estado del "ticket" de belleza (Multiselección)
    const [itemsSeleccionados, setItemsSeleccionados] = useState<Producto[]>([]);
    const [especialistaSeleccionado, setEspecialistaSeleccionado] = useState<string | null>(null);
    const [metodoPago, setMetodoPago] = useState<'efectivo' | 'yappy' | 'tarjeta' | 'combinado'>('efectivo');
    const [pagoCombinado, setPagoCombinado] = useState<{ metodo: string; monto: number }[]>([]);

    const [montoRecibido, setMontoRecibido] = useState<string>('');
    const [lastVentaId, setLastVentaId] = useState<string | null>(null);

    const cargarDatos = useCallback(async () => {
        setLoading(true);
        try {
            const hoy = getTodayLocalString();
            const { getInventario } = require('../services/api');
            const [servRes, espRes, ventRes, invRes] = await Promise.all([
                getProductos({ disponible: true }),
                getEspecialistas(),
                getVentas({ fecha: hoy }),
                getInventario({ categoria: 'reventa' })
            ]);

            setServicios(servRes.data);

            // Mapear items de inventario a formato Producto para la UI
            const itemsVenta = invRes.data.map((inv: any) => ({
                _id: inv._id,
                nombre: inv.nombre,
                precio: inv.precioVenta || inv.costoUnitario,
                categoria: 'PRODUCTO',
                isInventory: true
            }));
            setProductosVenta(itemsVenta);

            // Calcular conteo del día para cada barbero de forma robusta
            const ventasHoy = Array.isArray(ventRes.data) ? ventRes.data : (ventRes.data.ventas || []);
            
            const especialistasConConteo = espRes.data.map((esp: any) => {
                const espId = String(esp._id);
                // Sumar la cantidad de ítems de cada venta que pertenezca a este especialista
                const conteo = ventasHoy.reduce((total: number, v: any) => {
                    const vEspId = v.especialista?._id ? String(v.especialista._id) : String(v.especialista);
                    if (vEspId === espId) {
                        // Sumamos la cantidad de todos los ítems de esa venta
                        const cantItems = v.items?.reduce((sum: number, item: any) => sum + (item.cantidad || 1), 0) || 1;
                        return total + cantItems;
                    }
                    return total;
                }, 0);
                return { ...esp, conteoDia: conteo };
            });

            setEspecialistas(especialistasConConteo);
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar los datos.' });
        } finally {
            setLoading(false);
        }
    }, [user?.negocioActivo]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const toggleItem = useCallback((item: Producto) => {
        setItemsSeleccionados(prev => {
            const index = prev.findIndex(s => s._id === item._id);
            if (index >= 0) {
                return prev.filter(s => s._id !== item._id);
            } else {
                return [...prev, item];
            }
        });
    }, []);
    
    const total = useMemo(() => itemsSeleccionados.reduce((acc, s) => acc + s.precio, 0), [itemsSeleccionados]);
    const cambio = useMemo(() => {
        const recibido = parseFloat(montoRecibido);
        return recibido > total ? recibido - total : 0;
    }, [montoRecibido, total]);

    const procesarCobro = useCallback(async (clienteInfo?: any, onSuccess?: () => void) => {
        if (itemsSeleccionados.length === 0) {
            Toast.show({ type: 'info', text1: 'Atención', text2: 'Selecciona al menos un servicio o producto.' });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                items: itemsSeleccionados.map(s => ({ productoId: s._id, cantidad: 1 })),
                metodoPago,
                pagoCombinado: metodoPago === 'combinado' ? pagoCombinado : undefined,
                especialista: especialistaSeleccionado,
                cliente: clienteInfo // Cambiado a 'cliente' para matchear el backend
            };

            const res = await createVenta(payload);
            setLastVentaId(res.data._id); // Guardar para posible Undo

            if (onSuccess) onSuccess();

            // Reset y recargar conteos
            setItemsSeleccionados([]);
            setEspecialistaSeleccionado(null);
            setMontoRecibido('');
            setPagoCombinado([]);
            cargarDatos();
        } catch (err: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: err.response?.data?.message || 'Error al procesar' });
        } finally {
            setLoading(false);
        }
    }, [itemsSeleccionados, especialistaSeleccionado, metodoPago, pagoCombinado, cargarDatos]);

    const anularUltimaVenta = useCallback(async () => {
        if (!lastVentaId) return;

        setLoading(true);
        try {
            const { deleteVenta } = require('../services/api');
            await deleteVenta(lastVentaId);
            setLastVentaId(null);
            Toast.show({ type: 'info', text1: 'Venta Anulada', text2: 'La última transacción fue eliminada.' });
            cargarDatos();
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo anular la venta.' });
        } finally {
            setLoading(false);
        }
    }, [lastVentaId, cargarDatos]);

    const cargarVentas = useCallback(async () => {
        try {
            const response = await getVentas({ limit: 20 });
            setVentas(response.data.ventas || response.data);
        } catch (err) {
            console.error('Error al cargar ventas');
        }
    }, [user?.negocioActivo]);

    const abrirHistorial = useCallback(async () => {
        await cargarVentas();
        setShowHistorial(true);
    }, [cargarVentas]);

    return {
        servicios,
        productosVenta,
        especialistas,
        ventas,
        loading,
        showHistorial,
        setShowHistorial,
        itemsSeleccionados, toggleItem,
        especialistaSeleccionado, setEspecialistaSeleccionado,
        metodoPago, setMetodoPago,
        pagoCombinado, setPagoCombinado,
        montoRecibido, setMontoRecibido,
        lastVentaId, anularUltimaVenta,
        procesarCobro,
        abrirHistorial,
        total,
        cambio,
        onRefresh: cargarDatos
    };
};
