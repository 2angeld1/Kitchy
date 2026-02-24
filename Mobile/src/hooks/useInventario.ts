import { useState, useEffect, useCallback } from 'react';
import {
    getInventario,
    createInventario,
    updateInventario,
    deleteInventario,
    registrarEntrada,
    registrarSalida,
    importarInventario
} from '../services/api';

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
    const [refreshing, setRefreshing] = useState(false);

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

    const cargarInventario = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

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
            setRefreshing(false);
        }
    }, [filtro]);

    useEffect(() => {
        cargarInventario();
    }, [cargarInventario]);

    const handleRefresh = async () => {
        await cargarInventario(true);
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

    const clearError = () => setError('');
    const clearSuccess = () => setSuccess('');

    // Csv Import
    const handleImportCsv = async (file: any) => {
        setLoading(true);
        try {
            const formData = new FormData();

            // Para Web: file es un objeto File del navegador.
            // Para Native (expo-document-picker): file tiene { uri, name, mimeType }
            if (file.uri) {
                formData.append('archivo', {
                    uri: file.uri,
                    name: file.name || 'inventario.csv',
                    type: file.mimeType || 'text/csv'
                } as any);
            } else {
                // Caida para web standard si se usa un evento de input
                formData.append('archivo', file);
            }

            const response = await importarInventario(formData);
            const data = response.data;
            setSuccess(`Importación lista. Nuevos: ${data.detalles.creados}, Actualizados: ${data.detalles.actualizados}`);

            if (data.detalles.errores && data.detalles.errores.length > 0) {
                console.warn('Errores de importación:', data.detalles.errores);
            }
            cargarInventario();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al importar CSV');
        } finally {
            setLoading(false);
        }
    };

    // Smart Input (Asistente de Voz / Comandos Rápidos)
    const [smartText, setSmartText] = useState('');
    const [isListening, setIsListening] = useState(false);

    const parseSmartInput = (text: string) => {
        let cleanText = text.trim();
        let precio = null;
        let isSalida = false;

        const salidaRegex = /^(gaste|gasté|use|usé|consumi|consumí|sacar|saqué|baja|menos|vendi|vendí)\s+/i;
        if (salidaRegex.test(cleanText)) {
            isSalida = true;
            cleanText = cleanText.replace(salidaRegex, '').trim();
        }

        const priceRegex = /\s+(\d+(?:[\.,]\d{1,2})?)\s*(?:dolar|dolares|usd|peso|pesos|\$)?$/i;
        const priceMatch = cleanText.match(priceRegex);

        if (priceMatch) {
            precio = parseFloat(priceMatch[1].replace(',', '.'));
            cleanText = cleanText.replace(priceRegex, '').trim();
        }

        const structureRegex = /^(\d+(?:[\.,]\d+)?)\s*([a-zA-ZñÑ]+)?\s+(?:de\s+)?(.+)$/i;
        const match = cleanText.match(structureRegex);

        if (match) {
            return {
                cantidad: match[1].replace(',', '.'),
                unidad: match[2],
                nombre: match[3],
                precio,
                isSalida
            };
        }

        if (precio !== null && cleanText) {
            return {
                cantidad: "1",
                unidad: "unidades",
                nombre: cleanText,
                precio,
                isSalida
            };
        }

        if (isSalida && cleanText) {
            return {
                cantidad: "1",
                unidad: "unidades",
                nombre: cleanText,
                precio: null,
                isSalida
            };
        }

        return null;
    };

    const normalizeUnit = (u: string = '') => {
        const unit = u.toLowerCase();
        if (['kg', 'kilo', 'kilos', 'kilogramo', 'kilogramos'].includes(unit)) return 'kg';
        if (['lb', 'libra', 'libras'].includes(unit)) return 'lb';
        if (['l', 'litro', 'litros'].includes(unit)) return 'litros';
        if (['ml', 'mililitro', 'mililitros'].includes(unit)) return 'ml';
        if (['g', 'gramo', 'gramos'].includes(unit)) return 'gramos';
        if (['caja', 'cajas'].includes(unit)) return 'unidades';
        return 'unidades';
    };

    const findSmartMatch = (searchName: string) => {
        const cleanName = searchName.toLowerCase().trim();
        const baseName = cleanName.replace(/es$|s$/, '');

        return items.find(item => {
            const itemName = item.nombre.toLowerCase();
            const itemBase = itemName.replace(/es$|s$/, '');
            return itemName === cleanName ||
                itemBase === baseName ||
                itemName.includes(baseName) ||
                baseName.includes(itemBase);
        });
    };

    const handleSmartAction = async () => {
        if (!smartText) return;

        const parsed = parseSmartInput(smartText);

        if (!parsed) {
            const existing = findSmartMatch(smartText);
            if (existing) {
                setSelectedItem(existing);
                setMovTipo('entrada');
                setMovCantidad('');
                setMovMotivo('');
                setMovCosto('');
                setShowMovModal(true);
            } else {
                resetForm();
                setNombre(smartText.charAt(0).toUpperCase() + smartText.slice(1));
                setShowModal(true);
            }
            setSmartText('');
            return;
        }

        const { cantidad, unidad, nombre: rawNombre, precio, isSalida } = parsed;
        const itemName = rawNombre.trim();
        const existing = findSmartMatch(itemName);
        const qty = parseFloat(cantidad);

        if (existing) {
            let costoTotal = 0;
            if (precio) {
                costoTotal = precio * qty;
            } else {
                costoTotal = existing.costoUnitario * qty;
            }

            setSelectedItem(existing);
            setMovTipo(isSalida ? 'salida' : 'entrada');
            setMovCantidad(qty.toString());
            setMovCosto(costoTotal > 0 ? costoTotal.toString() : '');
            setMovMotivo('Voz/Inteligente: ' + smartText);
            setShowMovModal(true);

        } else {
            resetForm();
            setNombre(itemName.charAt(0).toUpperCase() + itemName.slice(1));
            setDescripcion('Ingreso rápido');
            setCantidad(qty.toString());
            setUnidad(normalizeUnit(unidad));
            setCantidadMinima('1');

            if (precio) {
                setCostoUnitario(precio.toString());
            }

            setShowModal(true);
        }

        setSmartText('');
    };

    const itemsFiltrados = items.filter(item => {
        if (!smartText) return true;
        const parsed = parseSmartInput(smartText);
        const searchTerm = parsed && parsed.nombre ? parsed.nombre.toLowerCase().trim() : smartText.toLowerCase().trim();
        return item.nombre.toLowerCase().includes(searchTerm);
    });

    return {
        // Data
        items,
        loading,
        refreshing,
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
        filtro,
        setFiltro,

        // Smart Input
        smartText,
        setSmartText,
        isListening,
        setIsListening,
        handleSmartAction,
        handleImportCsv,

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
