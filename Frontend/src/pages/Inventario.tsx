import React, { useRef } from 'react';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonFab, IonFabButton,
    IonLoading, IonToast, IonButtons, IonMenuButton, IonRefresher, IonRefresherContent,
    IonSegment, IonSegmentButton
} from '@ionic/react';
import { add, cloudUpload } from 'ionicons/icons';
import { useInventario } from '../hooks/useInventario';
import { useAuth } from '../context/AuthContext';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Components
import SmartInput from './inventario/components/SmartInput';
import InventarioItemCard from './inventario/components/InventarioItemCard';
import InventarioModal from './inventario/components/InventarioModal';
import MovimientoModal from './inventario/components/MovimientoModal';
import EmptyInventory from './inventario/components/EmptyInventory';

const Inventario: React.FC = () => {
    const {
        loading, error, success, clearError, clearSuccess, itemsFiltrados, showModal, setShowModal,
        showMovModal, setShowMovModal, editItem, selectedItem, movTipo, movCantidad, setMovCantidad,
        movMotivo, setMovMotivo, movCosto, setMovCosto, filtro, setFiltro, nombre, setNombre,
        descripcion, setDescripcion, cantidad, setCantidad, unidad, setUnidad, cantidadMinima,
        setCantidadMinima, costoUnitario, setCostoUnitario, categoria, setCategoria, proveedor,
        setProveedor, handleRefresh, resetForm, openEditModal, handleSubmit, handleDelete,
        openMovModal, handleMovimiento, smartText, setSmartText, handleSmartAction, isListening,
        setIsListening, handleImportCsv
    } = useInventario();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { isAdmin } = useAuth();

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleImportCsv(e.target.files[0]);
            e.target.value = '';
        }
    };

    const triggerHaptic = async () => {
        try {
            await Haptics.impact({ style: ImpactStyle.Light });
        } catch (e) { }
    };

    const startListening = () => {
        triggerHaptic();
        if ('webkitSpeechRecognition' in window) {
            const recognition = new (window as any).webkitSpeechRecognition();
            recognition.lang = 'es-ES';
            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onerror = () => setIsListening(false);
            recognition.onresult = (event: any) => {
                setSmartText(event.results[0][0].transcript);
            };
            recognition.start();
        } else {
            alert('Tu navegador no soporta reconocimiento de voz.');
        }
    };

    return (
        <IonPage className="bg-[#fafafa] dark:bg-[#09090b]" style={{ background: 'var(--ion-background-color)' }}>
            <IonHeader className="ion-no-border">
                <IonToolbar style={{ '--background': 'transparent' }} className="px-2">
                    <IonButtons slot="start">
                        <IonMenuButton className="text-primary" />
                    </IonButtons>
                    <IonTitle className="font-outfit font-bold text-xl tracking-tight text-zinc-950 dark:text-white">
                        Inventario
                    </IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent style={{ '--background': 'transparent' }}>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                <div className="max-w-3xl mx-auto px-4 pb-24 space-y-6">
                    <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={onFileChange} />

                    <SmartInput
                        smartText={smartText}
                        setSmartText={setSmartText}
                        handleSmartAction={handleSmartAction}
                        startListening={startListening}
                        isListening={isListening}
                    />

                    <IonSegment
                        value={filtro}
                        onIonChange={(e) => setFiltro(e.detail.value as string)}
                        className="bg-zinc-100 dark:bg-white/5 rounded-2xl p-1 border border-zinc-200 dark:border-none shadow-sm"
                        style={{ '--background': 'transparent' }}
                    >
                        <IonSegmentButton value="todos" className="font-bold text-xs text-zinc-600 dark:text-zinc-400">Todos</IonSegmentButton>
                        <IonSegmentButton value="stockBajo" className="font-bold text-xs text-zinc-600 dark:text-zinc-400">Bajo Stock</IonSegmentButton>
                        <IonSegmentButton value="ingrediente" className="font-bold text-xs text-zinc-600 dark:text-zinc-400">Insumos</IonSegmentButton>
                    </IonSegment>

                    <div className="grid gap-3">
                        {itemsFiltrados.map(item => (
                            <InventarioItemCard
                                key={item._id}
                                item={item}
                                isAdmin={isAdmin}
                                openEditModal={openEditModal}
                                handleDelete={handleDelete}
                            />
                        ))}
                    </div>

                    <EmptyInventory loading={loading} itemCount={itemsFiltrados.length} />
                </div>

                <InventarioModal
                    isOpen={showModal}
                    onClose={() => { setShowModal(false); resetForm(); }}
                    editItem={editItem}
                    nombre={nombre} setNombre={setNombre}
                    cantidad={cantidad} setCantidad={setCantidad}
                    unidad={unidad} setUnidad={setUnidad}
                    cantidadMinima={cantidadMinima} setCantidadMinima={setCantidadMinima}
                    costoUnitario={costoUnitario} setCostoUnitario={setCostoUnitario}
                    proveedor={proveedor} setProveedor={setProveedor}
                    categoria={categoria} setCategoria={setCategoria}
                    handleSubmit={handleSubmit}
                />

                <MovimientoModal
                    isOpen={showMovModal}
                    onClose={() => setShowMovModal(false)}
                    selectedItem={selectedItem}
                    movTipo={movTipo}
                    movCantidad={movCantidad} setMovCantidad={setMovCantidad}
                    movCosto={movCosto} setMovCosto={setMovCosto}
                    movMotivo={movMotivo} setMovMotivo={setMovMotivo}
                    handleMovimiento={handleMovimiento}
                />

                <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ marginBottom: '80px' }}>
                    <IonFabButton color="secondary" onClick={() => fileInputRef.current?.click()} className="transition-all hover:scale-110 active:scale-90" style={{ '--box-shadow': 'none' }}>
                        <IonIcon icon={cloudUpload} />
                    </IonFabButton>
                </IonFab>

                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => { resetForm(); setShowModal(true); }} className="transition-all hover:scale-110 active:scale-95" style={{ '--box-shadow': 'none' }}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>

                <IonLoading isOpen={loading} message="Cargando..." spinner="crescent" />
                <IonToast isOpen={!!error} message={error} duration={3000} color="danger" onDidDismiss={clearError} />
                <IonToast isOpen={!!success} message={success} duration={2000} color="success" onDidDismiss={clearSuccess} />
            </IonContent>
        </IonPage>
    );
};

export default Inventario;
