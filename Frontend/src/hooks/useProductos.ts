import { useState, useEffect } from 'react';
import { resizeImage } from '../utils/imageUtils';
import { getProductos, createProducto, updateProducto, deleteProducto, toggleDisponibilidad, importarProductos } from '../services/api';

export interface IIngrediente {
    inventario: any; // Ideally we can populate this or only send the ID
    cantidad: number;
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

    // UI State
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<Producto | null>(null);

    // Feedback
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Search
    const [busqueda, setBusqueda] = useState('');

    // Form state
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [categoria, setCategoria] = useState('comida');
    const [disponible, setDisponible] = useState(true);
    const [imagen, setImagen] = useState('');
    const [ingredientes, setIngredientes] = useState<IIngrediente[]>([]);

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        setLoading(true);
        try {
            const response = await getProductos();
            setProductos(response.data);
        } catch (err) {
            setError('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async (event: CustomEvent) => {
        await cargarProductos();
        event.detail.complete();
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
                inventario: ing.inventario?._id || ing.inventario, // Handle populated vs unpopulated
                cantidad: ing.cantidad,
                nombreDisplay: ing.inventario?.nombre // Guardar nombre si viene populateado para mostrarlo
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
                imagen,
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
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Eliminar este producto?')) return;

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
    };

    const handleToggleDisponible = async (id: string) => {
        try {
            await toggleDisponibilidad(id);
            setProductos(prev => prev.map(p =>
                p._id === id ? { ...p, disponible: !p.disponible } : p
            ));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cambiar disponibilidad');
        }
    };

    const handleImportCsv = async (file: File) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('archivo', file);

            const response = await importarProductos(formData);
            const data = response.data;
            setSuccess(`Importación lista. Nuevos: ${data.detalles.creados}, Actualizados: ${data.detalles.actualizados}`);
            if (data.detalles.errores && data.detalles.errores.length > 0) {
                console.warn('Errores de importación:', data.detalles.errores);
            }
            cargarProductos();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al importar CSV de productos');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                // Resize and compress image purely on client side before setting state
                const resizedImage = await resizeImage(file, 800, 800);
                setImagen(resizedImage);
            } catch (error) {
                console.error('Error resizing image:', error);
                // Fallback to original if resize fails
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagen(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const getEmoji = (cat: string) => {
        switch (cat) {
            case 'comida': return '🍔';
            case 'bebida': return '🥤';
            case 'postre': return '🍰';
            default: return '📦';
        }
    };

    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    const clearError = () => setError('');
    const clearSuccess = () => setSuccess('');

    return {
        productos,
        loading,
        showModal, setShowModal,
        editItem,
        error, clearError,
        success, clearSuccess,
        busqueda, setBusqueda,

        nombre, setNombre,
        descripcion, setDescripcion,
        precio, setPrecio,
        categoria, setCategoria,
        disponible, setDisponible,
        imagen, setImagen,
        ingredientes, setIngredientes,

        handleRefresh,
        resetForm,
        openEditModal,
        handleSubmit,
        handleDelete,
        handleToggleDisponible,
        handleImageUpload,
        getEmoji,
        productosFiltrados,
        handleImportCsv
    };
};
