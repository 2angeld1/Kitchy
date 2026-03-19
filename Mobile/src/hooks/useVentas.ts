import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { getProductos, createVenta, getVentas } from '../services/api';
import Toast from 'react-native-toast-message';

export interface Producto {
    _id: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    categoria: string;
    disponible: boolean;
    imagen?: string;
    insuficiente?: boolean;
    faltantes?: string[];
}

export interface ItemCarrito {
    producto: Producto;
    cantidad: number;
}

export interface Venta {
    _id: string;
    items: any[];
    total: number;
    metodoPago: string;
    cliente?: string;
    createdAt: string;
}

export interface Orden {
    id: string;
    nombre: string;
    items: ItemCarrito[];
    cliente: string;
    metodoPago: string;
}

export const useVentas = () => {
    const { user } = useAuth();
    const [productos, setProductos] = useState<Producto[]>([]);
    const [ordenes, setOrdenes] = useState<Orden[]>([
        { id: Date.now().toString(), nombre: 'Pedido 1', items: [], cliente: '', metodoPago: 'efectivo' }
    ]);
    const [activeOrderId, setActiveOrderId] = useState<string>(ordenes[0].id);
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Get current order and cart
    const activeOrder = useMemo(() => 
        ordenes.find(o => o.id === activeOrderId) || ordenes[0]
    , [ordenes, activeOrderId]);

    const carrito = activeOrder.items;
    const metodoPago = activeOrder.metodoPago;
    const cliente = activeOrder.cliente;

    // UI State
    const [showModal, setShowModal] = useState(false);
    const [showHistorial, setShowHistorial] = useState(false);
    const [showOrderSelector, setShowOrderSelector] = useState(false);

    // Filters
    const [busqueda, setBusqueda] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');

    // Persistencia de Ordenes
    useEffect(() => {
        const cargarOrdenesPersistidas = async () => {
            try {
                const storedValue = await AsyncStorage.getItem('kitchy_ordenes_pendientes');
                const storedActiveId = await AsyncStorage.getItem('kitchy_active_order_id');
                if (storedValue) {
                    const parsed = JSON.parse(storedValue);
                    if (parsed.length > 0) {
                        setOrdenes(parsed);
                        if (storedActiveId) setActiveOrderId(storedActiveId);
                    }
                }
            } catch (err) {
                console.error('Error al cargar ordenes persistidas', err);
            }
        };
        cargarOrdenesPersistidas();
    }, []);

    useEffect(() => {
        const guardarOrdenes = async () => {
            try {
                await AsyncStorage.setItem('kitchy_ordenes_pendientes', JSON.stringify(ordenes));
                await AsyncStorage.setItem('kitchy_active_order_id', activeOrderId);
            } catch (err) {
                console.error('Error al guardar ordenes', err);
            }
        };
        guardarOrdenes();
    }, [ordenes, activeOrderId]);

    useEffect(() => {
        cargarProductos();
    }, [user?.negocioActivo]);

    const cargarProductos = async () => {
        setLoading(true);
        try {
            const response = await getProductos({ disponible: true });
            setProductos(response.data);
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudieron cargar los productos'
            });
        } finally {
            setLoading(false);
        }
    };

    const cargarVentas = async () => {
        try {
            const response = await getVentas({ limit: 10 });
            setVentas(response.data.ventas || response.data);
        } catch (err) {
            console.error('Error al cargar ventas');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await cargarProductos();
        setRefreshing(false);
    };

    const setMetodoPago = (metodo: string) => {
        setOrdenes(ordenes.map(o => o.id === activeOrderId ? { ...o, metodoPago: metodo } : o));
    };

    const setCliente = (nombre: string) => {
        setOrdenes(ordenes.map(o => o.id === activeOrderId ? { ...o, cliente: nombre } : o));
    };

    const nuevaOrden = (nombre: string = '') => {
        const id = Date.now().toString();
        const nueva: Orden = {
            id,
            nombre: nombre || `Pedido ${ordenes.length + 1}`,
            items: [],
            cliente: '',
            metodoPago: 'efectivo'
        };
        setOrdenes([...ordenes, nueva]);
        setActiveOrderId(id);
        Toast.show({ type: 'success', text1: 'Nueva Orden', text2: `Creado: ${nueva.nombre}` });
    };

    const seleccionarOrden = (id: string) => {
        setActiveOrderId(id);
        setShowOrderSelector(false);
    };

    const eliminarOrden = (id: string) => {
        if (ordenes.length === 1) {
            Toast.show({ type: 'info', text1: 'No se puede eliminar', text2: 'Al menos debe haber una orden activa' });
            return;
        }
        const nuevas = ordenes.filter(o => o.id !== id);
        setOrdenes(nuevas);
        if (activeOrderId === id) {
            setActiveOrderId(nuevas[0].id);
        }
    };

    const agregarAlCarrito = (producto: Producto) => {
        if (producto.insuficiente) {
            const sugerencia = getSugerenciaInteligente(producto._id);
            if (sugerencia) {
                Toast.show({
                    type: 'info',
                    text1: '🧠 Sugerencia de Caitlyn',
                    text2: `No hay ${producto.nombre}, ¡pero el ${sugerencia.nombre} está disponible!`,
                    position: 'bottom',
                    visibilityTime: 4000
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Sin Stock',
                    text2: `No hay insumos suficientes para ${producto.nombre}`,
                    position: 'bottom'
                });
            }
            return;
        }

        setOrdenes(ordenes.map(o => {
            if (o.id !== activeOrderId) return o;
            
            const existe = o.items.find(item => item.producto._id === producto._id);
            if (existe) {
                return {
                    ...o,
                    items: o.items.map(item =>
                        item.producto._id === producto._id
                            ? { ...item, cantidad: item.cantidad + 1 }
                            : item
                    )
                };
            } else {
                return {
                    ...o,
                    items: [...o.items, { producto, cantidad: 1 }]
                };
            }
        }));

        // Mini feedback
        Toast.show({
            type: 'success',
            text1: 'Añadido',
            text2: `${producto.nombre} al carrito`,
            position: 'bottom',
            visibilityTime: 1500
        });
    };

    const quitarDelCarrito = (productoId: string) => {
        setOrdenes(ordenes.map(o => {
            if (o.id !== activeOrderId) return o;

            const existe = o.items.find(item => item.producto._id === productoId);
            if (existe && existe.cantidad > 1) {
                return {
                    ...o,
                    items: o.items.map(item =>
                        item.producto._id === productoId
                            ? { ...item, cantidad: item.cantidad - 1 }
                            : item
                    )
                };
            } else {
                return {
                    ...o,
                    items: o.items.filter(item => item.producto._id !== productoId)
                };
            }
        }));
    };

    const eliminarDelCarrito = (productoId: string) => {
        setOrdenes(ordenes.map(o => 
            o.id === activeOrderId 
                ? { ...o, items: o.items.filter(item => item.producto._id !== productoId) }
                : o
        ));
    };

    const calcularTotal = () => {
        return carrito.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);
    };

    const procesarVenta = async () => {
        if (carrito.length === 0) {
            Toast.show({ type: 'error', text1: 'Carrito vacío', text2: 'Agrega productos primero' });
            return;
        }

        setLoading(true);
        try {
            const items = carrito.map(item => ({
                productoId: item.producto._id,
                cantidad: item.cantidad
            }));

            const response = await createVenta({ items, metodoPago, cliente });
            Toast.show({
                type: 'success',
                text1: '¡Venta Registrada!',
                text2: response.data.message || 'La orden se procesó con éxito'
            });

            // Limpiar la orden procesada
            if (ordenes.length > 1) {
                setOrdenes(ordenes.filter(o => o.id !== activeOrderId));
                setActiveOrderId(ordenes.filter(o => o.id !== activeOrderId)[0].id);
            } else {
                setOrdenes([{ ...ordenes[0], items: [], cliente: '', metodoPago: 'efectivo' }]);
            }
            
            setShowModal(false);
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Error al procesar venta';
            Toast.show({ type: 'error', text1: 'Error', text2: msg });
        } finally {
            setLoading(false);
        }
    };

    const abrirHistorial = async () => {
        await cargarVentas();
        setShowHistorial(true);
    };

    const productosFiltrados = productos.filter(p => {
        const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
        const matchCategoria = !categoriaFiltro || p.categoria === categoriaFiltro;
        return matchBusqueda && matchCategoria;
    });

    const getSugerenciaInteligente = (productoId: string) => {
        const prod = productos.find(p => p._id === productoId);
        if (!prod || !prod.insuficiente) return null;

        // Buscar otro de la misma categoría con stock
        const sugerencia = productos.find(p => 
            p.categoria === prod.categoria && 
            !p.insuficiente && 
            p._id !== prod._id
        );

        return sugerencia || null;
    };

    return {
        productos,
        carrito,
        ventas,
        loading,
        refreshing,
        onRefresh,
        showModal, setShowModal,
        showHistorial, setShowHistorial,
        metodoPago, setMetodoPago,
        cliente, setCliente,
        busqueda, setBusqueda,
        categoriaFiltro, setCategoriaFiltro,
        agregarAlCarrito,
        quitarDelCarrito,
        eliminarDelCarrito,
        calcularTotal,
        procesarVenta,
        abrirHistorial,
        productosFiltrados,
        ordenes,
        activeOrderId,
        activeOrder,
        nuevaOrden,
        seleccionarOrden,
        eliminarOrden,
        showOrderSelector,
        setShowOrderSelector,
        getSugerenciaInteligente
    };
};
