import React, { useState } from 'react';
import {
    IonPage,
    IonContent,
    IonLoading,
    IonToast,
    IonRefresher,
    IonRefresherContent,
    IonPopover,
    IonIcon
} from '@ionic/react';
import {
    searchOutline,
    ellipsisVertical,
    trash,
    personCircle,
    shieldCheckmark,
    person,
    shield
} from 'ionicons/icons';
import { useUsuarios } from '../hooks/useUsuarios';
import KitchyToolbar from '../components/KitchyToolbar';
import { motion, AnimatePresence } from 'framer-motion';
import { slideUp, listItemVariant } from '../animations/variants';

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

    const [popoverEvent, setPopoverEvent] = useState<{ event: Event | null, id: string | null }>({ event: null, id: null });
    const [rolePopoverEvent, setRolePopoverEvent] = useState<{ event: Event | null, id: string | null }>({ event: null, id: null });

    const getRoleBadgeInfo = (rol: string) => {
        switch (rol) {
            case 'superadmin':
                return { text: 'Super Admin', classes: 'bg-danger/10 text-danger border-danger/20', icon: shield };
            case 'admin':
                return { text: 'Admin', classes: 'bg-primary/10 text-primary border-primary/20', icon: shieldCheckmark };
            default:
                return { text: 'Usuario', classes: 'bg-zinc-200/50 text-zinc-600 border-zinc-200', icon: person };
        }
    };

    const getInitial = (name: string) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    return (
        <IonPage className="bg-[#fafafa]" style={{ background: 'var(--ion-background-color)' }}>
            <KitchyToolbar title="Usuarios" />

            <IonContent style={{ '--background': 'transparent' }}>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                <div className="max-w-3xl mx-auto px-4 pt-6 pb-24 space-y-6">
                    {/* Search Bar */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Buscar usuario..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full bg-white backdrop-blur-xl border border-zinc-200 rounded-2xl pl-11 pr-4 py-3.5 text-base font-bold text-zinc-800 placeholder:text-zinc-400 focus:ring-4 ring-primary/10 outline-none shadow-sm transition-all"
                            />
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                <IonIcon icon={searchOutline} className="text-zinc-400 text-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="bg-zinc-50/50 backdrop-blur-3xl border border-zinc-200 rounded-3xl overflow-hidden shadow-sm !p-0">
                        <AnimatePresence mode="popLayout">
                            {usuariosFiltrados.map((usuario, index) => {
                                const roleInfo = getRoleBadgeInfo(usuario.rol);
                                const isCurrentUser = usuario._id === currentUser?.id;

                                return (
                                    <motion.div
                                        variants={listItemVariant}
                                        initial="initial"
                                        animate="animate"
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        layout
                                        key={usuario._id}
                                        className={`group flex items-center w-full px-4 py-3 bg-transparent transition-colors hover:bg-zinc-50 cursor-default ${index !== usuariosFiltrados.length - 1 ? 'border-b border-zinc-100' : ''}`}
                                    >
                                        <div className="flex items-center gap-4 w-full">
                                            {/* Avatar Area */}
                                            <div className="w-12 h-12 flex-shrink-0 rounded-[14px] bg-primary/10 flex flex-col items-center justify-center overflow-hidden border border-primary/20 group-hover:scale-110 transition-transform">
                                                <span className="text-xl font-black text-primary leading-none">
                                                    {getInitial(usuario.nombre)}
                                                </span>
                                            </div>

                                            {/* User Info Area */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                                                <div className="flex items-center gap-2">
                                                    <h2 className="!text-[1.1rem] font-black text-zinc-900 truncate leading-none">
                                                        {usuario.nombre}
                                                    </h2>
                                                    {isCurrentUser && (
                                                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                                                            Tú
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[0.65rem] font-bold text-zinc-500 uppercase tracking-widest mt-1.5 truncate">
                                                    {usuario.email}
                                                </p>
                                            </div>

                                            {/* Role Badge Area */}
                                            <div className="flex flex-col flex-shrink-0 items-end justify-center mr-2">
                                                <div
                                                    className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${roleInfo.classes}`}
                                                >
                                                    <IonIcon icon={roleInfo.icon} className="text-[11px]" />
                                                    {roleInfo.text}
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <button
                                                className="p-2 -mr-2 text-zinc-400 hover:text-zinc-800 transition-colors rounded-full active:scale-95 hover:bg-zinc-100"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPopoverEvent({ event: e.nativeEvent, id: usuario._id });
                                                }}
                                            >
                                                <IonIcon icon={ellipsisVertical} className="text-xl block" />
                                            </button>
                                        </div>

                                        {/* Action Menu (Popover) - Main Actions */}
                                        <IonPopover
                                            isOpen={popoverEvent.id === usuario._id}
                                            event={popoverEvent.event}
                                            onDidDismiss={() => setPopoverEvent({ event: null, id: null })}
                                            className="kitchy-action-popover"
                                        >
                                            <div className="bg-white/95 backdrop-blur-xl p-1.5 flex flex-col min-w-[160px] rounded-2xl shadow-xl border border-zinc-200">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Open role popover from this same event location
                                                        const eventForRole = popoverEvent.event;
                                                        setPopoverEvent({ event: null, id: null });
                                                        setTimeout(() => {
                                                            if (eventForRole) {
                                                                setRolePopoverEvent({ event: eventForRole, id: usuario._id });
                                                            }
                                                        }, 50);
                                                    }}
                                                    disabled={isCurrentUser}
                                                    className={`!flex !items-center !gap-3 !w-full !px-3 !py-2.5 !text-left !text-[0.85rem] !font-bold !rounded-xl !transition-colors ${isCurrentUser ? '!text-zinc-300' : '!text-primary hover:!bg-primary/10'}`}
                                                >
                                                    <IonIcon icon={shieldCheckmark} className="text-lg" />
                                                    Cambiar Rol
                                                </button>

                                                <div className="h-px bg-zinc-200 my-1 mx-2" />

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPopoverEvent({ event: null, id: null });
                                                        if (!isCurrentUser) {
                                                            handleDelete(usuario._id);
                                                        }
                                                    }}
                                                    disabled={isCurrentUser}
                                                    className={`!flex !items-center !gap-3 !w-full !px-3 !py-2.5 !text-left !text-[0.85rem] !font-bold !rounded-xl !transition-colors ${isCurrentUser ? '!text-zinc-300' : '!text-danger hover:!bg-danger/10'}`}
                                                >
                                                    <IonIcon icon={trash} className="text-lg" />
                                                    Eliminar Usuario
                                                </button>
                                            </div>
                                        </IonPopover>

                                        {/* Action Menu (Popover) - Change Role */}
                                        <IonPopover
                                            isOpen={rolePopoverEvent.id === usuario._id}
                                            event={rolePopoverEvent.event}
                                            onDidDismiss={() => setRolePopoverEvent({ event: null, id: null })}
                                            className="kitchy-action-popover"
                                        >
                                            <div className="bg-white/95 backdrop-blur-xl p-1.5 flex flex-col min-w-[170px] rounded-2xl shadow-xl border border-zinc-200">
                                                <div className="px-3 py-2">
                                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                                        Seleccionar Rol
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={() => { handleChangeRole(usuario._id, 'usuario'); setRolePopoverEvent({ event: null, id: null }); }}
                                                    className={`!flex !items-center !gap-3 !w-full !px-3 !py-2.5 !text-left !text-[0.85rem] !font-bold !rounded-xl !transition-colors ${usuario.rol === 'usuario' ? '!bg-zinc-100 !text-zinc-900' : '!text-zinc-600 hover:!bg-zinc-50'}`}
                                                >
                                                    <IonIcon icon={person} className="text-lg" /> Usuario
                                                </button>

                                                <button
                                                    onClick={() => { handleChangeRole(usuario._id, 'admin'); setRolePopoverEvent({ event: null, id: null }); }}
                                                    className={`!flex !items-center !gap-3 !w-full !px-3 !py-2.5 !text-left !text-[0.85rem] !font-bold !rounded-xl !transition-colors ${usuario.rol === 'admin' ? '!bg-primary/10 !text-primary' : '!text-zinc-600 hover:!bg-primary/5 hover:!text-primary'}`}
                                                >
                                                    <IonIcon icon={shieldCheckmark} className="text-lg" /> Administrador
                                                </button>

                                                <button
                                                    onClick={() => { handleChangeRole(usuario._id, 'superadmin'); setRolePopoverEvent({ event: null, id: null }); }}
                                                    className={`!flex !items-center !gap-3 !w-full !px-3 !py-2.5 !text-left !text-[0.85rem] !font-bold !rounded-xl !transition-colors ${usuario.rol === 'superadmin' ? '!bg-danger/10 !text-danger' : '!text-zinc-600 hover:!bg-danger/5 hover:!text-danger'}`}
                                                >
                                                    <IonIcon icon={shield} className="text-lg" /> Super Admin
                                                </button>
                                            </div>
                                        </IonPopover>

                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Empty State */}
                    {usuariosFiltrados.length === 0 && !loading && (
                        <motion.div variants={slideUp} initial="initial" animate="animate" className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                                <IonIcon icon={personCircle} className="text-4xl" />
                            </div>
                            <h3 className="text-lg font-black text-zinc-800 mb-1">Sin Resultados</h3>
                            <p className="text-sm font-medium text-zinc-500 mb-6 max-w-[250px]">No hemos encontrado usuarios con esa búsqueda.</p>
                        </motion.div>
                    )}
                </div>

                {/* Status Overlays */}
                <IonLoading isOpen={loading} message="Procesando..." spinner="crescent" />
                <IonToast isOpen={!!error} message={error} duration={3000} color="danger" onDidDismiss={clearError} />
                <IonToast isOpen={!!success} message={success} duration={2000} color="success" onDidDismiss={clearSuccess} />
            </IonContent>
        </IonPage>
    );
};

export default Usuarios;
