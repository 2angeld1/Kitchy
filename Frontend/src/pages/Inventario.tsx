import React from 'react';
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
import { useInventario } from '../hooks/useInventario';
import { useAuth } from '../context/AuthContext';

const Inventario: React.FC = () => {
    const {
        loading,
        error,
        success,
        clearError,
        clearSuccess,
        itemsFiltrados,
        showModal,
        setShowModal,
        showMovModal,
        setShowMovModal,
        editItem,
        selectedItem,
        movTipo,
        movCantidad,
        setMovCantidad,
        movMotivo,
        setMovMotivo,
        movCosto,
        setMovCosto,
        busqueda,
        setBusqueda,
        filtro,
        setFiltro,
        nombre,
        setNombre,
        descripcion,
        setDescripcion,
        cantidad,
        setCantidad,
        unidad,
        setUnidad,
        cantidadMinima,
        setCantidadMinima,
        costoUnitario,
        setCostoUnitario,
        categoria,
        setCategoria,
        proveedor,
        setProveedor,
        handleRefresh,
        resetForm,
        openEditModal,
        handleSubmit,
        handleDelete,
        openMovModal,
        handleMovimiento
    } = useInventario();

    const { isAdmin } = useAuth();

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
                <IonToast isOpen={!!error} message={error} duration={3000} color="danger" onDidDismiss={clearError} />
                <IonToast isOpen={!!success} message={success} duration={2000} color="success" onDidDismiss={clearSuccess} />
            </IonContent>
        </IonPage>
    );
};

export default Inventario;
