import React from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonLoading,
    IonToast,
    IonButtons,
    IonMenuButton,
    IonRefresher,
    IonRefresherContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge
} from '@ionic/react';
import {
    cashOutline,
    cartOutline,
    trendingUpOutline,
    alertCircleOutline,
    cubeOutline,
    statsChartOutline
} from 'ionicons/icons';
import { getDashboard } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';

const Dashboard: React.FC = () => {
    const { data, loading, error, handleRefresh, clearError } = useDashboard();
    const { user } = useAuth();

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Dashboard</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                <div className="dashboard-container">
                    <h2 className="greeting">¡Hola, {user?.nombre}!</h2>

                    {data && (
                        <>
                            {/* Datos Históricos (Solo Admin) */}
                            {data.historico && (
                                <div className="historico-section">
                                    <h3 style={{ padding: '0 8px', margin: '0 0 8px', fontSize: '1rem', fontWeight: 600, color: 'var(--ion-color-medium)' }}>Resumen Histórico</h3>
                                    <IonGrid style={{ padding: 0 }}>
                                        <IonRow>
                                            <IonCol size="6">
                                                <IonCard className="stat-card" style={{ '--background': 'var(--ion-color-secondary)', margin: '0 0 16px 0' }}>
                                                    <IonCardContent>
                                                        <IonIcon icon={cashOutline} style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }} />
                                                        <p className="stat-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Ventas Totales</p>
                                                        <h3 style={{ color: 'white' }}>${parseFloat(data.historico.ventasTotal).toFixed(2)}</h3>
                                                        <span className="stat-sub" style={{ color: 'rgba(255,255,255,0.8)' }}>{data.historico.cantidadTotal} ventas</span>
                                                    </IonCardContent>
                                                </IonCard>
                                            </IonCol>
                                            <IonCol size="6">
                                                <IonCard className="stat-card" style={{ '--background': 'var(--ion-color-success)', margin: '0 0 16px 0' }}>
                                                    <IonCardContent>
                                                        <IonIcon icon={trendingUpOutline} style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }} />
                                                        <p className="stat-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Ganancia Total</p>
                                                        <h3 style={{ color: 'white' }}>${parseFloat(data.historico.gananciaTotal).toFixed(2)}</h3>
                                                        <span className="stat-sub" style={{ color: 'rgba(255,255,255,0.8)' }}>Neto</span>
                                                    </IonCardContent>
                                                </IonCard>
                                            </IonCol>
                                        </IonRow>
                                    </IonGrid>
                                </div>
                            )}

                            {/* Stats Cards */}
                            <IonGrid>
                                <IonRow>
                                    <IonCol size="6">
                                        <IonCard className="stat-card ventas-hoy">
                                            <IonCardContent>
                                                <IonIcon icon={cashOutline} />
                                                <p className="stat-label">Ventas Hoy</p>
                                                <h3>${data.ventas.hoy.total.toFixed(2)}</h3>
                                                <span className="stat-sub">{data.ventas.hoy.cantidad} ventas</span>
                                            </IonCardContent>
                                        </IonCard>
                                    </IonCol>
                                    <IonCol size="6">
                                        <IonCard className="stat-card ventas-mes">
                                            <IonCardContent>
                                                <IonIcon icon={statsChartOutline} />
                                                <p className="stat-label">Ventas Mes</p>
                                                <h3>${parseFloat(data.finanzas.ingresosMes).toFixed(2)}</h3>
                                                <span className="stat-sub">{data.ventas.mes.cantidad} ventas</span>
                                            </IonCardContent>
                                        </IonCard>
                                    </IonCol>
                                </IonRow>
                                <IonRow>
                                    <IonCol size="6">
                                        <IonCard className="stat-card ganancia">
                                            <IonCardContent>
                                                <IonIcon icon={trendingUpOutline} />
                                                <p className="stat-label">Ganancia Mes</p>
                                                <h3>${parseFloat(data.finanzas.gananciaMes).toFixed(2)}</h3>
                                                <span className="stat-sub">Neto</span>
                                            </IonCardContent>
                                        </IonCard>
                                    </IonCol>
                                    <IonCol size="6">
                                        <IonCard className="stat-card inventario">
                                            <IonCardContent>
                                                <IonIcon icon={cubeOutline} />
                                                <p className="stat-label">Inventario</p>
                                                <h3>{data.inventario.totalItems}</h3>
                                                {data.inventario.itemsStockBajo > 0 && (
                                                    <IonBadge color="warning">
                                                        {data.inventario.itemsStockBajo} bajo stock
                                                    </IonBadge>
                                                )}
                                            </IonCardContent>
                                        </IonCard>
                                    </IonCol>
                                </IonRow>
                            </IonGrid>

                            {/* Productos más vendidos */}
                            <IonCard className="section-card">
                                <IonCardHeader>
                                    <IonCardTitle>
                                        <IonIcon icon={cartOutline} /> Más Vendidos
                                    </IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    {data.productosMasVendidos.length > 0 ? (
                                        <IonList>
                                            {data.productosMasVendidos.map((producto, index) => (
                                                <IonItem key={index}>
                                                    <IonLabel>
                                                        <h3>{producto.nombre}</h3>
                                                        <p>{producto.cantidad} vendidos</p>
                                                    </IonLabel>
                                                    <IonBadge color="primary" slot="end">
                                                        ${producto.total.toFixed(2)}
                                                    </IonBadge>
                                                </IonItem>
                                            ))}
                                        </IonList>
                                    ) : (
                                        <p className="no-data">No hay datos de ventas aún</p>
                                    )}
                                </IonCardContent>
                            </IonCard>

                            {/* Ventas últimos 7 días */}
                            <IonCard className="section-card">
                                <IonCardHeader>
                                    <IonCardTitle>
                                        <IonIcon icon={statsChartOutline} /> Últimos 7 Días
                                    </IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <div className="chart-container">
                                        {data.ventasUltimos7Dias.map((dia, index) => {
                                            const maxTotal = Math.max(...data.ventasUltimos7Dias.map(d => d.total));
                                            const height = maxTotal > 0 ? (dia.total / maxTotal) * 100 : 0;
                                            return (
                                                <div key={index} className="chart-bar-container">
                                                    <div
                                                        className="chart-bar"
                                                        style={{ height: `${Math.max(height, 5)}%` }}
                                                    >
                                                        <span className="chart-value">${dia.total.toFixed(0)}</span>
                                                    </div>
                                                    <span className="chart-label">
                                                        {new Date(dia.fecha).toLocaleDateString('es', { weekday: 'short' })}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </IonCardContent>
                            </IonCard>

                            {/* Métodos de Pago (Nuevo) */}
                            <IonCard className="section-card">
                                <IonCardHeader>
                                    <IonCardTitle>
                                        <IonIcon icon={cashOutline} /> Métodos de Pago (Mes)
                                    </IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    {data.metodosPago && data.metodosPago.length > 0 ? (
                                        <div className="payment-methods-grid">
                                            {data.metodosPago.map((metodo, index) => (
                                                <div key={index} className={`payment-method-item ${metodo.metodo.toLowerCase()}`}>
                                                    <div className="method-info">
                                                        <span className="method-name">
                                                            {metodo.metodo === 'yappy' ? 'Yappy 💸' : 'Efectivo 💵'}
                                                        </span>
                                                        <span className="method-total">${metodo.total.toFixed(2)}</span>
                                                    </div>
                                                    <div className="method-bar-bg">
                                                        <div
                                                            className="method-bar-fill"
                                                            style={{ width: `${metodo.porcentaje}%`, backgroundColor: metodo.metodo === 'yappy' ? 'var(--ion-color-secondary)' : 'var(--ion-color-success)' }}
                                                        ></div>
                                                    </div>
                                                    <div className="method-stats">
                                                        <small>{metodo.cantidad} ventas</small>
                                                        <small>{metodo.porcentaje.toFixed(1)}%</small>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="no-data">No hay datos de pagos aún</p>
                                    )}
                                </IonCardContent>
                            </IonCard>
                        </>
                    )}
                </div>

                <IonLoading isOpen={loading} message="Cargando..." />
                <IonToast isOpen={!!error} message={error} duration={3000} color="danger" onDidDismiss={clearError} />
            </IonContent>
        </IonPage>
    );
};

export default Dashboard;
