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
import { add, restaurant, trash, create, eye, eyeOff, camera, image, listCircleOutline, cloudUpload } from 'ionicons/icons';
import { useProductos } from '../hooks/useProductos';
import { useInventario } from '../hooks/useInventario';
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
        ingredientes,
        setIngredientes,
        handleRefresh,
        resetForm,
        openEditModal,
        handleSubmit,
        handleDelete,
        handleToggleDisponible,
        handleImageUpload,
        getEmoji,
        productosFiltrados,
        handleImportCsv
    } = useProductos();

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleImportCsv(e.target.files[0]);
            e.target.value = ''; // Reset
        }
    };

    // Traer el inventario para poder agregarlo a la receta
    const { itemsFiltrados: itemsInventario } = useInventario();

    // Función para manejar agregar/quitar ingredientes en el form
    const handleChangeIngrediente = (index: number, field: string, value: any) => {
        const nuevos = [...ingredientes];
        nuevos[index] = { ...nuevos[index], [field]: value };
        setIngredientes(nuevos);
    };

    const handleAddIngrediente = () => {
        setIngredientes([...ingredientes, { inventario: '', cantidad: 1 }]);
    };

    const handleRemoveIngrediente = (index: number) => {
        const nuevos = [...ingredientes];
        nuevos.splice(index, 1);
        setIngredientes(nuevos);
    };

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
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px', marginBottom: '10px' }}>
                        <IonSearchbar
                            value={busqueda}
                            onIonInput={(e) => setBusqueda(e.detail.value || '')}
                            placeholder="Buscar producto..."
                            style={{ padding: 0, margin: 0, flex: 1 }}
                        />
                        <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={onFileChange}
                        />
                        <IonButton fill="clear" color="secondary" onClick={() => fileInputRef.current?.click()} style={{ marginLeft: '5px' }}>
                            <IonIcon icon={cloudUpload} slot="icon-only" />
                        </IonButton>
                    </div>

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

                            {/* Sección de Receta / Ingredientes */}
                            <div className="ion-padding-top">
                                <IonItem lines="none">
                                    <IonIcon icon={listCircleOutline} slot="start" />
                                    <IonLabel>
                                        <h2>Receta / Insumos</h2>
                                        <p>¿Qué usa este producto del inventario?</p>
                                    </IonLabel>
                                    <IonButton slot="end" onClick={handleAddIngrediente} color="primary" fill="outline" size="small">
                                        <IonIcon icon={add} slot="start" /> Add
                                    </IonButton>
                                </IonItem>

                                {ingredientes.map((ingrediente: any, index: number) => (
                                    <IonItem key={index} className="ingrediente-item">
                                        <IonSelect
                                            label="Insumo"
                                            labelPlacement="floating"
                                            value={ingrediente.inventario}
                                            onIonChange={(e) => handleChangeIngrediente(index, 'inventario', e.detail.value)}
                                            placeholder="Elegir..."
                                            style={{ flex: 2, marginRight: '10px' }}
                                        >
                                            {itemsInventario.map(invItem => (
                                                <IonSelectOption key={invItem._id} value={invItem._id}>
                                                    {invItem.nombre} ({invItem.unidad})
                                                </IonSelectOption>
                                            ))}
                                            {/* Prevenir un caso donde se editó un ingrediente que ya no esta en el stock pero sí en la base (safeguard) */}
                                            {ingrediente.nombreDisplay && !itemsInventario.find(i => i._id === ingrediente.inventario) && (
                                                <IonSelectOption value={ingrediente.inventario}>
                                                    {ingrediente.nombreDisplay} (No disp.)
                                                </IonSelectOption>
                                            )}
                                        </IonSelect>

                                        <IonInput
                                            label="Cant."
                                            labelPlacement="floating"
                                            type="number"
                                            value={ingrediente.cantidad}
                                            onIonInput={(e) => handleChangeIngrediente(index, 'cantidad', e.detail.value)}
                                            style={{ flex: 1 }}
                                            min="0.01"
                                            step="0.01"
                                        />

                                        <IonButton slot="end" color="danger" fill="clear" onClick={() => handleRemoveIngrediente(index)}>
                                            <IonIcon icon={trash} slot="icon-only" />
                                        </IonButton>
                                    </IonItem>
                                ))}

                                {ingredientes.length === 0 && (
                                    <div className="ion-padding" style={{ textAlign: 'center', color: 'var(--ion-color-medium)', fontSize: '0.9em' }}>
                                        No se han definido insumos para este producto.
                                    </div>
                                )}
                            </div>
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
