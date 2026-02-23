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
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { add, remove, cube, arrowDown, arrowUp, trash, create, mic, flash, send, cloudUpload } from 'ionicons/icons';
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
        handleMovimiento,
        smartText,
        setSmartText,
        handleSmartAction,
        isListening,
        setIsListening,
        handleImportCsv
    } = useInventario();

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleImportCsv(e.target.files[0]);
            e.target.value = ''; // Reset for future uploads
        }
    };

    const { isAdmin } = useAuth();

    const triggerHaptic = async () => {
        try {
            await Haptics.impact({ style: ImpactStyle.Light });
        } catch (e) {
            // Ignore if not supported
        }
    };

    const startListening = () => {
        triggerHaptic();
        if ('webkitSpeechRecognition' in window) {
            const recognition = new (window as any).webkitSpeechRecognition();
            recognition.lang = 'es-ES';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = () => {
                setIsListening(false);
            };

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setSmartText(transcript);
            };

            recognition.start();
        } else {
            alert('Tu navegador no soporta reconocimiento de voz.');
        }
    };

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

                    {/* Smart Input Section */}
                    <div className="smart-input-container ion-padding-horizontal ion-margin-top">
                        <div className="smart-input-box">
                            <IonIcon icon={flash} className="smart-icon" color="warning" />
                            <input
                                type="text"
                                placeholder="Buscar o dictar (Ej: Tomates o 5kg Leche)"
                                value={smartText}
                                onChange={(e) => setSmartText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSmartAction()}
                            />
                            <div className="smart-actions">
                                <input
                                    type="file"
                                    accept=".csv"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={onFileChange}
                                />
                                <IonButton fill="clear" size="small" color="secondary" onClick={() => fileInputRef.current?.click()}>
                                    <IonIcon icon={cloudUpload} slot="icon-only" />
                                </IonButton>
                                <IonButton fill="clear" size="small" onClick={startListening} color={isListening ? "danger" : "primary"}>
                                    <IonIcon icon={mic} slot="icon-only" className={isListening ? "pulsing-icon" : ""} />
                                </IonButton>
                                <IonButton fill="clear" size="small" color="primary" onClick={handleSmartAction}>
                                    <IonIcon icon={send} slot="icon-only" />
                                </IonButton>
                            </div>
                        </div>
                        <p className="smart-hint">
                            <small>
                                {isListening ? (
                                    <span className="listening-text">🎙️ Escuchando...</span>
                                ) : (
                                    <>💡 Comandos: "10 Cajas Leche", "Gaste 2 Huevos", "2 lb Tomate 1.50"</>
                                )}
                            </small>
                        </p>
                    </div>

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

                                        <div className="stock-info">
                                            {(() => {
                                                let stateClass = '';
                                                let badgeColor = '';
                                                let badgeText = '';

                                                if (item.cantidad <= item.cantidadMinima) {
                                                    stateClass = 'bajo'; // warning/danger depending on the css
                                                    badgeColor = 'danger';
                                                    badgeText = 'Bajo';
                                                } else if (item.cantidadMinima > 0 && item.cantidad <= item.cantidadMinima * 1.5) {
                                                    stateClass = 'medio'; // blue
                                                    badgeColor = 'secondary';
                                                    badgeText = 'Usando';
                                                }

                                                return (
                                                    <>
                                                        <span className={`cantidad ${stateClass}`}>
                                                            {item.cantidad.toFixed(2)} {item.unidad}
                                                        </span>
                                                        {badgeText && (
                                                            <IonBadge color={badgeColor}>{badgeText}</IonBadge>
                                                        )}
                                                    </>
                                                )
                                            })()}
                                        </div>
                                    </div>
                                </IonItem>
                                <IonItemOptions side="end">
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
