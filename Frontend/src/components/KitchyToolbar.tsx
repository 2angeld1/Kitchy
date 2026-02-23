import React, { useState } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, IonIcon, IonPopover, IonModal } from '@ionic/react';
import { notificationsOutline, personCircleOutline, logOutOutline, settingsOutline } from 'ionicons/icons';
import { motion } from 'framer-motion';
import { menuController } from '@ionic/core/components';
import { useAuth } from '../context/AuthContext';

interface KitchyToolbarProps {
    title: string;
    showNotifications?: boolean;
    showProfile?: boolean;
    onNotificationsClick?: () => void;
    extraButtons?: React.ReactNode;
}

const KitchyToolbar: React.FC<KitchyToolbarProps> = ({
    title,
    showNotifications = true,
    showProfile = true,
    onNotificationsClick,
    extraButtons
}) => {
    const { user, logout } = useAuth();
    const [popoverEvent, setPopoverEvent] = useState<any>(null);
    const [showNotifModal, setShowNotifModal] = useState(false);

    const handleLogout = async () => {
        setPopoverEvent(null);
        logout();
    };

    const handleNotifClick = (e: any) => {
        if (onNotificationsClick) {
            onNotificationsClick();
        } else {
            setShowNotifModal(true);
        }
    };

    return (
        <IonHeader className="ion-no-border z-50">
            {/* Base Glass Layer with slight Primary Tint */}
            <div className="absolute inset-0 bg-white/90 backdrop-blur-xl pointer-events-none" />
            <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none" />

            {/* Branded Accent Line */}
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none" />

            {/* Subtle Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-primary/20 blur-[1px] pointer-events-none" />

            <IonToolbar style={{ '--background': 'transparent', '--border-style': 'none' }} className="px-2 relative">
                <IonButtons slot="start">
                    <motion.div whileTap={{ scale: 0.9 }}>
                        <button
                            onClick={() => menuController.open('start')}
                            className="w-10 h-10 flex items-center justify-center rounded-xl text-primary active:bg-primary/10 transition-colors"
                        >
                            <IonMenuButton className="pointer-events-none" />
                        </button>
                    </motion.div>
                </IonButtons>

                <IonTitle className="!font-black !text-2xl !tracking-tighter !text-primary !p-0">
                    {title}
                </IonTitle>

                <IonButtons slot="end" className="gap-1">
                    {extraButtons}

                    {showNotifications && (
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleNotifClick}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-400 relative"
                        >
                            <IonIcon icon={notificationsOutline} className="text-xl" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-zinc-950" />
                        </motion.button>
                    )}

                    {showProfile && (
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => setPopoverEvent(e.nativeEvent)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-400"
                        >
                            <IonIcon icon={personCircleOutline} className="text-xl" />
                        </motion.button>
                    )}
                </IonButtons>
            </IonToolbar>

            {/* User Profile Panel Popover */}
            <IonPopover
                isOpen={Boolean(popoverEvent)}
                event={popoverEvent}
                onDidDismiss={() => setPopoverEvent(null)}
                className="kitchy-action-popover"
            >
                <div className="p-4 bg-white backdrop-blur-xl flex flex-col min-w-[220px] rounded-2xl border border-zinc-200 shadow-2xl">
                    {/* User Header */}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-zinc-100">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-shade flex items-center justify-center text-white text-xl font-black shadow-lg shadow-primary/20">
                            {user?.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-zinc-950 truncate leading-none mb-1">
                                {user?.nombre}
                            </h3>
                            <span className="text-[0.6rem] font-black uppercase tracking-widest text-zinc-400">
                                {user?.rol}
                            </span>
                        </div>
                    </div>

                    {/* Quick Settings */}
                    <div className="space-y-1 mb-3">
                        <button className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-100 text-zinc-600 transition-colors">
                            <IonIcon icon={settingsOutline} className="text-lg" />
                            <span className="text-xs font-bold">Mi Configuración</span>
                        </button>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="!w-full !flex !items-center !gap-3 !p-3 !rounded-xl !bg-danger/10 !text-danger hover:!bg-danger/20 !transition-all active:!scale-95 !text-xs !font-black"
                    >
                        <IonIcon icon={logOutOutline} className="text-base" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </IonPopover>

            {/* Notifications Panel Modal (Sheet) */}
            <IonModal
                isOpen={showNotifModal}
                onDidDismiss={() => setShowNotifModal(false)}
                initialBreakpoint={0.5}
                breakpoints={[0, 0.5, 0.9]}
                className="kitchy-sheet-modal"
            >
                <div className="flex flex-col h-full bg-[#fafafa]">
                    <div className="px-6 py-4 flex flex-col gap-2 border-b border-zinc-100 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-zinc-950 tracking-tight">Notificaciones</h2>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">2 Alertas nuevas</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="!px-3 !py-1.5 !rounded-lg !bg-primary/10 !text-primary text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                                    Marcar Leídas
                                </button>
                                <button
                                    onClick={() => setShowNotifModal(false)}
                                    className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold ml-2"
                                >
                                    <span className="text-lg">×</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {/* Notification Item 1 */}
                        <div className="p-4 rounded-3xl bg-white border border-zinc-200 shadow-sm flex gap-4 items-start">
                            <div className="w-12 h-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
                                <IonIcon icon={settingsOutline} className="text-2xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-sm font-black text-zinc-900">Stock Crítico</h4>
                                    <span className="text-[9px] font-bold text-zinc-400">AHORA</span>
                                </div>
                                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                                    El producto <span className="text-zinc-950 font-bold">Hamburguesa Clásica</span> ha bajado de 5 unidades. Repón el stock pronto.
                                </p>
                            </div>
                        </div>

                        {/* Notification Item 2 */}
                        <div className="p-4 rounded-3xl bg-white border border-zinc-200 shadow-sm flex gap-4 items-start">
                            <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center shrink-0">
                                <IonIcon icon={personCircleOutline} className="text-2xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-sm font-black text-zinc-900">Ventas del Día</h4>
                                    <span className="text-[9px] font-bold text-zinc-400">HACE 1H</span>
                                </div>
                                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                                    ¡Excelente ritmo! Has superado el promedio de ventas de los lunes anteriores. 🚀
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </IonModal>
        </IonHeader>
    );
};

export default KitchyToolbar;
