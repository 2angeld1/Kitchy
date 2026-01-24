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
    IonToggle,
    IonTextarea,
    IonThumbnail
} from '@ionic/react';
import { add, restaurant, trash, create, eye, eyeOff, camera, image } from 'ionicons/icons';
import { useProductos } from '../hooks/useProductos';
import { optimizeImageUrl } from '../utils/imageUtils';

const Productos: React.FC = () => {
    const {
        loading,
        showModal,
        setShowModal,
        editItem,
        error,
        clearError,
        success,
        clearSuccess,
        busqueda,
        setBusqueda,
        nombre,
        setNombre,
        descripcion,
        setDescripcion,
        precio,
        setPrecio,
        categoria,
        setCategoria,
        disponible,
        setDisponible,
        imagen,
        setImagen,
        handleRefresh,
        resetForm,
        openEditModal,
        handleSubmit,
        handleDelete,
        handleToggleDisponible,
        handleImageUpload,
        getEmoji,
        productosFiltrados
    } = useProductos();

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Productos</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                <div className="productos-container">
                    <IonSearchbar
                        value={busqueda}
                        onIonInput={(e) => setBusqueda(e.detail.value || '')}
                        placeholder="Buscar producto..."
                    />

                    <IonList>
                        {productosFiltrados.map(producto => (
                            <IonItemSliding key={producto._id}>
                                <IonItem>
                                    <div className="producto-emoji" slot="start">
                                        {producto.imagen ? (
                                            <img src={optimizeImageUrl(producto.imagen)} alt={producto.nombre} className="producto-imagen-list" loading="lazy" />
                                        ) : (
                                            getEmoji(producto.categoria)
                                        )}
                                    </div>
                                    <IonLabel>
                                        <h2>{producto.nombre}</h2>
                                        <p>{producto.categoria} {producto.descripcion && `• ${producto.descripcion}`}</p>
                                    </IonLabel>
                                    <div className="producto-precio" slot="end">
                                        <span className="precio">${producto.precio.toFixed(2)}</span>
                                        <IonBadge color={producto.disponible ? 'success' : 'medium'}>
                                            {producto.disponible ? 'Activo' : 'Inactivo'}
                                        </IonBadge>
                                    </div>
                                </IonItem>
                                <IonItemOptions side="end">
                                    <IonItemOption
                                        color={producto.disponible ? 'medium' : 'success'}
                                        onClick={() => handleToggleDisponible(producto._id)}
                                    >
                                        <IonIcon icon={producto.disponible ? eyeOff : eye} slot="icon-only" />
                                    </IonItemOption>
                                    <IonItemOption color="primary" onClick={() => openEditModal(producto)}>
                                        <IonIcon icon={create} slot="icon-only" />
                                    </IonItemOption>
                                    <IonItemOption color="danger" onClick={() => handleDelete(producto._id)}>
                                        <IonIcon icon={trash} slot="icon-only" />
                                    </IonItemOption>
                                </IonItemOptions>
                            </IonItemSliding>
                        ))}
                    </IonList>

                    {productosFiltrados.length === 0 && !loading && (
                        <div className="empty-state">
                            <IonIcon icon={restaurant} />
                            <p>No hay productos</p>
                            <IonButton onClick={() => setShowModal(true)}>
                                Agregar Producto
                            </IonButton>
                        </div>
                    )}
                </div>

                {/* Modal Crear/Editar */}
                <IonModal isOpen={showModal} onDidDismiss={() => { setShowModal(false); resetForm(); }}>
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle>{editItem ? 'Editar' : 'Nuevo'} Producto</IonTitle>
                            <IonButtons slot="end">
                                <IonButton onClick={() => { setShowModal(false); resetForm(); }}>Cerrar</IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent className="ion-padding">
                        <IonList>
                            <IonItem>
                                <div className="image-upload-container">
                                    <div 
                                        className="image-preview" 
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                        style={{ backgroundImage: imagen ? `url(${imagen})` : 'none' }}
                                    >
                                        {!imagen && (
                                            <div className="upload-placeholder">
                                                <IonIcon icon={camera} />
                                                <span>Añadir Foto</span>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        style={{ display: 'none' }}
                                    />
                                    {imagen && (
                                        <IonButton 
                                            fill="clear" 
                                            color="danger" 
                                            size="small" 
                                            onClick={() => setImagen('')}
                                        >
                                            <IonIcon icon={trash} slot="start" />
                                            Quitar imagen
                                        </IonButton>
                                    )}
                                </div>
                            </IonItem>
                            <IonItem>
                                <IonInput
                                    label="Nombre *"
                                    value={nombre}
                                    onIonInput={(e) => setNombre(e.detail.value || '')}
                                    placeholder="Ej: Salchipapa"
                                />
                            </IonItem>
                            <IonItem>
                                <IonTextarea
                                    label="Descripción"
                                    value={descripcion}
                                    onIonInput={(e) => setDescripcion(e.detail.value || '')}
                                    placeholder="Descripción opcional"
                                    rows={2}
                                />
                            </IonItem>
                            <IonItem>
                                <IonInput
                                    label="Precio *"
                                    type="number"
                                    value={precio}
                                    onIonInput={(e) => setPrecio(e.detail.value || '')}
                                    placeholder="0.00"
                                />
                            </IonItem>
                            <IonItem>
                                <IonSelect
                                    label="Categoría"
                                    value={categoria}
                                    onIonChange={(e) => setCategoria(e.detail.value)}
                                >
                                    <IonSelectOption value="comida">🍔 Comida</IonSelectOption>
                                    <IonSelectOption value="bebida">🥤 Bebida</IonSelectOption>
                                    <IonSelectOption value="postre">🍰 Postre</IonSelectOption>
                                    <IonSelectOption value="otro">📦 Otro</IonSelectOption>
                                </IonSelect>
                            </IonItem>
                            <IonItem>
                                <IonLabel>Disponible</IonLabel>
                                <IonToggle
                                    checked={disponible}
                                    onIonChange={(e) => setDisponible(e.detail.checked)}
                                />
                            </IonItem>
                        </IonList>
                        <IonButton expand="block" onClick={handleSubmit} className="ion-margin-top">
                            {editItem ? 'Actualizar' : 'Crear'} Producto
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

export default Productos;
