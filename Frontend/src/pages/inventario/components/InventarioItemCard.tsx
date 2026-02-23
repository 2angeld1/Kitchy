import React from 'react';
import { IonItemSliding, IonItemOptions, IonItemOption, IonIcon } from '@ionic/react';
import { archive, create, trash } from 'ionicons/icons';
import { InventarioItem } from '../../../hooks/useInventario';

interface InventarioItemCardProps {
    item: InventarioItem;
    isAdmin: boolean;
    openEditModal: (item: InventarioItem) => void;
    handleDelete: (id: string) => void;
}

const InventarioItemCard: React.FC<InventarioItemCardProps> = ({ item, isAdmin, openEditModal, handleDelete }) => {
    let stateClass = 'text-success';
    let badgeColor = 'bg-success/10 text-success';
    let badgeText = '';

    if (item.cantidad <= item.cantidadMinima) {
        stateClass = 'text-danger';
        badgeColor = 'bg-danger/10 text-danger';
        badgeText = 'Bajo';
    } else if (item.cantidadMinima > 0 && item.cantidad <= item.cantidadMinima * 1.5) {
        stateClass = 'text-secondary';
        badgeColor = 'bg-secondary/10 text-secondary';
        badgeText = 'Reponer';
    }

    return (
        <IonItemSliding className="bg-transparent mb-1">
            <div className="mx-0 bg-zinc-50/30 dark:bg-zinc-900/40 backdrop-blur-3xl border border-zinc-100 dark:border-white/10 rounded-2xl p-4 shadow-sm dark:shadow-none transition-all group active:scale-[0.97] hover:bg-zinc-50 dark:hover:bg-zinc-900/60 ring-1 ring-black/[0.01] dark:ring-white/[0.02]">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <IonIcon icon={archive} className="text-2xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xs font-black text-black dark:text-white truncate leading-tight">
                            {item.nombre}
                        </h2>
                        <p className="text-[0.6rem] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-tighter mt-0.5">
                            {item.categoria} • {item.proveedor || 'Gral'}
                        </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                        <span className={`text-sm font-black ${stateClass} leading-none`}>
                            {item.cantidad.toFixed(2)}
                            <small className="ml-0.5 text-[0.55rem] opacity-70 uppercase font-black">{item.unidad}</small>
                        </span>
                        {badgeText && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${badgeColor}`}>
                                {badgeText}
                            </span>
                        )}
                    </div>
                </div>

                {/* Action touch area for mobile feeling */}
                <button
                    onClick={() => openEditModal(item)}
                    className="absolute inset-0 w-full h-full opacity-0 z-0"
                />
            </div>
            <IonItemOptions side="end" className="rounded-3xl overflow-hidden ml-2">
                <IonItemOption color="primary" onClick={() => openEditModal(item)} className="rounded-l-3xl">
                    <IonIcon icon={create} slot="icon-only" />
                </IonItemOption>
                {isAdmin && (
                    <IonItemOption color="danger" onClick={() => handleDelete(item._id)} className="rounded-r-3xl">
                        <IonIcon icon={trash} slot="icon-only" />
                    </IonItemOption>
                )}
            </IonItemOptions>
        </IonItemSliding>
    );
};

export default InventarioItemCard;
