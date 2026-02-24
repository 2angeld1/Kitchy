import { useState, useEffect } from 'react';
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

export const useVentas = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // UI State
    const [showModal, setShowModal] = useState(false);
    const [showHistorial, setShowHistorial] = useState(false);

    // Form State
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [cliente, setCliente] = useState('');

    // Filters
    const [busqueda, setBusqueda] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');

    useEffect(() => {
        cargarProductos();
    }, []);

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

    const agregarAlCarrito = (producto: Producto) => {
        const existe = carrito.find(item => item.producto._id === producto._id);
        if (existe) {
            setCarrito(carrito.map(item =>
                item.producto._id === producto._id
                    ? { ...item, cantidad: item.cantidad + 1 }
                    : item
            ));
        } else {
            setCarrito([...carrito, { producto, cantidad: 1 }]);
        }

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
        const existe = carrito.find(item => item.producto._id === productoId);
        if (existe && existe.cantidad > 1) {
            setCarrito(carrito.map(item =>
                item.producto._id === productoId
                    ? { ...item, cantidad: item.cantidad - 1 }
                    : item
            ));
        } else {
            setCarrito(carrito.filter(item => item.producto._id !== productoId));
        }
    };

    const eliminarDelCarrito = (productoId: string) => {
        setCarrito(carrito.filter(item => item.producto._id !== productoId));
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

            setCarrito([]);
            setCliente('');
            setMetodoPago('efectivo');
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
        productosFiltrados
    };
};
