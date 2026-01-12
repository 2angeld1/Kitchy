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
    IonToggle,
    IonTextarea,
    IonThumbnail
} from '@ionic/react';
import { add, restaurant, trash, create, eye, eyeOff, camera, image } from 'ionicons/icons';
import { getProductos, createProducto, updateProducto, deleteProducto, toggleDisponibilidad } from '../services/api';
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

const Productos: React.FC = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<Producto | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const { isAdmin } = useAuth();

    // Form state
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [categoria, setCategoria] = useState('comida');
    const [disponible, setDisponible] = useState(true);
    const [imagen, setImagen] = useState('');

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        setLoading(true);
        try {
            const response = await getProductos();
            setProductos(response.data);
        } catch (err) {
            setError('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async (event: CustomEvent) => {
        await cargarProductos();
        event.detail.complete();
    };

    const resetForm = () => {
        setNombre('');
        setDescripcion('');
        setPrecio('');
        setCategoria('comida');
        setDisponible(true);
        setImagen('');
        setEditItem(null);
    };

    const openEditModal = (item: Producto) => {
        setEditItem(item);
        setNombre(item.nombre);
        setDescripcion(item.descripcion || '');
        setPrecio(item.precio.toString());
        setCategoria(item.categoria);
        setDisponible(item.disponible);
        setImagen(item.imagen || '');
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!nombre || !precio) {
            setError('Nombre y precio son requeridos');
            return;
        }

        setLoading(true);
        try {
            const data = {
                nombre,
                descripcion,
                precio: parseFloat(precio),
                categoria,
                disponible,
                imagen
            };

            if (editItem) {
                const response = await updateProducto(editItem._id, data);
                setProductos(prev => prev.map(p => p._id === editItem._id ? response.data : p));
                setSuccess('Producto actualizado');
            } else {
                const response = await createProducto(data);
                setProductos(prev => [...prev, response.data]);
                setSuccess('Producto creado');
            }

            setShowModal(false);
            resetForm();
            // cargarProductos(); // Ya actualizamos el estado localmente
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Eliminar este producto?')) return;

        setLoading(true);
        try {
            await deleteProducto(id);
            setSuccess('Producto eliminado');
            cargarProductos();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al eliminar');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDisponible = async (id: string) => {
        try {
            await toggleDisponibilidad(id);
            cargarProductos();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cambiar disponibilidad');
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagen(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const getEmoji = (cat: string) => {
        switch (cat) {
            case 'comida': return '🍔';
            case 'bebida': return '🥤';
            case 'postre': return '🍰';
            default: return '📦';
        }
    };

    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

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
                                            <img src={producto.imagen} alt={producto.nombre} className="producto-imagen-list" />
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
                <IonToast isOpen={!!error} message={error} duration={3000} color="danger" onDidDismiss={() => setError('')} />
                <IonToast isOpen={!!success} message={success} duration={2000} color="success" onDidDismiss={() => setSuccess('')} />
            </IonContent>
        </IonPage>
    );
};

export default Productos;
