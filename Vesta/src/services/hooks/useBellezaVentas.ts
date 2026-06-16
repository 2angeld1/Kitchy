import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../shared/context/AuthContext';
import { getProductos, createVenta, getEspecialistas, getVentas } from '../../shared/services/api';
import Toast from 'react-native-toast-message';
import { getTodayLocalString } from '../../shared/utils/date-helpers';

export interface Producto {
    _id: string;
    nombre: string;
    precio: number;
    categoria: string;
    isInventory?: boolean;
}

export interface CartItem extends Producto {
    cantidad: number;
    especialistaId: string | null;
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
    const [itemsSeleccionados, setItemsSeleccionados] = useState<CartItem[]>([]);
    const [especialistaSeleccionado, setEspecialistaSeleccionado] = useState<string | null>(null);
    const [metodoPago, setMetodoPago] = useState<'efectivo' | 'yappy' | 'tarjeta' | 'combinado'>('efectivo');
    const [pagoCombinado, setPagoCombinado] = useState<{ metodo: string; monto: number }[]>([]);

    const [montoRecibido, setMontoRecibido] = useState<string>('');
    const [lastVentaId, setLastVentaId] = useState<string | null>(null);

    const cargarDatos = useCallback(async () => {
        setLoading(true);
        try {
            const hoy = getTodayLocalString();
            const { getInventario } = require('../../shared/services/api');
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

    const negocioId = useMemo(() => {
        if (!user?.negocioActivo) return null;
        return typeof user.negocioActivo === 'object' ? user.negocioActivo._id : user.negocioActivo;
    }, [user?.negocioActivo]);

    useEffect(() => {
        cargarDatos();

        // Socket para actualizaciones en tiempo real
        let socket: any;
        if (negocioId) {
            const { io } = require('socket.io-client');
            const baseUrl = require('../../shared/config/api').default.replace('/api', '');
            
            socket = io(baseUrl, {
                query: { negocioId },
                transports: ['websocket']
            });

            socket.on('dashboard_update', (payload: any) => {
                if (payload.tipo.includes('VENTA') || payload.tipo.includes('INVENTARIO')) {
                    console.log('💇‍♂️ Actualización de Belleza vía Socket');
                    cargarDatos();
                }
            });
        }

        return () => {
            if (socket) socket.disconnect();
        };
    }, [negocioId]);

    const updateCartItem = useCallback((item: Producto, especialistaId: string | null, delta: number) => {
        setItemsSeleccionados(prev => {
            const index = prev.findIndex(s => s._id === item._id && s.especialistaId === especialistaId);
            
            if (index >= 0) {
                // El item ya existe para este especialista
                const newItems = [...prev];
                const newQty = newItems[index].cantidad + delta;
                
                if (newQty <= 0) {
                    return newItems.filter((_, i) => i !== index); // Eliminar si llega a 0
                } else {
                    newItems[index].cantidad = newQty;
                    return newItems;
                }
            } else if (delta > 0) {
                // Es nuevo y se está agregando
                return [...prev, { ...item, cantidad: delta, especialistaId }];
            }
            return prev;
        });
    }, []);
    
    const total = useMemo(() => itemsSeleccionados.reduce((acc, s) => acc + (s.precio * s.cantidad), 0), [itemsSeleccionados]);
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
                items: itemsSeleccionados.map(s => ({ 
                    productoId: (s as any).originalId || s._id, 
                    cantidad: s.cantidad,
                    especialista: s.especialistaId 
                })),
                metodoPago,
                pagoCombinado: metodoPago === 'combinado' ? pagoCombinado : undefined,
                especialista: especialistaSeleccionado,
                cliente: clienteInfo,
                ...(clienteInfo?.placa !== undefined ? {
                    placa: clienteInfo.placa,
                    marca: clienteInfo.marca,
                    modelo: clienteInfo.modelo,
                    bahia: clienteInfo.bahia,
                } : {}),
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
            const { deleteVenta } = require('../../shared/services/api');
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
        itemsSeleccionados, updateCartItem,
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

