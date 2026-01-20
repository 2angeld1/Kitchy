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
    chevronForward
} from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { menuController } from '@ionic/core/components';

const Menu: React.FC = () => {
    const { user, logout, isAdmin } = useAuth();
    const { isDark, setTheme } = useTheme();
    const history = useHistory();
    const location = useLocation();

    const menuItems = [
        { title: 'Dashboard', path: '/dashboard', icon: homeOutline, description: 'Resumen general' },
        { title: 'Ventas', path: '/ventas', icon: cartOutline, description: 'Punto de venta' },
        { title: 'Inventario', path: '/inventario', icon: cubeOutline, description: 'Control de stock' },
    ];

    const adminItems = [
        { title: 'Productos', path: '/productos', icon: restaurantOutline, description: 'Catálogo' },
        { title: 'Usuarios', path: '/usuarios', icon: peopleOutline, description: 'Gestión de acceso' },
    ];

    const navigateTo = (path: string) => {
        menuController.close();
        history.push(path);
    };

    const handleLogout = async () => {
        await menuController.close();
        logout();
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <IonMenu contentId="main-content" type="overlay" className="custom-menu">
            <IonContent className="menu-content">
                {/* User Card */}
                <div className="menu-user-card">
                    <div className="user-avatar">
                        {user?.nombre?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                        <span className="user-name">{user?.nombre}</span>
                        <span className="user-role">{user?.rol}</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="menu-nav">
                    <div className="nav-section">
                        <span className="nav-section-title">Menú Principal</span>
                        {menuItems.map((item, index) => (
                            <button
                                key={index}
                                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                                onClick={() => navigateTo(item.path)}
                            >
                                <div className="nav-item-icon">
                                    <IonIcon icon={item.icon} />
                                </div>
                                <div className="nav-item-content">
                                    <span className="nav-item-title">{item.title}</span>
                                    <span className="nav-item-desc">{item.description}</span>
                                </div>
                                <IonIcon icon={chevronForward} className="nav-item-arrow" />
                            </button>
                        ))}
                    </div>

                    {isAdmin && (
                        <div className="nav-section">
                            <span className="nav-section-title">Administración</span>
                            {adminItems.map((item, index) => (
                                <button
                                    key={index}
                                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                                    onClick={() => navigateTo(item.path)}
                                >
                                    <div className="nav-item-icon">
                                        <IonIcon icon={item.icon} />
                                    </div>
                                    <div className="nav-item-content">
                                        <span className="nav-item-title">{item.title}</span>
                                        <span className="nav-item-desc">{item.description}</span>
                                    </div>
                                    <IonIcon icon={chevronForward} className="nav-item-arrow" />
                                </button>
                            ))}
                        </div>
                    )}
                </nav>

                {/* Footer */}
                <div className="menu-bottom">
                    {/* Theme Toggle */}
                    <div className="theme-toggle-container">
                        <div className="theme-toggle-info">
                            <IonIcon icon={isDark ? moonOutline : sunnyOutline} />
                            <span>{isDark ? 'Modo Oscuro' : 'Modo Claro'}</span>
                        </div>
                        <IonToggle
                            checked={isDark}
                            onIonChange={(e) => setTheme(e.detail.checked)}
                        />
                    </div>

                    {/* Logout */}
                    <button className="logout-button" onClick={handleLogout}>
                        <IonIcon icon={logOutOutline} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </IonContent>
        </IonMenu>
    );
};

export default Menu;
