import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProductos, createVenta, getEspecialistas, getVentas } from '../services/api';
import Toast from 'react-native-toast-message';

export interface Producto {
    _id: string;
    nombre: string;
    precio: number;
    categoria: string;
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
    const [serviciosSeleccionados, setServiciosSeleccionados] = useState<Producto[]>([]);
    const [especialistaSeleccionado, setEspecialistaSeleccionado] = useState<string | null>(null);
    const [metodoPago, setMetodoPago] = useState<'efectivo' | 'yappy' | 'tarjeta'>('efectivo');

    // Sugerencias: Nombre cliente, Calculadora, Undo
    const [clienteNombre, setClienteNombre] = useState('');
    const [montoRecibido, setMontoRecibido] = useState<string>('');
    const [lastVentaId, setLastVentaId] = useState<string | null>(null);

    const cargarDatos = useCallback(async () => {
        setLoading(true);
        try {
            const hoy = new Date().toISOString().split('T')[0];
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

            // Calcular conteo del día para cada barbero
            const ventasHoy = ventRes.data.ventas || ventRes.data || [];
            const especialistasConConteo = espRes.data.map((esp: any) => {
                const conteo = ventasHoy.filter((v: any) => v.especialista === esp._id || v.especialista?._id === esp._id).length;
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

    const toggleServicio = useCallback((serv: Producto) => {
        setServiciosSeleccionados(prev => {
            const index = prev.findIndex(s => s._id === serv._id);
            if (index >= 0) {
                return prev.filter(s => s._id !== serv._id);
            } else {
                return [...prev, serv];
            }
        });
    }, []);

    const total = useMemo(() => serviciosSeleccionados.reduce((acc, s) => acc + s.precio, 0), [serviciosSeleccionados]);
    const cambio = useMemo(() => {
        const recibido = parseFloat(montoRecibido);
        return recibido > total ? recibido - total : 0;
    }, [montoRecibido, total]);

    const procesarCobro = useCallback(async (onSuccess?: () => void) => {
        if (serviciosSeleccionados.length === 0 || !especialistaSeleccionado) {
            Toast.show({ type: 'info', text1: 'Atención', text2: 'Selecciona al menos un servicio y un especialista.' });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                items: serviciosSeleccionados.map(s => ({ productoId: s._id, cantidad: 1 })),
                metodoPago,
                especialista: especialistaSeleccionado,
                cliente: clienteNombre
            };

            const res = await createVenta(payload);
            setLastVentaId(res.data._id); // Guardar para posible Undo

            if (onSuccess) onSuccess();

            Toast.show({ type: 'success', text1: '¡Venta Lista!', text2: 'Cobro registrado correctamente.' });

            // Reset y recargar conteos
            setServiciosSeleccionados([]);
            setEspecialistaSeleccionado(null);
            setClienteNombre('');
            setMontoRecibido('');
            cargarDatos();
        } catch (err: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: err.response?.data?.message || 'Error al procesar' });
        } finally {
            setLoading(false);
        }
    }, [serviciosSeleccionados, especialistaSeleccionado, metodoPago, clienteNombre, cargarDatos]);

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
        serviciosSeleccionados, toggleServicio,
        especialistaSeleccionado, setEspecialistaSeleccionado,
        metodoPago, setMetodoPago,
        clienteNombre, setClienteNombre,
        montoRecibido, setMontoRecibido,
        lastVentaId, anularUltimaVenta,
        procesarCobro,
        abrirHistorial,
        total,
        cambio,
        onRefresh: cargarDatos
    };
};
