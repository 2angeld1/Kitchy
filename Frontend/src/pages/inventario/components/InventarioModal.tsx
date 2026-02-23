import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonIcon } from '@ionic/react';
import { remove, create, add } from 'ionicons/icons';
import { InventarioItem } from '../../../hooks/useInventario';

interface InventarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    editItem: InventarioItem | null;
    nombre: string;
    setNombre: (v: string) => void;
    cantidad: string;
    setCantidad: (v: string) => void;
    unidad: string;
    setUnidad: (v: string) => void;
    cantidadMinima: string;
    setCantidadMinima: (v: string) => void;
    costoUnitario: string;
    setCostoUnitario: (v: string) => void;
    proveedor: string;
    setProveedor: (v: string) => void;
    categoria: string;
    setCategoria: (v: string) => void;
    handleSubmit: () => void;
}

const InventarioModal: React.FC<InventarioModalProps> = ({
    isOpen, onClose, editItem, nombre, setNombre, cantidad, setCantidad, unidad, setUnidad,
    cantidadMinima, setCantidadMinima, costoUnitario, setCostoUnitario, proveedor, setProveedor,
    categoria, setCategoria, handleSubmit
}) => {
    return (
        <IonModal
            isOpen={isOpen}
            onDidDismiss={onClose}
            className="--border-radius: 32px; --height: 90%; overflow: hidden;"
        >
            <div className="h-full flex flex-col bg-white overflow-y-auto">
                <IonHeader className="ion-no-border">
                    <IonToolbar className="--background: transparent; pt-6 px-4">
                        <IonTitle className="font-outfit font-black text-2xl text-zinc-800 italic tracking-tighter">
                            {editItem ? 'Editar' : 'Nuevo'} Item
                        </IonTitle>
                        <IonButtons slot="end">
                            <button
                                onClick={onClose}
                                className="bg-zinc-200/50 p-2.5 rounded-full hover:rotate-90 transition-transform duration-300"
                            >
                                <IonIcon icon={remove} className="text-xl" />
                            </button>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>

                <div className="flex-1 px-6 py-6 space-y-6 pb-12">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 ml-1">Nombre del Item</label>
                        <input
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Ketchup Premium"
                            className="w-full bg-zinc-100/50 border border-zinc-200 rounded-2xl px-5 py-4 text-base font-bold focus:ring-4 ring-primary/10 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Cantidad</label>
                            <input
                                type="number"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                                className="w-full bg-zinc-100/50 border border-zinc-200 rounded-2xl px-5 py-4 text-base font-bold transition-all"
                            />
                        </div>
                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Unidad</label>
                            <select
                                value={unidad}
                                onChange={(e) => setUnidad(e.target.value)}
                                className="w-full bg-zinc-100/50 border border-zinc-200 rounded-2xl px-5 py-4 text-base font-bold transition-all appearance-none h-full"
                            >
                                <option value="unidades">Unidades</option>
                                <option value="kg">Kilogramos</option>
                                <option value="lb">Libras</option>
                                <option value="litros">Litros</option>
                                <option value="gramos">Gramos</option>
                                <option value="ml">Mililitros</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500 ml-1">Stock Crítico</label>
                            <input
                                type="number"
                                value={cantidadMinima}
                                onChange={(e) => setCantidadMinima(e.target.value)}
                                className="w-full bg-zinc-100/50 border border-zinc-200 rounded-2xl px-5 py-4 text-base font-bold transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Costo ($)</label>
                            <input
                                type="number"
                                value={costoUnitario}
                                onChange={(e) => setCostoUnitario(e.target.value)}
                                className="w-full bg-zinc-100/50 border border-zinc-200 rounded-2xl px-5 py-4 text-base font-bold transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Proveedor (Opcional)</label>
                        <input
                            value={proveedor}
                            onChange={(e) => setProveedor(e.target.value)}
                            placeholder="Nombre del proveedor"
                            className="w-full bg-zinc-100/50 border border-zinc-200 rounded-2xl px-5 py-4 text-base font-bold transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Categoría</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['ingrediente', 'insumo', 'empaque', 'otro'].map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategoria(cat)}
                                    className={`!py-3.5 !rounded-xl !border !font-bold !text-xs !uppercase !tracking-tighter !transition-all ${categoria === cat ? '!bg-primary !text-white !border-primary !shadow-lg !shadow-primary/20 !scale-105 !z-10' : '!bg-transparent !border-zinc-200 !text-zinc-500 !hover:bg-zinc-100'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            onClick={handleSubmit}
                            className="!w-full !bg-primary !hover:!bg-primary-shade !text-white !font-black !py-5 !rounded-[2rem] !shadow-2xl !shadow-primary/40 !transition-all !flex !items-center !justify-center !gap-3 !active:scale-95 !group"
                        >
                            <IonIcon icon={editItem ? create : add} className="text-2xl group-hover:rotate-12 transition-transform" />
                            <span className="text-lg tracking-tight">{editItem ? 'Actualizar Registro' : 'Crear en el Sistema'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </IonModal>
    );
};

export default InventarioModal;
