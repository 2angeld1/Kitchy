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
import { motion, AnimatePresence } from 'framer-motion';
import { slideUp, springTransition } from '../animations/variants';

// Components
import SmartInput from './inventario/components/SmartInput';
import KitchyToolbar from '../components/KitchyToolbar';
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
        <IonPage className="bg-[#fafafa]" style={{ background: 'var(--ion-background-color)' }}>
            <KitchyToolbar title="Inventario" />

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

                    <motion.div variants={slideUp} initial="initial" animate="animate">
                        <IonSegment
                            value={filtro}
                            onIonChange={(e) => setFiltro(e.detail.value as string)}
                            className="bg-zinc-100 rounded-2xl p-1 border border-zinc-200 shadow-sm"
                            style={{ '--background': 'transparent' }}
                        >
                            <IonSegmentButton value="todos" className="font-bold text-xs text-zinc-600">Todos</IonSegmentButton>
                            <IonSegmentButton value="stockBajo" className="font-bold text-xs text-zinc-600">Bajo Stock</IonSegmentButton>
                            <IonSegmentButton value="ingrediente" className="font-bold text-xs text-zinc-600">Insumos</IonSegmentButton>
                        </IonSegment>
                    </motion.div>

                    <div
                        className="bg-zinc-50/50 backdrop-blur-3xl border border-zinc-200 rounded-3xl overflow-hidden shadow-sm !p-0"
                    >
                        <AnimatePresence mode="popLayout">
                            {itemsFiltrados.map((item, index) => (
                                <InventarioItemCard
                                    key={item._id}
                                    item={item}
                                    isAdmin={isAdmin}
                                    openEditModal={openEditModal}
                                    handleDelete={handleDelete}
                                    openMovModal={openMovModal}
                                    isLast={index === itemsFiltrados.length - 1}
                                />
                            ))}
                        </AnimatePresence>
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
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={springTransition}
                    >
                        <IonFabButton color="secondary" onClick={() => fileInputRef.current?.click()} style={{ '--box-shadow': 'none' }}>
                            <IonIcon icon={cloudUpload} />
                        </IonFabButton>
                    </motion.div>
                </IonFab>

                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={springTransition}
                    >
                        <IonFabButton onClick={() => { resetForm(); setShowModal(true); }} style={{ '--box-shadow': 'none' }}>
                            <IonIcon icon={add} />
                        </IonFabButton>
                    </motion.div>
                </IonFab>

                <IonLoading isOpen={loading} message="Cargando..." spinner="crescent" />
                <IonToast isOpen={!!error} message={error} duration={3000} color="danger" onDidDismiss={clearError} />
                <IonToast isOpen={!!success} message={success} duration={2000} color="success" onDidDismiss={clearSuccess} />
            </IonContent>
        </IonPage>
    );
};

export default Inventario;
