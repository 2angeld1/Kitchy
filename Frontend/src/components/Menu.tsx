import React from 'react';
import {
    IonMenu,
    IonContent,
    IonIcon,
    IonToggle
} from '@ionic/react';
import {
    homeOutline,
    cartOutline,
    cubeOutline,
    restaurantOutline,
    peopleOutline,
    logOutOutline,
    sunnyOutline,
    moonOutline,
    chevronForward,
    colorPaletteOutline
} from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { menuController } from '@ionic/core/components';
import { motion } from 'framer-motion';

const Menu: React.FC = () => {
    const { user, logout, isAdmin } = useAuth();
    const history = useHistory();
    const location = useLocation();

    const menuItems = [
        { title: 'Dashboard', path: '/dashboard', icon: homeOutline, description: 'Resumen general', color: 'text-primary' },
        { title: 'Ventas', path: '/ventas', icon: cartOutline, description: 'Punto de venta', color: 'text-success' },
        { title: 'Inventario', path: '/inventario', icon: cubeOutline, description: 'Control de stock', color: 'text-warning' },
    ];

    const adminItems = [
        { title: 'Productos', path: '/productos', icon: restaurantOutline, description: 'Catálogo', color: 'text-secondary' },
        { title: 'Usuarios', path: '/usuarios', icon: peopleOutline, description: 'Gestión de acceso', color: 'text-indigo-500' },
        { title: 'Menú Público', path: '/configuracion-menu', icon: colorPaletteOutline, description: 'Personalizar página', color: 'text-pink-500' },
    ];

    const navigateTo = async (path: string) => {
        await menuController.close();
        history.push(path);
    };

    const handleLogout = async () => {
        await menuController.close();
        logout();
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <IonMenu contentId="main-content" type="overlay" style={{ '--background': 'transparent' }}>
            <IonContent className="ion-padding" style={{ '--background': 'var(--ion-background-color)' }}>
                <div className="flex flex-col h-full bg-[#fafafa]">

                    {/* Header / User Profile */}
                    <div className="shrink-0 p-4 flex flex-col items-center justify-center border-b border-zinc-200 relative overflow-hidden">
                        {/* Decorative background glow */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-shade shadow-xl shadow-primary/20 flex items-center justify-center text-2xl font-black text-white mb-3 z-10"
                        >
                            {user?.nombre?.charAt(0).toUpperCase()}
                        </motion.div>

                        <div className="text-center z-10">
                            <h2 className="text-lg font-black text-zinc-900 tracking-tight leading-none mb-1">
                                {user?.nombre || 'Usuario Kitchy'}
                            </h2>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.65rem] font-black uppercase tracking-widest bg-zinc-100 text-zinc-600">
                                {user?.rol || 'Staff'}
                            </span>
                        </div>

                        {/* Logout Button (Moved up for priority) */}
                        <button
                            onClick={handleLogout}
                            className="!mt-4 !w-full !flex !items-center !justify-center !gap-2 !p-2.5 !rounded-xl !text-danger hover:!bg-danger/10 !border !border-transparent hover:!border-danger/20 active:!scale-95 !transition-all !duration-200 !font-bold !text-xs !z-10"
                        >
                            <IonIcon icon={logOutOutline} className="text-base" />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>

                    {/* Scrollable Navigation */}
                    <div className="flex-1 overflow-y-auto w-full px-4 py-6 space-y-8 no-scrollbar">

                        {/* Main Menu */}
                        <div className="space-y-2">
                            <span className="px-3 text-[0.65rem] font-bold tracking-widest uppercase text-zinc-400">
                                Menú Principal
                            </span>
                            <div className="space-y-3">
                                {menuItems.map((item, index) => {
                                    const active = isActive(item.path);
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => navigateTo(item.path)}
                                            className={`w-full group flex items-center gap-4 p-3 !rounded-2xl transition-all duration-300 ease-out active:scale-95 ${active
                                                ? '!bg-white shadow-sm border border-zinc-200/50 !rounded-2xl'
                                                : 'hover:!bg-zinc-100 border border-transparent !rounded-2xl'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 !rounded-xl flex items-center justify-center transition-colors ${active ? `bg-primary/20 ${item.color}` : 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200'
                                                }`}>
                                                <IonIcon icon={item.icon} className="text-xl" />
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <div className={`text-sm font-bold truncate transition-colors ${active ? 'text-zinc-900' : 'text-zinc-600 group-hover:text-zinc-900'}`}>
                                                    {item.title}
                                                </div>
                                                <div className="text-[0.65rem] font-semibold text-zinc-400 truncate">
                                                    {item.description}
                                                </div>
                                            </div>
                                            {active && (
                                                <motion.div layoutId="activeMenuIndicator" className="w-1.5 h-6 rounded-full bg-primary" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Admin Menu */}
                        {isAdmin && (
                            <div className="space-y-2">
                                <span className="px-3 text-[0.65rem] font-bold tracking-widest uppercase text-primary/70">
                                    Administración
                                </span>
                                <div className="space-y-3">
                                    {adminItems.map((item, index) => {
                                        const active = isActive(item.path);
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => navigateTo(item.path)}
                                                className={`w-full group flex items-center gap-4 p-3 !rounded-2xl transition-all duration-300 ease-out active:scale-95 ${active
                                                    ? '!bg-white shadow-sm border border-zinc-200/50 !rounded-2xl'
                                                    : 'hover:!bg-zinc-100 border border-transparent !rounded-2xl'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 !rounded-xl flex items-center justify-center transition-colors ${active ? `bg-primary/20 ${item.color}` : 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200'
                                                    }`}>
                                                    <IonIcon icon={item.icon} className="text-xl" />
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <div className={`text-sm font-bold truncate transition-colors ${active ? 'text-zinc-900' : 'text-zinc-600 group-hover:text-zinc-900'}`}>
                                                        {item.title}
                                                    </div>
                                                    <div className="text-[0.65rem] font-semibold text-zinc-400 truncate">
                                                        {item.description}
                                                    </div>
                                                </div>
                                                {active && (
                                                    <motion.div layoutId="activeMenuIndicator" className="w-1.5 h-6 rounded-full bg-primary" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </IonContent>
        </IonMenu >
    );
};

export default Menu;
