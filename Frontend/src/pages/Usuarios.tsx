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
    IonSelect,
    IonSelectOption,
    IonAlert
} from '@ionic/react';
import { personCircle, trash, shieldCheckmark } from 'ionicons/icons';
import { getUsers, updateUserRole, deleteUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Usuario {
    _id: string;
    email: string;
    nombre: string;
    rol: string;
    activo?: boolean;
    createdAt?: string;
}

const Usuarios: React.FC = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [showRoleAlert, setShowRoleAlert] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        setLoading(true);
        try {
            const response = await getUsers();
            setUsuarios(response.data);
        } catch (err) {
            setError('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async (event: CustomEvent) => {
        await cargarUsuarios();
        event.detail.complete();
    };

    const handleChangeRole = async (userId: string, newRole: string) => {
        setLoading(true);
        try {
            await updateUserRole(userId, newRole);
            setSuccess('Rol actualizado');
            cargarUsuarios();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al actualizar rol');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (id === currentUser?.id) {
            setError('No puedes eliminarte a ti mismo');
            return;
        }

        setLoading(true);
        try {
            await deleteUser(id);
            setSuccess('Usuario eliminado');
            cargarUsuarios();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al eliminar');
        } finally {
            setLoading(false);
        }
    };

    const getRolColor = (rol: string) => {
        switch (rol) {
            case 'superadmin': return 'danger';
            case 'admin': return 'primary';
            default: return 'medium';
        }
    };

    const usuariosFiltrados = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Usuarios</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                <div className="usuarios-container">
                    <IonSearchbar
                        value={busqueda}
                        onIonInput={(e) => setBusqueda(e.detail.value || '')}
                        placeholder="Buscar usuario..."
                    />

                    <IonList>
                        {usuariosFiltrados.map(usuario => (
                            <IonItemSliding key={usuario._id}>
                                <IonItem>
                                    <IonIcon icon={personCircle} slot="start" color="primary" className="user-icon" />
                                    <IonLabel>
                                        <h2>{usuario.nombre}</h2>
                                        <p>{usuario.email}</p>
                                    </IonLabel>
                                    <IonSelect
                                        value={usuario.rol}
                                        onIonChange={(e) => handleChangeRole(usuario._id, e.detail.value)}
                                        interface="popover"
                                        disabled={usuario._id === currentUser?.id}
                                        slot="end"
                                    >
                                        <IonSelectOption value="usuario">Usuario</IonSelectOption>
                                        <IonSelectOption value="admin">Admin</IonSelectOption>
                                        <IonSelectOption value="superadmin">Super Admin</IonSelectOption>
                                    </IonSelect>
                                </IonItem>
                                <IonItemOptions side="end">
                                    {usuario._id !== currentUser?.id && (
                                        <IonItemOption color="danger" onClick={() => handleDelete(usuario._id)}>
                                            <IonIcon icon={trash} slot="icon-only" />
                                        </IonItemOption>
                                    )}
                                </IonItemOptions>
                            </IonItemSliding>
                        ))}
                    </IonList>

                    {usuariosFiltrados.length === 0 && !loading && (
                        <div className="empty-state">
                            <IonIcon icon={personCircle} />
                            <p>No hay usuarios</p>
                        </div>
                    )}
                </div>

                <IonLoading isOpen={loading} message="Cargando..." />
                <IonToast isOpen={!!error} message={error} duration={3000} color="danger" onDidDismiss={() => setError('')} />
                <IonToast isOpen={!!success} message={success} duration={2000} color="success" onDidDismiss={() => setSuccess('')} />
            </IonContent>
        </IonPage>
    );
};

export default Usuarios;
