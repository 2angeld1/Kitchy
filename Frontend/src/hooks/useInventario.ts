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

    // Smart Input
    const [smartText, setSmartText] = useState('');
    const [isListening, setIsListening] = useState(false);

    const parseSmartInput = (text: string) => {
        let cleanText = text.trim();
        let precio = null;

        // 1. Try to extract price from end (e.g. "1 dolar", "1.50", "a 5")
        // Matches: number at end, optionally followed by currency words
        const priceRegex = /\s+(\d+(?:[\.,]\d{1,2})?)\s*(?:dolar|dolares|usd|peso|pesos|\$)?$/i;
        const priceMatch = cleanText.match(priceRegex);

        if (priceMatch) {
            precio = parseFloat(priceMatch[1].replace(',', '.'));
            cleanText = cleanText.replace(priceRegex, '').trim();
        }

        // 2. Parse Quantity + Unit + Name from the remaining text
        // Regex: Start with Number -> Space -> Optional Unit -> Space -> Optional "de" -> Name
        const structureRegex = /^(\d+(?:[\.,]\d+)?)\s*([a-zA-ZñÑ]+)?\s+(?:de\s+)?(.+)$/i;
        const match = cleanText.match(structureRegex);

        if (match) {
            return {
                cantidad: match[1].replace(',', '.'),
                unidad: match[2],
                nombre: match[3],
                precio
            };
        }

        // If structure doesn't match perfectly but we found a price, try to treating the rest as name or name + qty
        if (precio !== null && cleanText) {
            return {
                cantidad: "1", // Default to 1 if not specified
                unidad: "unidades",
                nombre: cleanText,
                precio
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
        if (['caja', 'cajas'].includes(unit)) return 'unidades'; // Map boxes to units or handle differently if needed
        return 'unidades'; // Default
    };

    const findSmartMatch = (searchName: string) => {
        const cleanName = searchName.toLowerCase().trim();
        // Remove trailing 's' or 'es' for comparison to handle pluralization roughly
        const baseName = cleanName.replace(/es$|s$/, '');

        return items.find(item => {
            const itemName = item.nombre.toLowerCase();
            const itemBase = itemName.replace(/es$|s$/, '');

            // Check exact match, singular base match, or if one includes the other
            // Example: "tomate" matches "tomates", "caja de leche" matches "leche"
            return itemName === cleanName ||
                itemBase === baseName ||
                itemName.includes(baseName) ||
                baseName.includes(itemBase);
        });
    };

    const handleSmartAction = async () => {
        if (!smartText) return;

        const parsed = parseSmartInput(smartText);

        // Fallback for simple searches or unparsed text
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
                setNombre(smartText);
                setShowModal(true);
            }
            setSmartText('');
            return;
        }

        const { cantidad, unidad, nombre: rawNombre, precio } = parsed;
        const itemName = rawNombre.trim();
        const existing = findSmartMatch(itemName);

        const qty = parseFloat(cantidad);

        if (existing) {
            // EXISTING ITEM: Pre-fill Movement Modal
            let costoTotal = 0;

            if (precio) {
                // If price is provided, assume it is Unit Price unless we decide otherwise. 
                // Calculation: Unit Price * Quantity = Total Cost
                costoTotal = precio * qty;
            } else {
                // Default to current Unit Cost * Quantity
                costoTotal = existing.costoUnitario * qty;
            }

            setSelectedItem(existing);
            setMovTipo('entrada');
            setMovCantidad(qty.toString());
            // Show total cost if calculated, otherwise leave empty or show calculated default?
            // User can edit it in the modal.
            setMovCosto(costoTotal > 0 ? costoTotal.toString() : '');
            setMovMotivo('Voz: ' + smartText);
            setShowMovModal(true);

        } else {
            // NEW ITEM: Pre-fill Create Modal
            resetForm();
            setNombre(itemName.charAt(0).toUpperCase() + itemName.slice(1));
            setDescripcion('Ingreso por voz');
            setCantidad(qty.toString());
            setUnidad(normalizeUnit(unidad));
            setCantidadMinima('1');

            if (precio) {
                // For new item, price is per unit
                setCostoUnitario(precio.toString());
            }

            setShowModal(true);
        }

        setSmartText('');
    };

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
        
        // Smart Input
        smartText,
        setSmartText,
        handleSmartAction,
        isListening,
        setIsListening,

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
