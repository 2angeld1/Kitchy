import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { getProductos, createVenta, updateVenta, getVentas, procesarCuadernoVentas } from '../services/api';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';

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
    completada?: boolean;
    completadoEn?: string; // ISO date string
    creadoEn?: string; // ISO date string - para auto-cierre al cambiar de día
    pagoCombinado?: { metodo: string; monto: number }[];
    _idDB?: string;
    telefono?: string;
}

export const useVentas = () => {
    const { user } = useAuth();
    const [productos, setProductos] = useState<Producto[]>([]);
    const [ordenes, setOrdenes] = useState<Orden[]>([
        { id: Date.now().toString(), nombre: 'Pedido 1', items: [], cliente: '', metodoPago: 'efectivo', creadoEn: new Date().toISOString() }
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
    const pagoCombinado = activeOrder.pagoCombinado || [];
    const cliente = activeOrder.cliente;
    const telefono = activeOrder.telefono || '';

    // UI State
    const [showModal, setShowModal] = useState(false);
    const [showHistorial, setShowHistorial] = useState(false);
    const [showOrderSelector, setShowOrderSelector] = useState(false);
    const [montoRecibido, setMontoRecibido] = useState<string>('');
    const [highlightVentaId, setHighlightVentaId] = useState<string | null>(null);

    // Notebook State
    const [isAnalyzingNotebook, setIsAnalyzingNotebook] = useState(false);
    const [notebookVentas, setNotebookVentas] = useState<any[]>([]);
    const [showNotebookModal, setShowNotebookModal] = useState(false);

    // Filters
    const [busqueda, setBusqueda] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');

    // Helper: obtener la fecha actual en zona horaria de Panamá (America/Panama = EST, UTC-5)
    const getFechaPanama = (date: Date = new Date()): string => {
        return date.toLocaleDateString('en-CA', { timeZone: 'America/Panama' }); // formato YYYY-MM-DD
    };

    // Auto-cierre de pedidos pendientes del día anterior
    const autoCerrarPedidosDelDiaAnterior = async (ordenesOriginales: Orden[]): Promise<Orden[]> => {
        const hoyPanama = getFechaPanama();
        const pendientesDeAyer: Orden[] = [];
        let restoLimpiado: Orden[] = [];

        // 1. Filtrar los pedidos
        for (const o of ordenesOriginales) {
            if (!o.completada && o.creadoEn) {
                const diaPanamaOrden = getFechaPanama(new Date(o.creadoEn));
                if (diaPanamaOrden < hoyPanama) {
                    if (o.items.length > 0) {
                        pendientesDeAyer.push(o); // Tiene items: agendar para cobrar
                    }
                    // Si NO tiene items y es de ayer, lo saltamos (desaparece porque no entra a restoLimpiado)
                    continue;
                }
            }
            restoLimpiado.push(o);
        }

        if (pendientesDeAyer.length === 0) return restoLimpiado; // Retornamos los limpiados aunque no haya que cobrar

        console.log(`[Auto-Cierre] ${pendientesDeAyer.length} pedido(s) del día anterior detectados. Procesando...`);

        // Insertamos nuevamente los que vamos a auto-completar en el array base
        const ordenesActualizadas = [...restoLimpiado, ...pendientesDeAyer];

        for (const orden of pendientesDeAyer) {
            try {
                const items = orden.items.map(item => ({
                    productoId: item.producto._id,
                    nombre: item.producto.nombre,
                    precio: item.producto.precio,
                    cantidad: item.cantidad
                }));

                const response = await createVenta({
                    items,
                    metodoPago: orden.metodoPago || 'efectivo',
                    cliente: orden.cliente || ''
                });

                const dbId = response.data.venta?._id || response.data._id;
                const totalFinal = orden.items.reduce((sum, item) => sum + (Number(item.producto.precio) * item.cantidad), 0);

                // Marcar como completada en el array
                const idx = ordenesActualizadas.findIndex(o => o.id === orden.id);
                if (idx !== -1) {
                    ordenesActualizadas[idx] = {
                        ...ordenesActualizadas[idx],
                        completada: true,
                        completadoEn: new Date().toISOString(),
                        _idDB: dbId,
                        nombre: orden.cliente?.trim()
                            ? `${orden.cliente.trim()} - $${totalFinal.toFixed(2)} (auto)`
                            : `${orden.nombre} - $${totalFinal.toFixed(2)} (auto)`
                    };
                }

                console.log(`[Auto-Cierre] ✅ Pedido "${orden.nombre}" procesado como venta exitosa ($${totalFinal.toFixed(2)})`);
            } catch (err: any) {
                console.error(`[Auto-Cierre] ❌ Error al procesar pedido "${orden.nombre}":`, err.message);
                // Si falla, lo dejamos como estaba (no lo borramos)
            }
        }

        // Toast de resumen
        const completados = ordenesActualizadas.filter(o =>
            pendientesDeAyer.some(p => p.id === o.id) && o.completada
        ).length;

        if (completados > 0) {
            Toast.show({
                type: 'success',
                text1: '📋 Cierre Automático',
                text2: `${completados} pedido(s) de ayer se registraron como ventas exitosas`,
                visibilityTime: 5000
            });
        }

        return ordenesActualizadas;
    };

    // Persistencia de Ordenes
    useEffect(() => {
        const cargarOrdenesPersistidas = async () => {
            try {
                const storedValue = await AsyncStorage.getItem('kitchy_ordenes_pendientes');
                const storedActiveId = await AsyncStorage.getItem('kitchy_active_order_id');
                if (storedValue) {
                    let parsed: Orden[] = JSON.parse(storedValue);

                    // Migración: agregar creadoEn a ordenes antiguas que no lo tengan
                    parsed = parsed.map(o => ({
                        ...o,
                        creadoEn: o.creadoEn || new Date().toISOString()
                    }));

                    // 🔄 Auto-cierre: procesar pedidos del día anterior como ventas exitosas
                    parsed = await autoCerrarPedidosDelDiaAnterior(parsed);

                    // Auto-limpieza: eliminar pedidos completados hace más de 24h
                    const ahora = Date.now();
                    const vigentes = parsed.filter(o => {
                        if (!o.completada || !o.completadoEn) return true;
                        const horasDesdeCompletado = (ahora - new Date(o.completadoEn).getTime()) / (1000 * 60 * 60);
                        return horasDesdeCompletado < 24;
                    });
                    if (vigentes.length > 0) {
                        const activas = vigentes.filter(o => !o.completada);

                        if (activas.length === 0) {
                            // Si todas se auto-completaron (o por alguna razón todas son completadas)
                            // Generamos un pedido fresco en blanco para iniciar el día.
                            const nuevoId = Date.now().toString();
                            vigentes.push({
                                id: nuevoId,
                                nombre: 'Pedido 1', // O el conteo que corresponda
                                items: [],
                                cliente: '',
                                metodoPago: 'efectivo',
                                creadoEn: new Date().toISOString()
                            });
                            setOrdenes(vigentes);
                            setActiveOrderId(nuevoId);
                        } else {
                            setOrdenes(vigentes);
                            if (storedActiveId && activas.some(o => o.id === storedActiveId)) {
                                setActiveOrderId(storedActiveId);
                            } else {
                                // Seleccionar la primera orden activa confirmada
                                setActiveOrderId(activas[0].id);
                            }
                        }
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

    const negocioId = useMemo(() => {
        if (!user?.negocioActivo) return null;
        return typeof user.negocioActivo === 'object' ? user.negocioActivo._id : user.negocioActivo;
    }, [user?.negocioActivo]);

    useEffect(() => {
        cargarProductos();
        cargarVentas();

        // Socket para actualizaciones en tiempo real
        let socket: any;
        if (negocioId) {
            const { io } = require('socket.io-client');
            const baseUrl = require('../config/api').default.replace('/api', '');
            
            socket = io(baseUrl, {
                query: { negocioId },
                transports: ['websocket']
            });

            socket.on('dashboard_update', (payload: any) => {
                console.log('💰 Venta o Stock actualizado vía Socket');
                cargarProductos(); // Refrescar disponibilidad
                cargarVentas();    // Refrescar historial
            });
        }

        return () => {
            if (socket) socket.disconnect();
        };
    }, [user?.negocioActivo, negocioId]);

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
            const response = await getVentas({ limit: 50 });
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
        setOrdenes(prev => prev.map(o => o.id === activeOrderId ? { ...o, metodoPago: metodo } : o));
    };

    const setPagoCombinado = (combo: {metodo: string; monto: number}[]) => {
        setOrdenes(prev => prev.map(o => o.id === activeOrderId ? { ...o, pagoCombinado: combo } : o));
    };

    const setCliente = (nombre: string) => {
        setOrdenes(prev => prev.map(o => {
            if (o.id !== activeOrderId) return o;
            // Nombre dinámico: si el usuario pone nombre, el pedido se renombra
            const nuevoNombre = nombre.trim()
                ? `${nombre.trim()}`
                : o.nombre.startsWith('Pedido') ? o.nombre : `Pedido ${ordenes.indexOf(o) + 1}`;
            return { ...o, cliente: nombre, nombre: nuevoNombre };
        }));
    };

    const setTelefono = (tel: string) => {
        setOrdenes(prev => prev.map(o => o.id === activeOrderId ? { ...o, telefono: tel } : o));
    };

    const nuevaOrden = (nombre: string = '') => {
        const id = Date.now().toString();
        const nueva: Orden = {
            id,
            nombre: nombre || `Pedido ${ordenes.length + 1}`,
            items: [],
            cliente: '',
            telefono: '',
            metodoPago: 'efectivo',
            creadoEn: new Date().toISOString()
        };
        setOrdenes([...ordenes, nueva]);
        setActiveOrderId(id);
        Toast.show({ type: 'success', text1: 'Nueva Orden', text2: `Creado: ${nueva.nombre}` });
    };

    const seleccionarOrden = (id: string) => {
        setActiveOrderId(id);
        setShowOrderSelector(false);
    };

    // Estado para modal de confirmación al borrar
    const [ordenAEliminar, setOrdenAEliminar] = useState<Orden | null>(null);

    const pedirConfirmacionEliminar = (id: string) => {
        const ordenesActivas = ordenes.filter(o => !o.completada);
        if (ordenesActivas.length <= 1 && !ordenes.find(o => o.id === id)?.completada) {
            Toast.show({ type: 'info', text1: 'No se puede eliminar', text2: 'Al menos debe haber una orden activa' });
            return;
        }
        const orden = ordenes.find(o => o.id === id);
        if (orden) setOrdenAEliminar(orden);
    };

    const confirmarEliminarOrden = () => {
        if (!ordenAEliminar) return;
        const nuevas = ordenes.filter(o => o.id !== ordenAEliminar.id);
        // Si no quedan ordenes activas, crear una nueva
        const activas = nuevas.filter(o => !o.completada);
        if (activas.length === 0) {
            const nueva: Orden = {
                id: Date.now().toString(),
                nombre: `Pedido 1`,
                items: [],
                cliente: '',
                metodoPago: 'efectivo'
            };
            nuevas.push(nueva);
        }
        setOrdenes(nuevas);
        if (activeOrderId === ordenAEliminar.id) {
            const primeraActiva = nuevas.find(o => !o.completada) || nuevas[0];
            setActiveOrderId(primeraActiva.id);
        }
        setOrdenAEliminar(null);
        Toast.show({ type: 'success', text1: 'Pedido eliminado', text2: 'Recuerda que el historial queda en notificaciones 🔔' });
    };

    const cancelarEliminarOrden = () => {
        setOrdenAEliminar(null);
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

            const existe = o.items.find(item => String(item.producto._id) === String(producto._id));
            if (existe) {
                return {
                    ...o,
                    items: o.items.map(item =>
                        String(item.producto._id) === String(producto._id)
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

            const existe = o.items.find(item => String(item.producto._id) === String(productoId));
            if (existe && existe.cantidad > 1) {
                return {
                    ...o,
                    items: o.items.map(item =>
                        String(item.producto._id) === String(productoId)
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
        return carrito.reduce((sum, item) => {
            const precio = Number(item.producto.precio) || 0;
            const cantidad = Number(item.cantidad) || 0;
            return sum + (precio * cantidad);
        }, 0);
    };

    const cambio = useMemo(() => {
        const total = calcularTotal();
        const recibido = parseFloat(montoRecibido);
        return recibido > total ? recibido - total : 0;
    }, [montoRecibido, carrito]);

    const procesarVenta = async () => {
        if (carrito.length === 0) {
            Toast.show({ type: 'error', text1: 'Carrito vacío', text2: 'Agrega productos primero' });
            return;
        }

        setLoading(true);
        try {
            const items = carrito.map(item => ({
                productoId: item.producto._id,
                nombre: item.producto.nombre,
                precio: item.producto.precio,
                cantidad: item.cantidad
            }));

            const payload = {
                items,
                metodoPago,
                pagoCombinado: metodoPago === 'combinado' ? pagoCombinado : undefined,
                cliente
            };

            let response;
            if (activeOrder._idDB) {
                response = await updateVenta(activeOrder._idDB, payload);
            } else {
                response = await createVenta(payload);
            }

            // Marcar como completada (NO borrar) con el ID real de la base de datos
            const totalFinal = calcularTotal();
            const dbId = response.data.venta?._id || response.data._id;
            
            setOrdenes(ordenes.map(o => {
                if (o.id !== activeOrderId) return o;
                return {
                    ...o,
                    completada: true,
                    completadoEn: new Date().toISOString(),
                    _idDB: dbId,
                    nombre: o.cliente?.trim()
                        ? `${o.cliente.trim()} - $${totalFinal.toFixed(2)}`
                        : `${o.nombre} - $${totalFinal.toFixed(2)}`
                };
            }));

            // Crear nueva orden activa automáticamente
            const nuevoId = Date.now().toString();
            const contadorNuevo = ordenes.filter(o => !o.completada).length + 1;
            const nuevaOrdenAuto: Orden = {
                id: nuevoId,
                nombre: `Pedido ${ordenes.length + 1}`,
                items: [],
                cliente: '',
                metodoPago: 'efectivo',
                creadoEn: new Date().toISOString()
            };
            setOrdenes(prev => [...prev.map(o => {
                if (o.id !== activeOrderId) return o;
                return {
                    ...o,
                    completada: true,
                    completadoEn: new Date().toISOString(),
                    _idDB: dbId,
                    nombre: o.cliente?.trim()
                        ? `${o.cliente.trim()} - $${totalFinal.toFixed(2)}`
                        : `${o.nombre} - $${totalFinal.toFixed(2)}`
                };
            }), nuevaOrdenAuto]);
            setActiveOrderId(nuevoId);

            setMontoRecibido('');
            setShowModal(false);
            // Refrescar historial
            await cargarVentas();
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

    const verDetalleVenta = async (ventaObj: any) => {
        setHighlightVentaId(ventaObj._idDB || ventaObj._id);
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

    // --- Lógica del Cuaderno (Notebook OCR) ---

    const handleProcesarCuaderno = async (base64: string) => {
        setIsAnalyzingNotebook(true);
        try {
            const response = await procesarCuadernoVentas(base64);
            if (response.data.success) {
                setNotebookVentas(response.data.ventas);
                setShowNotebookModal(true);
                Toast.show({ type: 'success', text1: 'Cuaderno analizado', text2: response.data.mensaje });
            } else {
                Toast.show({ type: 'error', text1: 'Error', text2: response.data.error || 'No se pudo leer el cuaderno' });
            }
        } catch (err: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Fallo al conectar con Caitlyn' });
        } finally {
            setIsAnalyzingNotebook(false);
        }
    };

    const tomarFotoCuaderno = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') return Toast.show({ type: 'error', text1: 'Permiso denegado' });
            const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.1, base64: true });
            if (!result.canceled && result.assets[0].base64) handleProcesarCuaderno(`data:image/jpeg;base64,${result.assets[0].base64}`);
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error al capturar foto' });
        }
    };

    const seleccionarImagenCuaderno = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') return Toast.show({ type: 'error', text1: 'Permiso denegado' });
            const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.1, base64: true });
            if (!result.canceled && result.assets[0].base64) handleProcesarCuaderno(`data:image/jpeg;base64,${result.assets[0].base64}`);
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error al seleccionar imagen' });
        }
    };

    const importarVentaNotebook = (venta: any) => {
        const id = Date.now().toString();
        const nueva: Orden = {
            id,
            nombre: venta.cliente || `Pedido ${ordenes.length + 1}`,
            items: (venta.items || []).map((it: any, index: number) => {
                // 🔍 Búsqueda INTELIGENTE por palabras clave
                const itNombre = (it.nombre || "").toLowerCase().trim();
                const palabrasItem = itNombre.split(' ').filter((w: string) => w.length > 2); // Solo palabras significativas
                
                let prod = productos.find(p => p.nombre.toLowerCase() === itNombre); // 1. Match Exacto
                
                if (!prod) {
                    prod = productos.find(p => { // 2. Match por palabras clave
                        const pNombre = p.nombre.toLowerCase();
                        return pNombre.includes(itNombre) || itNombre.includes(pNombre) || 
                               palabrasItem.some((pal: string) => pNombre.includes(pal));
                    });
                }

                return {
                    producto: prod || { 
                        _id: `manual-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`, 
                        nombre: it.nombre, 
                        precio: it.precio || (venta.total / (venta.items?.length || 1)), 
                        categoria: 'comida', 
                        disponible: true 
                    },
                    cantidad: it.cantidad || 1
                };
            }),
            cliente: venta.cliente || '',
            metodoPago: venta.metodoPago || 'efectivo',
            creadoEn: new Date().toISOString()
        };
        setOrdenes([...ordenes, nueva]);
        setActiveOrderId(id);
        Toast.show({ type: 'success', text1: 'Venta Importada', text2: `Se ha creado el pedido para ${nueva.nombre}` });
    };

    const editarVentaHistorica = (ventaObj: any) => {
        const id = Date.now().toString();
        const nuevaOrden: Orden = {
            id,
            nombre: `Editando: ${ventaObj.cliente || 'Venta'}`,
            items: (ventaObj.items || []).map((it: any) => {
                const prod = productos.find(p => p._id === it.producto) || {
                    _id: it.producto || `manual-${Date.now()}`,
                    nombre: it.nombreProducto || it.nombre || 'Producto',
                    precio: it.precioUnitario || 0,
                    categoria: 'comida',
                    disponible: true
                };
                return {
                    producto: prod,
                    cantidad: it.cantidad || 1
                };
            }),
            cliente: ventaObj.cliente || '',
            metodoPago: ventaObj.metodoPago || 'efectivo',
            pagoCombinado: ventaObj.pagoCombinado || undefined,
            _idDB: ventaObj._id,
            creadoEn: new Date().toISOString()
        };
        setOrdenes([...ordenes, nuevaOrden]);
        setActiveOrderId(id);
        setShowHistorial(false);
        Toast.show({ type: 'info', text1: 'Modo Retoque', text2: `Editando venta pasada` });
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
        pagoCombinado, setPagoCombinado,
        cliente, setCliente,
        telefono, setTelefono,
        busqueda, setBusqueda,
        categoriaFiltro, setCategoriaFiltro,
        agregarAlCarrito,
        quitarDelCarrito,
        eliminarDelCarrito,
        calcularTotal,
        procesarVenta,
        abrirHistorial,
        montoRecibido, setMontoRecibido,
        cambio,
        productosFiltrados,
        ordenes,
        activeOrderId,
        activeOrder,
        nuevaOrden,
        seleccionarOrden,
        pedirConfirmacionEliminar,
        confirmarEliminarOrden,
        cancelarEliminarOrden,
        ordenAEliminar,
        showOrderSelector,
        setShowOrderSelector,
        getSugerenciaInteligente,
        isAnalyzingNotebook,
        notebookVentas,
        showNotebookModal,
        setShowNotebookModal,
        tomarFotoCuaderno,
        seleccionarImagenCuaderno,
        importarVentaNotebook,
        editarVentaHistorica,
        verDetalleVenta,
        highlightVentaId,
        setHighlightVentaId
    };
};
