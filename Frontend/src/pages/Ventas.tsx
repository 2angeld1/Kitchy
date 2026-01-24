import React from 'react';
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
import { optimizeImageUrl } from '../utils/imageUtils';
import { useVentas } from '../hooks/useVentas';

const Ventas: React.FC = () => {
    const {
        carrito,
        ventas,
        loading,
        showModal,
        setShowModal,
        showHistorial,
        setShowHistorial,
        metodoPago,
        setMetodoPago,
        cliente,
        setCliente,
        error,
        clearError,
        success,
        clearSuccess,
        busqueda,
        setBusqueda,
        categoriaFiltro,
        setCategoriaFiltro,
        handleRefresh,
        agregarAlCarrito,
        quitarDelCarrito,
        eliminarDelCarrito,
        calcularTotal,
        procesarVenta,
        abrirHistorial,
        productosFiltrados
    } = useVentas();

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
                                {productosFiltrados.map(producto => {
                                    return (
                                <IonCard className="producto-card" key={producto._id} onClick={() => agregarAlCarrito(producto)}>
                                    <IonCardContent>
                                        <div className="producto-image-container">
                                            {producto.imagen ? (
                                                    <img
                                                            src={optimizeImageUrl(producto.imagen)}
                                                        alt={producto.nombre}
                                                        className="producto-imagen-card"
                                                        loading="lazy"
                                                    />
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
                                )
                            })}
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
                <IonToast isOpen={!!error} message={error} duration={3000} color="danger" onDidDismiss={clearError} />
                <IonToast isOpen={!!success} message={success} duration={3000} color="success" onDidDismiss={clearSuccess} />
            </IonContent>
        </IonPage>
    );
};

export default Ventas;
