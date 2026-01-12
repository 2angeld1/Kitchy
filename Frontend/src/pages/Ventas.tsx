import React, { useState, useEffect } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonBadge,
    IonItem,
    IonLabel,
    IonList,
    IonFab,
    IonFabButton,
    IonModal,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonLoading,
    IonToast,
    IonSearchbar,
    IonChip,
    IonButtons,
    IonMenuButton,
    IonRefresher,
    IonRefresherContent
} from '@ionic/react';
import { add, cart, remove, checkmark, trash, receiptOutline, timeOutline } from 'ionicons/icons';
import { getProductos, createVenta, getVentas } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Producto {
    _id: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    categoria: string;
    disponible: boolean;
    imagen?: string;
}

interface ItemCarrito {
    producto: Producto;
    cantidad: number;
}

interface Venta {
    _id: string;
    items: any[];
    total: number;
    metodoPago: string;
    cliente?: string;
    createdAt: string;
}

const Ventas: React.FC = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showHistorial, setShowHistorial] = useState(false);
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [cliente, setCliente] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    const { user } = useAuth();

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

    const categorias = ['comida', 'bebida', 'postre', 'otro'];

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Punto de Venta</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={abrirHistorial} className="history-btn">
                            <IonIcon icon={timeOutline} />
                        </IonButton>
                        <IonButton onClick={() => setShowModal(true)}>
                            <IonIcon icon={cart} />
                            {carrito.length > 0 && (
                                <IonBadge color="primary">{carrito.reduce((sum, i) => sum + i.cantidad, 0)}</IonBadge>
                            )}
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                <div className="ventas-container">
                    <IonSearchbar
                        value={busqueda}
                        onIonInput={(e) => setBusqueda(e.detail.value || '')}
                        placeholder="Buscar producto..."
                        className="search-bar"
                    />

                    <div className="categorias-chips">
                        <IonChip
                            color={!categoriaFiltro ? 'primary' : 'medium'}
                            onClick={() => setCategoriaFiltro('')}
                        >
                            Todos
                        </IonChip>
                        {categorias.map(cat => (
                            <IonChip
                                key={cat}
                                color={categoriaFiltro === cat ? 'primary' : 'medium'}
                                onClick={() => setCategoriaFiltro(cat)}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </IonChip>
                        ))}
                    </div>

                    {productosFiltrados.length === 0 ? (
                        <div className="empty-products">
                            <IonIcon icon={cart} />
                            <p>No hay productos disponibles</p>
                        </div>
                    ) : (
                        <div className="productos-grid">
                            {productosFiltrados.map(producto => (
                                <IonCard className="producto-card" key={producto._id} onClick={() => agregarAlCarrito(producto)}>
                                    <IonCardContent>
                                        <div className="producto-image-container">
                                            {producto.imagen ? (
                                                <img src={producto.imagen} alt={producto.nombre} className="producto-imagen-card" />
                                            ) : (
                                                <div className="producto-emoji">
                                                    {producto.categoria === 'comida' ? '🍔' :
                                                        producto.categoria === 'bebida' ? '🥤' :
                                                            producto.categoria === 'postre' ? '🍰' : '📦'}
                                                </div>
                                            )}
                                        </div>
                                        <h3>{producto.nombre}</h3>
                                        {producto.descripcion && <p className="producto-descripcion">{producto.descripcion}</p>}
                                        <p className="precio">${producto.precio.toFixed(2)}</p>
                                        <IonButton size="small" fill="solid" color="primary">
                                            <IonIcon icon={add} />
                                        </IonButton>
                                    </IonCardContent>
                                </IonCard>
                            ))}
                        </div>
                    )}
                </div>

                {/* Carrito Modal */}
                <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle>Carrito</IonTitle>
                            <IonButtons slot="end">
                                <IonButton onClick={() => setShowModal(false)}>Cerrar</IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent>
                        {carrito.length === 0 ? (
                            <div className="carrito-vacio">
                                <IonIcon icon={cart} />
                                <p>El carrito está vacío</p>
                            </div>
                        ) : (
                            <>
                                <IonList className="carrito-list">
                                    {carrito.map(item => (
                                        <IonItem key={item.producto._id}>
                                            <IonLabel>
                                                <h2>{item.producto.nombre}</h2>
                                                {item.producto.descripcion && <p className="item-descripcion">{item.producto.descripcion}</p>}
                                                <p>${item.producto.precio.toFixed(2)} c/u</p>
                                            </IonLabel>
                                            <div className="cantidad-controls" slot="end">
                                                <IonButton fill="clear" size="small" onClick={() => quitarDelCarrito(item.producto._id)}>
                                                    <IonIcon icon={remove} />
                                                </IonButton>
                                                <span>{item.cantidad}</span>
                                                <IonButton fill="clear" size="small" onClick={() => agregarAlCarrito(item.producto)}>
                                                    <IonIcon icon={add} />
                                                </IonButton>
                                                <IonButton fill="clear" size="small" color="danger" onClick={() => eliminarDelCarrito(item.producto._id)}>
                                                    <IonIcon icon={trash} />
                                                </IonButton>
                                            </div>
                                            <IonLabel slot="end" className="item-total">
                                                ${(item.producto.precio * item.cantidad).toFixed(2)}
                                            </IonLabel>
                                        </IonItem>
                                    ))}
                                </IonList>

                                <div className="carrito-footer">
                                    <div className="carrito-form">
                                        <IonInput
                                            value={cliente}
                                            onIonInput={(e) => setCliente(e.detail.value || '')}
                                            label="Cliente (opcional)"
                                            labelPlacement="floating"
                                            fill="outline"
                                        />

                                        <IonSelect 
                                            value={metodoPago} 
                                            onIonChange={(e) => setMetodoPago(e.detail.value)}
                                            label="Método de Pago"
                                            labelPlacement="floating"
                                            fill="outline"
                                        >
                                            <IonSelectOption value="efectivo">Efectivo</IonSelectOption>
                                            <IonSelectOption value="yappy">Yappy</IonSelectOption>
                                        </IonSelect>
                                    </div>

                                    <div className="total-container">
                                        <p className="total-label">Total a pagar</p>
                                        <h2>${calcularTotal().toFixed(2)}</h2>
                                    </div>

                                    <IonButton expand="block" onClick={procesarVenta} className="procesar-btn">
                                        <IonIcon icon={checkmark} slot="start" />
                                        Procesar Venta
                                    </IonButton>
                                </div>
                            </>
                        )}
                    </IonContent>
                </IonModal>

                {/* Historial Modal */}
                <IonModal isOpen={showHistorial} onDidDismiss={() => setShowHistorial(false)}>
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle>Últimas Ventas</IonTitle>
                            <IonButtons slot="end">
                                <IonButton onClick={() => setShowHistorial(false)}>Cerrar</IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent>
                        <IonList>
                            {ventas.map(venta => (
                                <IonItem key={venta._id}>
                                    <IonLabel>
                                        <h2>${venta.total.toFixed(2)}</h2>
                                        <p>{venta.cliente || 'Cliente general'} • {venta.metodoPago}</p>
                                        <p>{new Date(venta.createdAt).toLocaleString()}</p>
                                    </IonLabel>
                                    <IonBadge slot="end" color="success">
                                        {venta.items.length} items
                                    </IonBadge>
                                </IonItem>
                            ))}
                        </IonList>
                    </IonContent>
                </IonModal>

                {/* FAB para ver carrito */}
                {carrito.length > 0 && !showModal && (
                    <IonFab vertical="bottom" horizontal="end" slot="fixed">
                        <IonFabButton onClick={() => setShowModal(true)}>
                            <IonIcon icon={cart} />
                        </IonFabButton>
                    </IonFab>
                )}

                <IonLoading isOpen={loading} message="Cargando..." />
                <IonToast isOpen={!!error} message={error} duration={3000} color="danger" onDidDismiss={() => setError('')} />
                <IonToast isOpen={!!success} message={success} duration={3000} color="success" onDidDismiss={() => setSuccess('')} />
            </IonContent>
        </IonPage>
    );
};

export default Ventas;
