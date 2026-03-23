import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';
import {
    getProductos,
    createProducto,
    updateProducto,
    deleteProducto,
    toggleDisponibilidad,
    importarProductos,
    suggestRecipe
} from '../services/api';

import { IIngrediente, Producto } from '../types/producto.types';

export const useProductos = () => {
    const { user } = useAuth();
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingReceta, setLoadingReceta] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Cache para recetas de Caitlyn
    const recetasCache = useRef<Record<string, any>>({});

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
    const [sugerenciaIA, setSugerenciaIA] = useState<IIngrediente[] | null>(null);
    const [costoTotalReceta, setCostoTotalReceta] = useState(0);
    const [precioSugeridoReceta, setPrecioSugeridoReceta] = useState(0);
    const [faltantesIA, setFaltantesIA] = useState<string[]>([]);

    // Asistente Assistant State (Caitlyn)
    const [servingSize, setServingSize] = useState('');
    const [showSizePrompt, setShowSizePrompt] = useState(false);

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
    }, [filtro, user?.negocioActivo]);

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
        setServingSize('');
        setShowSizePrompt(false);
        setCostoTotalReceta(0);
        setPrecioSugeridoReceta(0);
        setSugerenciaIA(null);
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
                nombreDisplay: ing.nombreDisplay || ing.inventario?.nombre,
                unidad: ing.unidad || ing.inventario?.unidad
            })));
        } else {
            setIngredientes([]);
        }

        setSugerenciaIA(null);
        setCostoTotalReceta(0);
        setPrecioSugeridoReceta(0);

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
                    cantidad: Number(ing.cantidad),
                    nombreDisplay: ing.nombreDisplay,
                    unidad: ing.unidad
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
            setProductos(prev => prev.map(p => p._id === id ? { ...p, disponible: !p.disponible } : p));
            await toggleDisponibilidad(id);
        } catch (err: any) {
            setProductos(prev => prev.map(p => p._id === id ? { ...p, disponible: currentState } : p));
            setError(err.response?.data?.message || 'Error al cambiar disponibilidad');
        }
    };

    const handleImportCsv = async (file: any) => {
        setLoading(true);
        try {
            const formData = new FormData();
            if (file.file) formData.append('archivo', file.file);
            else if (file.uri) {
                formData.append('archivo', {
                    uri: file.uri,
                    name: file.name || 'productos.csv',
                    type: file.mimeType || 'text/csv'
                } as any);
            } else formData.append('archivo', file);

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

    const handleAddIngrediente = () => {
        setIngredientes(prev => [...prev, { inventario: '', cantidad: 1 }]);
    };

    const handleRemoveIngrediente = (index: number) => {
        setIngredientes(prev => {
            const nuevos = [...prev];
            nuevos.splice(index, 1);
            return nuevos;
        });
    };

    const handleChangeIngrediente = (index: number, field: string, value: any) => {
        setIngredientes(prev => {
            const nuevos = [...prev];
            (nuevos[index] as any)[field] = value;
            return nuevos;
        });
    };

    const isLiquid = useCallback(() => {
        const nameLower = nombre.toLowerCase();
        const liquidKeywords = ['jugo', 'bebida', 'saril', 'limonada', 'té', 'te', 'café', 'cafe', 'cerveza', 'vino', 'soda', 'agua', 'batido', 'refresco', 'chicha', 'coctel', 'malteada'];
        return categoria === 'bebida' || liquidKeywords.some(key => nameLower.includes(key));
    }, [nombre, categoria]);

    const handleSugerirReceta = async (size?: string) => {
        if (!nombre) {
            setError('Primero escribe el nombre del plato');
            return;
        }

        const cacheKey = `${nombre.toLowerCase()}${size ? `_${size.toLowerCase()}` : ''}`;
        if (recetasCache.current[cacheKey]) {
            const cached = recetasCache.current[cacheKey];
            setSugerenciaIA(cached.sugeridos);
            setCostoTotalReceta(cached.costoTotal);
            setPrecioSugeridoReceta(cached.precioSugerido);
            setSuccess('Chef Caitlyn recuperó la receta de su memoria');
            setShowSizePrompt(false);
            return;
        }

        setLoadingReceta(true);
        try {
            const response = await suggestRecipe(nombre, size);
            if (response.data.success && response.data.recipe) {
                const sugeridos = response.data.recipe.map((ing: any) => ({
                    inventario: ing.inventario,
                    cantidad: ing.cantidad,
                    nombreDisplay: ing.nombre,
                    unidad: ing.unidad,
                    stock_status: ing.stock_status,
                    is_missing: ing.is_missing
                }));

                // Guardar en cache
                recetasCache.current[cacheKey] = {
                    sugeridos,
                    costoTotal: response.data.costoTotal || 0,
                    precioSugerido: response.data.precioSugerido || 0
                };

                setSugerenciaIA(sugeridos);
                setCostoTotalReceta(response.data.costoTotal || 0);
                setPrecioSugeridoReceta(response.data.precioSugerido || 0);
                setFaltantesIA(response.data.faltantes || []);
                setSuccess('Caitlyn encontró una receta sugerida');
                setShowSizePrompt(false);
            }
        } catch (err: any) {
            setError('Error al conectar con la Chef Caitlyn');
        } finally {
            setLoadingReceta(false);
        }
    };

    const handleApplyRecipe = () => {
        if (sugerenciaIA) {
            setIngredientes(sugerenciaIA);
            setSugerenciaIA(null);
            setSuccess('Receta de Caitlyn aplicada');
        }
    };

    const handlePreSugerirReceta = () => {
        if (!nombre) {
            setError('Primero escribe el nombre del plato');
            return;
        }

        let finalSize = servingSize.trim();

        // Inteligencia Kitchy: Si servingSize está vacío, intentar extraerlo del NOMBRE
        if (!finalSize) {
            const sizeRegex = /(\d+\s*(ml|oz|g|kg|l|lb|unid|pza|orden|raciones|lt))/i;
            const match = nombre.match(sizeRegex);
            if (match) {
                finalSize = match[0].trim().toLowerCase();
                setServingSize(finalSize);
            }
        }

        if (isLiquid() && !finalSize) {
            setShowSizePrompt(true);
        } else {
            // Normalizar si solo puso números (ej. el usuario borró la unidad o puso "300")
            if (finalSize && /^\d+$/.test(finalSize)) {
                const num = parseInt(finalSize);
                if (isLiquid()) {
                    finalSize = num > 32 ? `${num}ml` : `${num}oz`;
                } else {
                    finalSize = `${num}g`;
                }
                setServingSize(finalSize);
            }
            handleSugerirReceta(finalSize);
        }
    };

    const handleApplySuggestion = () => {
        if (precioSugeridoReceta > 0) {
            setPrecio(precioSugeridoReceta.toFixed(2));
        }
    };

    return {
        // Data
        productos,
        loading,
        loadingReceta,
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
        backendCostoTotal: costoTotalReceta,
        backendPrecioSugerido: precioSugeridoReceta,
        sugerenciaIA,
        handleApplyRecipe,

        // Asistente Assistant
        servingSize, setServingSize,
        showSizePrompt, setShowSizePrompt,
        isLiquid,
        handlePreSugerirReceta,
        handleApplySuggestion,
        faltantesIA,

        // Actions
        handleRefresh,
        resetForm,
        openEditModal,
        handleSubmit,
        handleDelete,
        handleToggleDisponible,
        handleImportCsv,
        handleAddIngrediente,
        handleRemoveIngrediente,
        handleChangeIngrediente,
        handleSugerirReceta
    };
};
