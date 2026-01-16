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
import { useUsuarios } from '../hooks/useUsuarios';

const Usuarios: React.FC = () => {
    const {
        loading,
        error,
        clearError,
        success,
        clearSuccess,
        busqueda,
        setBusqueda,
        handleRefresh,
        handleChangeRole,
        handleDelete,
        usuariosFiltrados,
        currentUser
    } = useUsuarios();

    const getRolColor = (rol: string) => {
        switch (rol) {
            case 'superadmin': return 'danger';
            case 'admin': return 'primary';
            default: return 'medium';
        }
    };

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
                <IonToast isOpen={!!error} message={error} duration={3000} color="danger" onDidDismiss={clearError} />
                <IonToast isOpen={!!success} message={success} duration={2000} color="success" onDidDismiss={clearSuccess} />
            </IonContent>
        </IonPage>
    );
};

export default Usuarios;
