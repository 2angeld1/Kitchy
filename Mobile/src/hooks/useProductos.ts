import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native'; // Fallback just in case, though we'll use Toast natively in the screen
import {
    getProductos,
    createProducto,
    updateProducto,
    deleteProducto,
    toggleDisponibilidad,
    importarProductos
} from '../services/api';

export interface IIngrediente {
    inventario: any; // ID or populated object
    cantidad: number;
    nombreDisplay?: string;
}

export interface Producto {
    _id: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    categoria: string;
    disponible: boolean;
    imagen?: string;
    ingredientes?: IIngrediente[];
}

export const useProductos = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // UI State
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<Producto | null>(null);

    // Feedback
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Search & Filter
    const [busqueda, setBusqueda] = useState('');
    const [filtro, setFiltro] = useState('todos');

    // Form state
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [categoria, setCategoria] = useState('comida');
    const [disponible, setDisponible] = useState(true);
    const [imagen, setImagen] = useState('');
    const [ingredientes, setIngredientes] = useState<IIngrediente[]>([]);

    const cargarProductos = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const params: any = {};
            if (filtro !== 'todos') {
                params.categoria = filtro;
            }
            const response = await getProductos(params);
            setProductos(response.data);
        } catch (err) {
            setError('Error al cargar productos');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filtro]);

    useEffect(() => {
        cargarProductos();
    }, [cargarProductos]);

    const handleRefresh = async () => {
        await cargarProductos(true);
    };

    const resetForm = () => {
        setNombre('');
        setDescripcion('');
        setPrecio('');
        setCategoria('comida');
        setDisponible(true);
        setImagen('');
        setIngredientes([]);
        setEditItem(null);
    };

    const openEditModal = (item: Producto) => {
        setEditItem(item);
        setNombre(item.nombre);
        setDescripcion(item.descripcion || '');
        setPrecio(item.precio.toString());
        setCategoria(item.categoria);
        setDisponible(item.disponible);
        setImagen(item.imagen || '');

        // Cargar ingredientes
        if (item.ingredientes && item.ingredientes.length > 0) {
            setIngredientes(item.ingredientes.map((ing: any) => ({
                inventario: ing.inventario?._id || ing.inventario,
                cantidad: ing.cantidad,
                nombreDisplay: ing.inventario?.nombre
            })));
        } else {
            setIngredientes([]);
        }

        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!nombre || !precio) {
            setError('Nombre y precio son requeridos');
            return;
        }

        setLoading(true);
        try {
            const data = {
                nombre,
                descripcion,
                precio: parseFloat(precio),
                categoria,
                disponible,
                imagen, // Will handle base64 strings or URLs if provided
                ingredientes: ingredientes.map(ing => ({
                    inventario: ing.inventario,
                    cantidad: Number(ing.cantidad)
                }))
            };

            if (editItem) {
                const response = await updateProducto(editItem._id, data);
                setProductos(prev => prev.map(p => p._id === editItem._id ? response.data : p));
                setSuccess('Producto actualizado');
            } else {
                const response = await createProducto(data);
                setProductos(prev => [...prev, response.data]);
                setSuccess('Producto creado');
            }

            setShowModal(false);
            resetForm();
            cargarProductos();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            "Eliminar Producto",
            "¿Estás seguro de que deseas eliminar este producto?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await deleteProducto(id);
                            setSuccess('Producto eliminado');
                            setProductos(prev => prev.filter(p => p._id !== id));
                        } catch (err: any) {
                            setError(err.response?.data?.message || 'Error al eliminar');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleToggleDisponible = async (id: string, currentState: boolean) => {
        try {
            // Optimistic update
            setProductos(prev => prev.map(p => p._id === id ? { ...p, disponible: !p.disponible } : p));
            await toggleDisponibilidad(id);
        } catch (err: any) {
            // Revert on error
            setProductos(prev => prev.map(p => p._id === id ? { ...p, disponible: currentState } : p));
            setError(err.response?.data?.message || 'Error al cambiar disponibilidad');
        }
    };

    const handleImportCsv = async (file: any) => {
        setLoading(true);
        try {
            const formData = new FormData();

            if (file.uri) {
                formData.append('archivo', {
                    uri: file.uri,
                    name: file.name || 'productos.csv',
                    type: file.mimeType || 'text/csv'
                } as any);
            } else {
                formData.append('archivo', file);
            }

            const response = await importarProductos(formData);
            const data = response.data;
            setSuccess(`Importación lista. Nuevos: ${data.detalles.creados}, Act: ${data.detalles.actualizados}`);
            cargarProductos();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al importar CSV');
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => setError('');
    const clearSuccess = () => setSuccess('');

    const productosFiltrados = productos.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
        const matchesFilter = filtro === 'todos' ? true : p.categoria === filtro;
        return matchesSearch && matchesFilter;
    });

    return {
        // Data
        productos,
        loading,
        refreshing,
        error, clearError,
        success, clearSuccess,
        productosFiltrados,

        // Modals
        showModal, setShowModal,
        editItem,

        // Search & Filters
        busqueda, setBusqueda,
        filtro, setFiltro,

        // Form fields
        nombre, setNombre,
        descripcion, setDescripcion,
        precio, setPrecio,
        categoria, setCategoria,
        disponible, setDisponible,
        imagen, setImagen,
        ingredientes, setIngredientes,

        // Actions
        handleRefresh,
        resetForm,
        openEditModal,
        handleSubmit,
        handleDelete,
        handleToggleDisponible,
        handleImportCsv
    };
};
