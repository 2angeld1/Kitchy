import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonIcon } from '@ionic/react';
import { remove, arrowDown, arrowUp } from 'ionicons/icons';
import { InventarioItem } from '../../../hooks/useInventario';

interface MovimientoModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItem: InventarioItem | null;
    movTipo: string;
    movCantidad: string;
    setMovCantidad: (v: string) => void;
    movCosto: string;
    setMovCosto: (v: string) => void;
    movMotivo: string;
    setMovMotivo: (v: string) => void;
    handleMovimiento: () => void;
}

const MovimientoModal: React.FC<MovimientoModalProps> = ({
    isOpen, onClose, selectedItem, movTipo, movCantidad, setMovCantidad,
    movCosto, setMovCosto, movMotivo, setMovMotivo, handleMovimiento
}) => {
    return (
        <IonModal
            isOpen={isOpen}
            onDidDismiss={onClose}
            className="--border-radius: 32px; --height: auto;"
        >
            <div className={`h-full flex flex-col backdrop-blur-3xl ${movTipo === 'entrada' ? 'bg-success/90' : 'bg-warning/90'}`}>
                <IonHeader className="ion-no-border">
                    <IonToolbar className="--background: transparent; pt-4 px-2">
                        <IonTitle className="font-outfit font-black text-2xl text-white italic">
                            {movTipo === 'entrada' ? 'Registrar entrada' : 'Registrar Salida'}
                        </IonTitle>
                        <IonButtons slot="end">
                            <button
                                onClick={onClose}
                                className="bg-black/10 p-2 rounded-full mr-2 text-white"
                            >
                                <IonIcon icon={remove} className="text-xl" />
                            </button>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>

                <div className="px-6 py-6 space-y-6 pb-10">
                    {selectedItem && (
                        <div className="bg-white/20 border border-white/20 rounded-2xl p-4 text-white">
                            <h2 className="text-lg font-black leading-tight italic">{selectedItem.nombre}</h2>
                            <p className="text-sm font-bold opacity-80 uppercase tracking-widest mt-1">Stock: {selectedItem.cantidad} {selectedItem.unidad}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1.5 text-white">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1">Cantidad a registrar</label>
                            <input
                                type="number"
                                value={movCantidad}
                                onChange={(e) => setMovCantidad(e.target.value)}
                                className="w-full bg-white/20 border border-white/20 rounded-2xl px-5 py-4 text-xl font-black focus:ring-4 ring-white/10 outline-none transition-all placeholder:text-white/50"
                                placeholder="0.00"
                            />
                        </div>

                        {movTipo === 'entrada' && (
                            <div className="space-y-1.5 text-white">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-white">Costo Total ($)</label>
                                <input
                                    type="number"
                                    value={movCosto}
                                    onChange={(e) => setMovCosto(e.target.value)}
                                    className="w-full bg-white/20 border border-white/20 rounded-2xl px-5 py-4 text-xl font-black outline-none transition-all placeholder:text-white/50"
                                    placeholder="0.00"
                                />
                            </div>
                        )}

                        <div className="space-y-1.5 text-white">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-white">Motivo / Nota</label>
                            <input
                                value={movMotivo}
                                onChange={(e) => setMovMotivo(e.target.value)}
                                className="w-full bg-white/20 border border-white/20 rounded-2xl px-5 py-4 text-base font-bold outline-none transition-all placeholder:text-white/50"
                                placeholder={movTipo === 'entrada' ? 'Ej: Compra semanal' : 'Ej: Desperdicio'}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={handleMovimiento}
                            className="w-full bg-white text-zinc-900 font-black py-5 rounded-[2rem] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <IonIcon icon={movTipo === 'entrada' ? arrowDown : arrowUp} className="text-2xl" />
                            <span className="text-lg">Confirmar {movTipo === 'entrada' ? 'Entrada' : 'Salida'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </IonModal>
    );
};

export default MovimientoModal;
