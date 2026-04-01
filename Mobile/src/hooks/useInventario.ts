import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth, Negocio } from '../context/AuthContext';
import { getInventario, createInventario, updateInventario, deleteInventario, registrarEntrada, registrarSalida, registrarMerma, importarInventario, lookupProducto, procesarFacturaCaitlyn, procesarLoteInventario } from '../services/api';
import { Camera } from 'expo-camera';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { getCategoriaNegocio } from '../utils/beauty-helpers';

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
    codigoBarras?: string;
    fechaVencimiento?: string;
    precioVenta?: number;
}

export const useInventario = () => {
    const { user } = useAuth();
    const [items, setItems] = useState<InventarioItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [showMovModal, setShowMovModal] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    // Selection
    const [editItem, setEditItem] = useState<InventarioItem | null>(null);
    const [selectedItem, setSelectedItem] = useState<InventarioItem | null>(null);

    // Movement Form
    const [movTipo, setMovTipo] = useState<'entrada' | 'salida' | 'merma'>('entrada');
    const [movCantidad, setMovCantidad] = useState('');
    const [movMotivo, setMovMotivo] = useState('');
    const [movCosto, setMovCosto] = useState('');

    // Feedback
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Filters & Search
    const [filtro, setFiltro] = useState('todos');

    // Invoice Review
    const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
    const [invoiceMetadata, setInvoiceMetadata] = useState<any>(null);
    const [invoiceBase64, setInvoiceBase64] = useState<string | null>(null);
    const [showInvoiceReview, setShowInvoiceReview] = useState(false);
    const [invoiceFiltro, setInvoiceFiltro] = useState('todos');

    const getInvoiceItemStatus = useCallback((item: any): 'coincide' | 'similar' | 'nuevo' | 'incompleto' => {
        if (!item.nombre || item.nombre.trim() === '' || !item.cantidad || item.cantidad <= 0) {
            return 'incompleto';
        }
        const nombreLower = item.nombre.toLowerCase().trim();
        const exacto = items.find(inv => inv.nombre.toLowerCase().trim() === nombreLower);
        if (exacto) return 'coincide';

        const nombreBase = nombreLower.replace(/s$|es$/, '');
        const similar = items.find(inv => {
            const invLower = inv.nombre.toLowerCase().trim();
            const invBase = invLower.replace(/s$|es$/, '');
            return invLower.includes(nombreBase) || nombreBase.includes(invBase);
        });
        if (similar) return 'similar';
        return 'nuevo';
    }, [items]);

    const invoiceItemsFiltrados = useMemo(() => {
        if (invoiceFiltro === 'todos') return invoiceItems;
        return invoiceItems.filter(item => getInvoiceItemStatus(item) === invoiceFiltro);
    }, [invoiceItems, invoiceFiltro, getInvoiceItemStatus]);

    const invoiceStatusCounts = useMemo(() => {
        const counts = { todos: invoiceItems.length, coincide: 0, similar: 0, nuevo: 0, incompleto: 0 };
        invoiceItems.forEach(item => {
            const status = getInvoiceItemStatus(item);
            counts[status]++;
        });
        return counts;
    }, [invoiceItems, getInvoiceItemStatus]);

    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [unidad, setUnidad] = useState('unidades');
    const [cantidadMinima, setCantidadMinima] = useState('');
    const [costoUnitario, setCostoUnitario] = useState('');
    const [precioVenta, setPrecioVenta] = useState('');

    const categoriaNegocio = useMemo(() => getCategoriaNegocio(user as any), [user]);
    const [categoria, setCategoria] = useState(categoriaNegocio === 'BELLEZA' ? 'insumo' : 'ingrediente');

    useEffect(() => {
        if (!editItem) setCategoria(categoriaNegocio === 'BELLEZA' ? 'insumo' : 'ingrediente');
    }, [categoriaNegocio, editItem]);

    const [proveedor, setProveedor] = useState('');
    const [codigoBarras, setCodigoBarras] = useState('');
    const [fechaVencimiento, setFechaVencimiento] = useState('');

    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [scannerZoom, setScannerZoom] = useState(0);
    const [tapCoords, setTapCoords] = useState<{ x: number, y: number } | null>(null);
    const [searchingGlobal, setSearchingGlobal] = useState(false);

    const scannerSettings = useMemo(() => ({
        barcodeTypes: ["ean13", "ean8", "qr", "upc_a", "upc_e", "code128", "code39"] as any[],
    }), []);

    const [smartText, setSmartText] = useState('');
    const [isListening, setIsListening] = useState(false);

    useSpeechRecognitionEvent("start", () => setIsListening(true));
    useSpeechRecognitionEvent("end", () => setIsListening(false));
    useSpeechRecognitionEvent("result", (event) => {
        setSmartText(event.results[0]?.transcript || '');
    });
    useSpeechRecognitionEvent("error", (event) => {
        console.warn("Speech error:", event);
        setIsListening(false);
    });

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

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
    }, [filtro, user?.negocioActivo]);

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
        setPrecioVenta('');
        setProveedor('');
        setCodigoBarras('');
        setFechaVencimiento('');
        setCategoria(categoriaNegocio === 'BELLEZA' ? 'insumo' : 'ingrediente');
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
        setPrecioVenta(item.precioVenta?.toString() || '');
        setCategoria(item.categoria);
        setProveedor(item.proveedor || '');
        setCodigoBarras(item.codigoBarras || '');
        setFechaVencimiento(item.fechaVencimiento ? item.fechaVencimiento.split('T')[0] : '');
        setShowModal(true);
    };

    const buscarPorCodigoBarras = useCallback(async (code: string) => {
        const localItem = items.find(i => i.codigoBarras === code);
        if (localItem) {
            setSelectedItem(localItem);
            setMovTipo('entrada');
            setMovCantidad('');
            setMovMotivo('Compra/Escaneo');
            setMovCosto(localItem.costoUnitario?.toString() || '');
            setShowMovModal(true);
            return;
        }
        resetForm();
        setCodigoBarras(code);
        setShowModal(true);
        setSearchingGlobal(true);
        try {
            const response = await lookupProducto(code);
            const { isLocal, producto } = response.data;
            if (isLocal && producto) {
                setShowModal(false);
                setSelectedItem(producto);
                setShowMovModal(true);
            } else if (producto && producto.nombre) {
                setNombre(producto.nombre);
                setDescripcion(producto.descripcion || '');
                setCategoria(producto.categoria || 'ingrediente');
            }
        } catch (err) {
            console.warn("Error en lookup global", err);
        } finally {
            setSearchingGlobal(false);
        }
    }, [items]);

    const handleBarCodeScanned = useCallback((data: string) => {
        setScanned(true);
        setShowScanner(false);
        buscarPorCodigoBarras(data);
    }, [buscarPorCodigoBarras]);

    const openScanner = () => {
        setScanned(false);
        setShowScanner(true);
    };

    const handleScannerTap = (event: any) => {
        const { locationX, locationY } = event.nativeEvent;
        setTapCoords({ x: locationX, y: locationY });
        setScannerZoom(0.1);
        setTimeout(() => {
            setScannerZoom(0);
            setTapCoords(null);
        }, 300);
    };

    const requestCameraPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
    };

    const handleSubmit = async () => {
        const parsedCosto = parseFloat(costoUnitario);
        if (!nombre || isNaN(parsedCosto)) {
            setError('Ingresa el nombre y un costo unitario válido');
            return;
        }
        setLoading(true);
        try {
            const formatToISO = (dateStr: string) => {
                if (!dateStr || !dateStr.includes('/')) return dateStr;
                const [day, month, year] = dateStr.split('/');
                if (day && month && year) return `${year}-${month}-${day}`;
                return dateStr;
            };

            const data = {
                nombre, descripcion,
                cantidad: parseFloat(cantidad) || 0,
                unidad,
                cantidadMinima: parseFloat(cantidadMinima) || 0,
                costoUnitario: parseFloat(costoUnitario),
                precioVenta: precioVenta ? parseFloat(precioVenta) : undefined,
                categoria, proveedor, codigoBarras,
                fechaVencimiento: fechaVencimiento ? formatToISO(fechaVencimiento) : undefined
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

    const openMovModal = (item: InventarioItem, tipo: 'entrada' | 'salida' | 'merma') => {
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
            const parsedCantidad = parseFloat(movCantidad);
            const parsedCosto = parseFloat(movCosto);
            if (movTipo === 'entrada') {
                await registrarEntrada(selectedItem._id, { cantidad: parsedCantidad, costoTotal: !isNaN(parsedCosto) ? parsedCosto : undefined, motivo: movMotivo });
            } else if (movTipo === 'salida') {
                await registrarSalida(selectedItem._id, { cantidad: parsedCantidad, motivo: movMotivo });
            } else if (movTipo === 'merma') {
                await registrarMerma(selectedItem._id, { cantidad: parsedCantidad, motivo: movMotivo });
            }
            setSuccess(`${movTipo.charAt(0).toUpperCase() + movTipo.slice(1)} registrada`);
            setShowMovModal(false);
            cargarInventario();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al registrar movimiento');
        } finally {
            setLoading(false);
        }
    };

    const handleImportCsv = async (file: any) => {
        setLoading(true);
        try {
            const formData = new FormData();
            if (file.file) {
                formData.append('archivo', file.file);
            } else if (file.uri) {
                formData.append('archivo', { uri: file.uri, name: file.name || 'inventario.csv', type: file.mimeType || 'text/csv' } as any);
            } else {
                formData.append('archivo', file);
            }
            const response = await importarInventario(formData);
            setSuccess(`Importación lista. Nuevos: ${response.data.detalles.creados}, Actualizados: ${response.data.detalles.actualizados}`);
            cargarInventario();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al importar CSV');
        } finally {
            setLoading(false);
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
                copyToCacheDirectory: true
            });
            if (result.canceled) return;
            handleImportCsv(result.assets[0]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCaitlynInvoice = async (base64: string) => {
        setIsAnalyzing(true);
        try {
            setInvoiceBase64(base64);
            const response = await procesarFacturaCaitlyn(base64);
            const { items: detectedItems, metadata } = response.data;
            if ((detectedItems && detectedItems.length > 0) || metadata) {
                setInvoiceItems(detectedItems || []);
                setInvoiceMetadata(metadata || null);
                setShowInvoiceReview(true);
                setSuccess(metadata?.proveedor ? `Caitlyn detectó factura de ${metadata.proveedor}` : 'Factura analizada.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al procesar factura');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleConfirmInvoiceItems = async (itemsToRegister: any[]) => {
        setLoading(true);
        try {
            const response = await procesarLoteInventario({ items: itemsToRegister, imagen: invoiceBase64 || undefined, metadata: invoiceMetadata });
            const { creados, actualizados } = response.data.detalles;
            setSuccess(`Carga completada. ${creados} nuevos, ${actualizados} actualizados.`);
            setShowInvoiceReview(false);
            setInvoiceBase64(null);
            setInvoiceMetadata(null);
            cargarInventario();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar items');
        } finally {
            setLoading(false);
        }
    };

    const tomarFotoFactura = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') return setError('Permiso de cámara denegado');
            const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8, base64: true });
            if (!result.canceled && result.assets[0].base64) handleCaitlynInvoice(`data:image/jpeg;base64,${result.assets[0].base64}`);
        } catch (err) {
            setError('Error al capturar foto');
        }
    };

    const seleccionarImagenGaleria = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') return setError('Permiso de galería denegado');
            const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8, base64: true });
            if (!result.canceled && result.assets[0].base64) handleCaitlynInvoice(`data:image/jpeg;base64,${result.assets[0].base64}`);
        } catch (err) {
            setError('Error al seleccionar imagen');
        }
    };

    const startListening = async () => {
        if (isListening) return ExpoSpeechRecognitionModule.stop();
        const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!granted) return setError('Permiso de micrófono denegado');
        try {
            ExpoSpeechRecognitionModule.start({ lang: "es-ES", interimResults: true, maxAlternatives: 1 });
        } catch (err) {
            setError('Error al iniciar micrófono');
            setIsListening(false);
        }
    };

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
        return (precio !== null || isSalida) ? { cantidad: "1", unidad: "unidades", nombre: cleanText, precio, isSalida } : null;
    };

    const normalizeUnit = (u: string = '') => {
        const unit = u.toLowerCase();
        if (['kg', 'kilo', 'kilos', 'kilogramo', 'kilogramos'].includes(unit)) return 'kg';
        if (['lb', 'libra', 'libras'].includes(unit)) return 'lb';
        if (['l', 'litro', 'litros'].includes(unit)) return 'litros';
        if (['ml', 'mililitro', 'mililitros'].includes(unit)) return 'ml';
        if (['g', 'gramo', 'gramos'].includes(unit)) return 'gramos';
        return 'unidades';
    };

    const findSmartMatch = (searchName: string) => {
        const cleanName = searchName.toLowerCase().trim();
        const baseName = cleanName.replace(/es$|s$/, '');
        return items.find(item => {
            const itemName = item.nombre.toLowerCase();
            const itemBase = itemName.replace(/es$|s$/, '');
            return itemName === cleanName || itemBase === baseName || itemName.includes(baseName) || baseName.includes(itemBase);
        });
    };

    const handleSmartAction = async () => {
        if (!smartText) return;
        const parsed = parseSmartInput(smartText);

        if (!parsed) {
            const existing = findSmartMatch(smartText);
            if (existing) {
                openMovModal(existing, 'entrada');
            } else {
                resetForm();
                setNombre(smartText.charAt(0).toUpperCase() + smartText.slice(1));
                setShowModal(true);
            }
            setSmartText('');
            return;
        }

        const { cantidad: qtyRes, unidad: unitRes, nombre: rawNombre, precio, isSalida } = parsed;
        const itemName = rawNombre.trim();
        const existing = findSmartMatch(itemName);
        const qty = parseFloat(qtyRes);

        if (existing) {
            let costoTotal = precio ? precio * qty : existing.costoUnitario * qty;
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
            setUnidad(normalizeUnit(unitRes));
            setCantidadMinima('1');
            if (precio) setCostoUnitario(precio.toString());
            setShowModal(true);
        }
        setSmartText('');
    };

    const clearError = () => setError('');
    const clearSuccess = () => setSuccess('');

    return {
        items, loading, refreshing, error, success, isAnalyzing, clearError, clearSuccess,
        itemsFiltrados: items.filter(i => !smartText || i.nombre.toLowerCase().includes(smartText.toLowerCase())),
        showModal, setShowModal, showMovModal, setShowMovModal, showScanner, setShowScanner,
        showInvoiceReview, setShowInvoiceReview, invoiceItems, setInvoiceItems,
        invoiceMetadata, setInvoiceMetadata,
        invoiceFiltro, setInvoiceFiltro, invoiceItemsFiltrados, invoiceStatusCounts, getInvoiceItemStatus,
        editItem, selectedItem, movTipo, setMovTipo, movCantidad, setMovCantidad,
        movMotivo, setMovMotivo, movCosto, setMovCosto,
        filtro, setFiltro, smartText, setSmartText,
        nombre, setNombre, descripcion, setDescripcion,
        cantidad, setCantidad, unidad, setUnidad,
        cantidadMinima, setCantidadMinima, costoUnitario, setCostoUnitario,
        precioVenta, setPrecioVenta,
        categoria, setCategoria, proveedor, setProveedor,
        codigoBarras, setCodigoBarras, fechaVencimiento, setFechaVencimiento,
        hasPermission, scanned, scannerZoom, tapCoords, scannerSettings, isListening, searchingGlobal,
        handleRefresh, resetForm, openEditModal, handleSubmit, handleDelete,
        openMovModal, handleMovimiento, handleSmartAction,
        handleBarCodeScanned, openScanner, handleScannerTap, requestCameraPermission,
        pickDocument, startListening, tomarFotoFactura, seleccionarImagenGaleria, handleConfirmInvoiceItems
    };
};
