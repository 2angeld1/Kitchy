import React, { useState } from 'react';
import { IonIcon, IonPopover } from '@ionic/react';
import { archive, trash, eye, eyeOff, arrowDown, arrowUp, ellipsisVertical } from 'ionicons/icons';
import { InventarioItem } from '../../../hooks/useInventario';
import { motion } from 'framer-motion';
import { listItemVariant } from '../../../animations/variants';

interface InventarioItemCardProps {
    item: InventarioItem;
    isAdmin: boolean;
    openEditModal: (item: InventarioItem) => void;
    handleDelete: (id: string) => void;
    openMovModal: (item: InventarioItem, tipo: 'entrada' | 'salida') => void;
    isLast: boolean;
}

const InventarioItemCard: React.FC<InventarioItemCardProps> = ({
    item,
    isAdmin,
    openEditModal,
    handleDelete,
    openMovModal,
    isLast
}) => {
    const [popoverEvent, setPopoverEvent] = useState<Event | null>(null);

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
        <motion.div
            variants={listItemVariant}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, scale: 0.95 }}
            layout
            className={`group flex items-center w-full px-4 py-3 bg-transparent transition-colors hover:bg-zinc-50 cursor-default ${!isLast ? 'border-b border-zinc-100' : ''}`}
        >
            <div className="flex items-center gap-4 w-full">
                <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <IonIcon icon={archive} className="text-xl" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                    <h2 className="!text-[1.1rem] font-black text-black truncate leading-none">
                        {item.nombre}
                    </h2>
                    <p className="text-[0.55rem] font-bold text-zinc-500 uppercase tracking-tighter mt-1">
                        {item.categoria} • {item.proveedor || 'Gral'}
                    </p>
                </div>

                <div className="text-right flex flex-col items-end gap-1 mr-2">
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

                {/* 3 Dots Menu Button */}
                <button
                    className="!p-2 !-mr-2 !text-zinc-400 hover:!text-zinc-800 !transition-colors !rounded-full active:!scale-95 hover:!bg-zinc-100"
                    onClick={(e) => {
                        e.stopPropagation();
                        setPopoverEvent(e.nativeEvent);
                    }}
                >
                    <IonIcon icon={ellipsisVertical} className="text-xl block" />
                </button>
            </div>

            {/* Native Clean Popover Menu */}
            <IonPopover
                isOpen={Boolean(popoverEvent)}
                event={popoverEvent}
                onDidDismiss={() => setPopoverEvent(null)}
                className="kitchy-action-popover"
            >
                <div className="bg-white/95 backdrop-blur-xl p-1.5 flex flex-col min-w-[160px] rounded-2xl shadow-xl border border-zinc-200">
                    <button
                        onClick={(e) => { e.stopPropagation(); setPopoverEvent(null); openMovModal(item, 'entrada'); }}
                        className="!flex !items-center !gap-3 !w-full !px-3 !py-2.5 !text-left !text-[0.85rem] !font-bold !text-success hover:!bg-success/10 !rounded-xl !transition-colors"
                    >
                        <IonIcon icon={arrowDown} className="text-lg" /> Entrada Stock
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setPopoverEvent(null); openMovModal(item, 'salida'); }}
                        className="!flex !items-center !gap-3 !w-full !px-3 !py-2.5 !text-left !text-[0.85rem] !font-bold !text-warning hover:!bg-warning/10 !rounded-xl !transition-colors"
                    >
                        <IonIcon icon={arrowUp} className="text-lg" /> Salida Stock
                    </button>

                    <div className="h-px bg-zinc-200 my-1 mx-2" />

                    <button
                        onClick={(e) => { e.stopPropagation(); setPopoverEvent(null); openEditModal(item); }}
                        className="!flex !items-center !gap-3 !w-full !px-3 !py-2.5 !text-left !text-[0.85rem] !font-bold !text-primary hover:!bg-primary/10 !rounded-xl !transition-colors"
                    >
                        <IonIcon icon={eye} className="text-lg" /> Ver/Editar
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setPopoverEvent(null); }}
                        className="!flex !items-center !gap-3 !w-full !px-3 !py-2.5 !text-left !text-[0.85rem] !font-bold !text-zinc-500 hover:!bg-zinc-100 !rounded-xl !transition-colors"
                    >
                        <IonIcon icon={eyeOff} className="text-lg" /> Ocultar
                    </button>

                    {isAdmin && (
                        <>
                            <div className="h-px bg-zinc-200 my-1 mx-2" />
                            <button
                                onClick={(e) => { e.stopPropagation(); setPopoverEvent(null); handleDelete(item._id); }}
                                className="!flex !items-center !gap-3 !w-full !px-3 !py-2.5 !text-left !text-[0.85rem] !font-bold !text-danger hover:!bg-danger/10 !rounded-xl !transition-colors"
                            >
                                <IonIcon icon={trash} className="text-lg" /> Eliminar
                            </button>
                        </>
                    )}
                </div>
            </IonPopover>
        </motion.div>
    );
};

export default InventarioItemCard;
