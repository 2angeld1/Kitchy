import React, { useState, useEffect } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonButton,
    IonIcon,
    IonFab,
    IonFabButton,
    IonModal,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonLoading,
    IonToast,
    IonSearchbar,
    IonButtons,
    IonMenuButton,
    IonRefresher,
    IonRefresherContent,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonSegment,
    IonSegmentButton,
    IonCard,
    IonCardContent
} from '@ionic/react';
import { add, cube, arrowDown, arrowUp, trash, create } from 'ionicons/icons';
import { getInventario, createInventario, updateInventario, deleteInventario, registrarEntrada, registrarSalida, getStockBajo } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface InventarioItem {
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

const Inventario: React.FC = () => {
    const [items, setItems] = useState<InventarioItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showMovModal, setShowMovModal] = useState(false);
    const [editItem, setEditItem] = useState<InventarioItem | null>(null);
    const [selectedItem, setSelectedItem] = useState<InventarioItem | null>(null);
    const [movTipo, setMovTipo] = useState<'entrada' | 'salida'>('entrada');
    const [movCantidad, setMovCantidad] = useState('');
    const [movMotivo, setMovMotivo] = useState('');
    const [movCosto, setMovCosto] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [filtro, setFiltro] = useState('todos');
    const { isAdmin } = useAuth();

    // Form state
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

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Inventario</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                <div className="inventario-container">
                    <IonSearchbar
                        value={busqueda}
                        onIonInput={(e) => setBusqueda(e.detail.value || '')}
                        placeholder="Buscar..."
                        className="search-bar"
                    />

                    <IonSegment value={filtro} onIonChange={(e) => setFiltro(e.detail.value as string)}>
                        <IonSegmentButton value="todos">Todos</IonSegmentButton>
                        <IonSegmentButton value="stockBajo">Stock Bajo</IonSegmentButton>
                        <IonSegmentButton value="ingrediente">Ingredientes</IonSegmentButton>
                    </IonSegment>

                    <IonList>
                        {itemsFiltrados.map(item => (
                            <IonItemSliding key={item._id}>
                                <IonItem>
                                    <IonIcon icon={cube} slot="start" color="primary" />
                                    <IonLabel>
                                        <h2>{item.nombre}</h2>
                                        <p>{item.categoria} • {item.proveedor || 'Sin proveedor'}</p>
                                    </IonLabel>
                                    <div className="item-stock" slot="end">
                                        <span className={`cantidad ${item.cantidad <= item.cantidadMinima ? 'bajo' : ''}`}>
                                            {item.cantidad} {item.unidad}
                                        </span>
                                        {item.cantidad <= item.cantidadMinima && (
                                            <IonBadge color="warning">Bajo</IonBadge>
                                        )}
                                    </div>
                                </IonItem>
                                <IonItemOptions side="end">
                                    <IonItemOption color="success" onClick={() => openMovModal(item, 'entrada')}>
                                        <IonIcon icon={arrowDown} slot="icon-only" />
                                    </IonItemOption>
                                    <IonItemOption color="warning" onClick={() => openMovModal(item, 'salida')}>
                                        <IonIcon icon={arrowUp} slot="icon-only" />
                                    </IonItemOption>
                                    <IonItemOption color="primary" onClick={() => openEditModal(item)}>
                                        <IonIcon icon={create} slot="icon-only" />
                                    </IonItemOption>
                                    {isAdmin && (
                                        <IonItemOption color="danger" onClick={() => handleDelete(item._id)}>
                                            <IonIcon icon={trash} slot="icon-only" />
                                        </IonItemOption>
                                    )}
                                </IonItemOptions>
                            </IonItemSliding>
                        ))}
                    </IonList>

                    {itemsFiltrados.length === 0 && !loading && (
                        <div className="empty-state">
                            <IonIcon icon={cube} />
                            <p>No hay items en el inventario</p>
                        </div>
                    )}
                </div>

                {/* Modal Crear/Editar */}
                <IonModal isOpen={showModal} onDidDismiss={() => { setShowModal(false); resetForm(); }}>
                        <IonHeader>
                            <IonToolbar>
                                <IonTitle>{editItem ? 'Editar' : 'Nuevo'} Item</IonTitle>
                                <IonButtons slot="end">
                                    <IonButton onClick={() => { setShowModal(false); resetForm(); }}>Cerrar</IonButton>
                                </IonButtons>
                            </IonToolbar>
                        </IonHeader>
                        <IonContent className="ion-padding">
                            <IonList>
                                <IonItem>
                                    <IonInput label="Nombre *" value={nombre} onIonInput={(e) => setNombre(e.detail.value || '')} />
                                </IonItem>
                                <IonItem>
                                    <IonInput label="Descripción" value={descripcion} onIonInput={(e) => setDescripcion(e.detail.value || '')} />
                                </IonItem>
                                <IonItem>
                                    <IonInput label="Cantidad" type="number" value={cantidad} onIonInput={(e) => setCantidad(e.detail.value || '')} />
                                </IonItem>
                                <IonItem>
                                    <IonSelect label="Unidad" value={unidad} onIonChange={(e) => setUnidad(e.detail.value)}>
                                        <IonSelectOption value="unidades">Unidades</IonSelectOption>
                                        <IonSelectOption value="kg">Kilogramos</IonSelectOption>
                                        <IonSelectOption value="lb">Libras</IonSelectOption>
                                        <IonSelectOption value="litros">Litros</IonSelectOption>
                                        <IonSelectOption value="gramos">Gramos</IonSelectOption>
                                        <IonSelectOption value="ml">Mililitros</IonSelectOption>
                                    </IonSelect>
                                </IonItem>
                                <IonItem>
                                    <IonInput label="Stock Mínimo" type="number" value={cantidadMinima} onIonInput={(e) => setCantidadMinima(e.detail.value || '')} />
                                </IonItem>
                                <IonItem>
                                    <IonInput label="Costo Unitario *" type="number" value={costoUnitario} onIonInput={(e) => setCostoUnitario(e.detail.value || '')} />
                                </IonItem>
                                <IonItem>
                                    <IonSelect label="Categoría" value={categoria} onIonChange={(e) => setCategoria(e.detail.value)}>
                                        <IonSelectOption value="ingrediente">Ingrediente</IonSelectOption>
                                        <IonSelectOption value="insumo">Insumo</IonSelectOption>
                                        <IonSelectOption value="empaque">Empaque</IonSelectOption>
                                        <IonSelectOption value="otro">Otro</IonSelectOption>
                                    </IonSelect>
                                </IonItem>
                                <IonItem>
                                    <IonInput label="Proveedor" value={proveedor} onIonInput={(e) => setProveedor(e.detail.value || '')} />
                                </IonItem>
                            </IonList>
                            <IonButton expand="block" onClick={handleSubmit} className="ion-margin-top">
                                {editItem ? 'Actualizar' : 'Crear'}
                            </IonButton>
                        </IonContent>
                    </IonModal>


                {/* Modal Movimiento */}
                <IonModal isOpen={showMovModal} onDidDismiss={() => setShowMovModal(false)}>
                    <IonHeader>
                        <IonToolbar color={movTipo === 'entrada' ? 'success' : 'warning'}>
                            <IonTitle>{movTipo === 'entrada' ? 'Registrar Entrada' : 'Registrar Salida'}</IonTitle>
                            <IonButtons slot="end">
                                <IonButton onClick={() => setShowMovModal(false)}>Cerrar</IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent className="ion-padding">
                        {selectedItem && (
                            <IonCard>
                                <IonCardContent>
                                    <h2>{selectedItem.nombre}</h2>
                                    <p>Stock actual: {selectedItem.cantidad} {selectedItem.unidad}</p>
                                </IonCardContent>
                            </IonCard>
                        )}
                        <IonList>
                            <IonItem>
                                <IonInput
                                    label="Cantidad *"
                                    type="number"
                                    value={movCantidad}
                                    onIonInput={(e) => setMovCantidad(e.detail.value || '')}
                                />
                            </IonItem>
                            {movTipo === 'entrada' && (
                                <IonItem>
                                    <IonInput
                                        label="Costo Total"
                                        type="number"
                                        value={movCosto}
                                        onIonInput={(e) => setMovCosto(e.detail.value || '')}
                                    />
                                </IonItem>
                            )}
                            <IonItem>
                                <IonInput
                                    label="Motivo"
                                    value={movMotivo}
                                    onIonInput={(e) => setMovMotivo(e.detail.value || '')}
                                    placeholder={movTipo === 'entrada' ? 'Ej: Compra semanal' : 'Ej: Uso diario'}
                                />
                            </IonItem>
                        </IonList>
                        <IonButton
                            expand="block"
                            color={movTipo === 'entrada' ? 'success' : 'warning'}
                            onClick={handleMovimiento}
                            className="ion-margin-top"
                        >
                            <IonIcon icon={movTipo === 'entrada' ? arrowDown : arrowUp} slot="start" />
                            Registrar {movTipo === 'entrada' ? 'Entrada' : 'Salida'}
                        </IonButton>
                    </IonContent>
                </IonModal>

                {/* FAB para agregar */}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => { resetForm(); setShowModal(true); }}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>


                <IonLoading isOpen={loading} message="Cargando..." />
                <IonToast isOpen={!!error} message={error} duration={3000} color="danger" onDidDismiss={() => setError('')} />
                <IonToast isOpen={!!success} message={success} duration={2000} color="success" onDidDismiss={() => setSuccess('')} />
            </IonContent>
        </IonPage>
    );
};

export default Inventario;
