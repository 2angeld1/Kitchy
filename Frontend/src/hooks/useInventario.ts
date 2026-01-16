import { useState, useEffect } from 'react';
import { getInventario, createInventario, updateInventario, deleteInventario, registrarEntrada, registrarSalida } from '../services/api';

export interface InventarioItem {
    _id: string;
    nombre: string;
    descripcion?: string;
    cantidad: number;
    unidad: string;
    cantidadMinima: number;
    costoUnitario: number;
    categoria: string;
    proveedor?: string;
}

export const useInventario = () => {
    const [items, setItems] = useState<InventarioItem[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Modals
    const [showModal, setShowModal] = useState(false);
    const [showMovModal, setShowMovModal] = useState(false);
    
    // Selection
    const [editItem, setEditItem] = useState<InventarioItem | null>(null);
    const [selectedItem, setSelectedItem] = useState<InventarioItem | null>(null);
    
    // Movement Form
    const [movTipo, setMovTipo] = useState<'entrada' | 'salida'>('entrada');
    const [movCantidad, setMovCantidad] = useState('');
    const [movMotivo, setMovMotivo] = useState('');
    const [movCosto, setMovCosto] = useState('');
    
    // Feedback
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Filters & Search
    const [busqueda, setBusqueda] = useState('');
    const [filtro, setFiltro] = useState('todos');
    
    // Form State (Main Item)
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [unidad, setUnidad] = useState('unidades');
    const [cantidadMinima, setCantidadMinima] = useState('');
    const [costoUnitario, setCostoUnitario] = useState('');
    const [categoria, setCategoria] = useState('ingrediente');
    const [proveedor, setProveedor] = useState('');

    useEffect(() => {
        cargarInventario();
    }, [filtro]);

    const cargarInventario = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filtro === 'stockBajo') {
                params.stockBajo = true;
            } else if (filtro !== 'todos') {
                params.categoria = filtro;
            }
            const response = await getInventario(params);
            setItems(response.data);
        } catch (err) {
            setError('Error al cargar inventario');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async (event: CustomEvent) => {
        await cargarInventario();
        event.detail.complete();
    };

    const resetForm = () => {
        setNombre('');
        setDescripcion('');
        setCantidad('');
        setUnidad('unidades');
        setCantidadMinima('');
        setCostoUnitario('');
        setCategoria('ingrediente');
        setProveedor('');
        setEditItem(null);
    };

    const openEditModal = (item: InventarioItem) => {
        setEditItem(item);
        setNombre(item.nombre);
        setDescripcion(item.descripcion || '');
        setCantidad(item.cantidad.toString());
        setUnidad(item.unidad);
        setCantidadMinima(item.cantidadMinima.toString());
        setCostoUnitario(item.costoUnitario.toString());
        setCategoria(item.categoria);
        setProveedor(item.proveedor || '');
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!nombre || !costoUnitario) {
            setError('Nombre y costo unitario son requeridos');
            return;
        }

        setLoading(true);
        try {
            const data = {
                nombre,
                descripcion,
                cantidad: parseFloat(cantidad) || 0,
                unidad,
                cantidadMinima: parseFloat(cantidadMinima) || 0,
                costoUnitario: parseFloat(costoUnitario),
                categoria,
                proveedor
            };

            if (editItem) {
                await updateInventario(editItem._id, data);
                setSuccess('Item actualizado');
            } else {
                await createInventario(data);
                setSuccess('Item creado');
            }

            setShowModal(false);
            resetForm();
            cargarInventario();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Eliminar este item?')) return;

        setLoading(true);
        try {
            await deleteInventario(id);
            setSuccess('Item eliminado');
            cargarInventario();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al eliminar');
        } finally {
            setLoading(false);
        }
    };

    const openMovModal = (item: InventarioItem, tipo: 'entrada' | 'salida') => {
        setSelectedItem(item);
        setMovTipo(tipo);
        setMovCantidad('');
        setMovMotivo('');
        setMovCosto('');
        setShowMovModal(true);
    };

    const handleMovimiento = async () => {
        if (!selectedItem || !movCantidad) {
            setError('Ingresa una cantidad');
            return;
        }

        setLoading(true);
        try {
            if (movTipo === 'entrada') {
                await registrarEntrada(selectedItem._id, {
                    cantidad: parseFloat(movCantidad),
                    costoTotal: parseFloat(movCosto) || undefined,
                    motivo: movMotivo
                });
            } else {
                await registrarSalida(selectedItem._id, {
                    cantidad: parseFloat(movCantidad),
                    motivo: movMotivo
                });
            }

            setSuccess(`${movTipo === 'entrada' ? 'Entrada' : 'Salida'} registrada`);
            setShowMovModal(false);
            cargarInventario();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al registrar movimiento');
        } finally {
            setLoading(false);
        }
    };

    const itemsFiltrados = items.filter(item =>
        item.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
    
    const clearError = () => setError('');
    const clearSuccess = () => setSuccess('');

    return {
        // Data
        items,
        loading,
        error,
        success,
        clearError,
        clearSuccess,
        itemsFiltrados,
        
        // Modal Visibility
        showModal,
        setShowModal,
        showMovModal,
        setShowMovModal,
        
        // Selection
        editItem,
        selectedItem,
        
        // Filters
        busqueda,
        setBusqueda,
        filtro,
        setFiltro,
        
        // Movement Form State
        movTipo,
        movCantidad,
        setMovCantidad,
        movMotivo,
        setMovMotivo,
        movCosto,
        setMovCosto,
        
        // Item Form State
        nombre, setNombre,
        descripcion, setDescripcion,
        cantidad, setCantidad,
        unidad, setUnidad,
        cantidadMinima, setCantidadMinima,
        costoUnitario, setCostoUnitario,
        categoria, setCategoria,
        proveedor, setProveedor,
        
        // Actions
        handleRefresh,
        resetForm,
        openEditModal,
        handleSubmit,
        handleDelete,
        openMovModal,
        handleMovimiento
    };
};
