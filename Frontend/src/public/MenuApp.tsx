import React, { useState, useEffect } from 'react';
import {
    IonPage,
    IonContent,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonModal,
    IonIcon,
    IonButton
} from '@ionic/react';
import { closeOutline, add, heart, call, searchOutline, settingsOutline } from 'ionicons/icons';
import { getProductos, getMenuConfig } from '../services/api';
import { Producto } from '../hooks/useProductos';
import { optimizeImageUrl } from '../utils/imageUtils';
import './menu.scss';

interface MenuConfigData {
    nombreRestaurante: string;
    subtitulo: string;
    tema: string;
    colorPrimario: string;
    colorSecundario: string;
    imagenHero?: string;
    telefono: string;
    direccion?: string;
    horario?: string;
}

const MenuApp: React.FC = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('todos');
    const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
    const [config, setConfig] = useState<MenuConfigData>({
        nombreRestaurante: 'Food Menu',
        subtitulo: 'Restaurant & Bar',
        tema: 'paper',
        colorPrimario: '#c92c2c',
        colorSecundario: '#d4af37',
        telefono: '+000-000-0000'
    });

    useEffect(() => {
        cargarMenu();
    }, []);

    const cargarMenu = async () => {
        setLoading(true);
        try {
            // Load products and config in parallel
            const [productosRes, configRes] = await Promise.all([
                getProductos({ disponible: true }),
                getMenuConfig()
            ]);
            setProductos(productosRes.data.filter((p: Producto) => p.disponible));
            setConfig(configRes.data);
        } catch (error) {
            console.error('Error cargando menú:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async (event: CustomEvent) => {
        await cargarMenu();
        event.detail.complete();
    };

    const categorias = ['todos', 'comida', 'bebida', 'postre'];

    const filteredProducts = activeCategory === 'todos' 
        ? productos 
        : productos.filter(p => p.categoria === activeCategory);

    // Dynamic CSS variables based on config
    const dynamicStyles = {
        '--accent-red': config.colorPrimario,
        '--accent-gold': config.colorSecundario,
        '--primary': config.colorPrimario, // For modern theme
        '--gold': config.colorSecundario // For minimal theme
    } as React.CSSProperties;

    return (
        <IonPage className={`menu-app menu-theme-${config.tema}`} style={dynamicStyles}>
            <IonContent fullscreen>
                {/* The Physical Paper Sheet Container */}
                <div className="paper-sheet">
                    <div className="sheet-content">
                        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                            <IonRefresherContent />
                        </IonRefresher>

                        {/* Menu Header with Brand & Featured Dish */}
                        <div className="menu-header">
                            {config.tema === 'minimal' && (
                                <div className="user-welcome">
                                    <div className="user-avatar">
                                        <img src="https://i.pravatar.cc/100?u=kitbase" alt="User" />
                                    </div>
                                    <div className="user-info">
                                        <p>Hi, {config.nombreRestaurante}</p>
                                    </div>
                                    <IonIcon icon={settingsOutline} className="settings-icon" />
                                </div>
                            )}

                            <h1 className="brand-title">
                                {config.tema === 'minimal' ? 'Find and Order Food for You 🥘' : config.nombreRestaurante}
                            </h1>
                            <span className="brand-subtitle">{config.subtitulo}</span>
                            
                            {config.tema === 'minimal' && (
                                <div className="search-bar">
                                    <IonIcon icon={searchOutline} />
                                    <input type="text" placeholder="Search Your Food" readOnly />
                                    <IonIcon icon={settingsOutline} className="filter-icon" />
                                </div>
                            )}
                            
                            {/* Featured Dish (Hero Section) */}
                            <div className="main-dish-circle">
                                {config.tema === 'tasty' ? (
                                    <>
                                        <div className="dish-img-wrapper">
                                            <img 
                                                src={optimizeImageUrl(config.imagenHero || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38", 600, 400)} 
                                                alt="Special" 
                                            />
                                        </div>
                                        
                                        <div className="courier-card">
                                            <div className="courier-avatar">
                                                <img src="https://i.pravatar.cc/100?u=richard" alt="Courier" />
                                            </div>
                                            <div className="courier-info">
                                                <p className="courier-name">Richard Wastson</p>
                                                <p className="courier-role">Food Courier</p>
                                            </div>
                                            <a href={`tel:${config.telefono}`} className="courier-call-btn">
                                                <IonIcon icon={call} />
                                            </a>
                                        </div>
                                    </>
                                ) : (
                                    <img 
                                            src={optimizeImageUrl(config.imagenHero || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38", 600, 400)} 
                                        alt="Special" 
                                    />
                                )}
                                
                                <div className="price-sticker">
                                    <span>20%</span>
                                </div>
                            </div>
                        </div>

                        {/* Paper Navigation Tabs */}
                        <div className="paper-tabs">
                            <span 
                                className={`paper-tab ${activeCategory === 'todos' ? 'active' : ''}`}
                                onClick={() => setActiveCategory('todos')}
                            >
                                Todos
                            </span>
                            {categorias.filter(c => c !== 'todos').map(cat => (
                                <span 
                                    key={cat}
                                    className={`paper-tab ${activeCategory === cat ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </span>
                            ))}
                        </div>

                        {/* Classic List Layout */}
                        <div className="menu-list">
                            {filteredProducts.map(item => (
                                <div 
                                    className="menu-item-row" 
                                    key={item._id}
                                    onClick={() => setSelectedProduct(item)}
                                >
                                    <div className="item-details">
                                        <div className="item-header">
                                            <h3>{item.nombre}</h3>
                                            <span className="price">${item.precio.toFixed(2)}</span>
                                        </div>
                                        <p className="item-desc">{item.descripcion}</p>
                                    </div>
                                    {item.imagen && (
                                        <img 
                                            className="item-thumb"
                                            src={optimizeImageUrl(item.imagen, 150, 150)} 
                                            alt={item.nombre} 
                                            loading="lazy"
                                        />
                                    )}
                                </div>
                            ))}

                            {!loading && filteredProducts.length === 0 && (
                                <div className="ion-text-center ion-padding" style={{ opacity: 0.6, fontStyle: 'italic' }}>
                                    <p>No hay platos en esta sección hoy.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Contact */}
                        <div className="paper-footer">
                            <p>Call for Delivery</p>
                            <span className="phone-number">{config.telefono}</span>
                        </div>
                    </div>
                </div>

                {/* Loading Spinner Over Paper */}
                {loading && (
                    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 999 }}>
                        <IonSpinner name="crescent" color="dark" />
                    </div>
                )}

                {/* Product Detail Modal */}
                <IonModal 
                    isOpen={!!selectedProduct} 
                    onDidDismiss={() => setSelectedProduct(null)}
                    className="product-detail-modal"
                    initialBreakpoint={0.85}
                    breakpoints={[0, 0.85, 1]}
                >
                    <IonContent>
                        {selectedProduct && (
                            <>
                                <div className="close-button" onClick={() => setSelectedProduct(null)} style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, background: 'white', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                                    <IonIcon icon={closeOutline} color="dark" />
                                </div>
                                {selectedProduct.imagen && (
                                    <img 
                                        src={optimizeImageUrl(selectedProduct.imagen, 800, 800)} 
                                        className="detail-image" 
                                        style={{ width: '100%', height: '40vh', objectFit: 'cover' }}
                                        alt={selectedProduct.nombre} 
                                    />
                                )}
                                <div className="detail-content">
                                    <h2>{selectedProduct.nombre}</h2>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#c92c2c', display: 'block', marginBottom: 20 }}>
                                        ${selectedProduct.precio.toFixed(2)}
                                    </span>
                                    
                                    <p>{selectedProduct.descripcion}</p>
                                    
                                    {/* Tags can be added later when Producto model supports them */}

                                    <div style={{ marginTop: '40px' }}>
                                        <IonButton expand="block" color="dark" style={{ '--border-radius': '0', fontFamily: 'Merriweather' }}>
                                            ANADIR AL PEDIDO
                                        </IonButton>
                                    </div>
                                </div>
                            </>
                        )}
                    </IonContent>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default MenuApp;
