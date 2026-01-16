import { useState, useEffect } from 'react';
import { getProductos, createVenta, getVentas } from '../services/api';

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
    
    // UI State
    const [showModal, setShowModal] = useState(false);
    const [showHistorial, setShowHistorial] = useState(false);
    
    // Form State
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [cliente, setCliente] = useState('');
    
    // Feedback
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
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
        } catch (err) {
            setError('Error al cargar productos');
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

    const handleRefresh = async (event: CustomEvent) => {
        await cargarProductos();
        event.detail.complete();
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
            setError('El carrito está vacío');
            return;
        }

        setLoading(true);
        try {
            const items = carrito.map(item => ({
                productoId: item.producto._id,
                cantidad: item.cantidad
            }));

            await createVenta({ items, metodoPago, cliente });
            setSuccess('¡Venta registrada exitosamente!');
            setCarrito([]);
            setCliente('');
            setMetodoPago('efectivo');
            setShowModal(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al procesar venta');
        } finally {
            setLoading(false);
        }
    };

    const iniciarNuevaVenta = () => {
        setCarrito([]);
        setCliente('');
        setMetodoPago('efectivo');
        setBusqueda('');
        setCategoriaFiltro('');
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
    
    const clearError = () => setError('');
    const clearSuccess = () => setSuccess('');

    return {
        productos,
        carrito,
        ventas,
        loading,
        showModal, setShowModal,
        showHistorial, setShowHistorial,
        metodoPago, setMetodoPago,
        cliente, setCliente,
        error, clearError,
        success, clearSuccess,
        busqueda, setBusqueda,
        categoriaFiltro, setCategoriaFiltro,
        
        cargarProductos,
        cargarVentas,
        handleRefresh,
        agregarAlCarrito,
        quitarDelCarrito,
        eliminarDelCarrito,
        calcularTotal,
        procesarVenta,
        iniciarNuevaVenta,
        abrirHistorial,
        productosFiltrados
    };
};
