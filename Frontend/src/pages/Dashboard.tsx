import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol, IonIcon, IonLoading, IonToast, IonButtons, IonMenuButton, IonRefresher, IonRefresherContent, IonList, IonItem, IonLabel, IonBadge } from '@ionic/react';
import { cashOutline, cartOutline, trendingUpOutline, alertCircleOutline, cubeOutline, statsChartOutline } from 'ionicons/icons';
import { getDashboard } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import KitchyToolbar from '../components/KitchyToolbar';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
    const { data, loading, error, handleRefresh, clearError } = useDashboard();
    const { user } = useAuth();

    return (
        <IonPage>
            <KitchyToolbar title="Dashboard" />

            <IonContent>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                <div className="dashboard-container !bg-[#fafafa]">
                    <h2 className="!text-zinc-900 !font-black !text-2xl !tracking-tight px-6 pt-6 -mb-2">¡Hola, {user?.nombre}! 👋</h2>

                    {data && (
                        <>
                            {/* Main Stats Grid */}
                            <IonGrid className="ion-no-padding px-4 mt-6">
                                {/* Datos Históricos (Solo Admin) */}
                                {data.historico && (
                                    <>
                                        <div className="flex items-center gap-2 mb-3 px-1.5">
                                            <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                                            <h3 className="text-sm font-black text-zinc-900 tracking-tight uppercase">Histórico Admin</h3>
                                        </div>
                                        <IonRow className="mb-4">
                                            <IonCol size="6" className="p-1.5">
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl h-full shadow-sm flex flex-col justify-between overflow-hidden relative"
                                                >
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                                                    <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-4 shrink-0 shadow-inner z-10">
                                                        <IonIcon icon={cashOutline} className="text-xl" />
                                                    </div>
                                                    <div className="z-10">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Ventas Totales</p>
                                                        <h3 className="text-2xl font-black text-white tracking-tight leading-none">${parseFloat(data.historico.ventasTotal).toFixed(0)}</h3>
                                                        <span className="text-[10px] font-bold text-zinc-500 mt-2 block">{data.historico.cantidadTotal} ventas</span>
                                                    </div>
                                                </motion.div>
                                            </IonCol>
                                            <IonCol size="6" className="p-1.5">
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.1 }}
                                                    className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl h-full shadow-sm flex flex-col justify-between overflow-hidden relative"
                                                >
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                                                    <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-4 shrink-0 shadow-inner z-10">
                                                        <IonIcon icon={trendingUpOutline} className="text-xl" />
                                                    </div>
                                                    <div className="z-10">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Ganancia Total</p>
                                                        <h3 className="text-2xl font-black text-white tracking-tight leading-none">${parseFloat(data.historico.gananciaTotal).toFixed(0)}</h3>
                                                        <span className="text-[10px] font-bold text-zinc-500 mt-2 block">Neto Histórico</span>
                                                    </div>
                                                </motion.div>
                                            </IonCol>
                                        </IonRow>
                                    </>
                                )}

                                {/* Daily/Monthly Stats */}
                                <IonRow>
                                    <IonCol size="6" className="p-1.5">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-white/70 backdrop-blur-xl border border-zinc-200/50 p-5 rounded-3xl h-full shadow-sm flex flex-col justify-between"
                                        >
                                            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 shrink-0 shadow-inner">
                                                <IonIcon icon={cashOutline} className="text-xl" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Ventas Hoy</p>
                                                <h3 className="text-2xl font-black text-zinc-950 tracking-tight leading-none">${data.ventas.hoy.total.toFixed(0)}</h3>
                                                <span className="text-[10px] font-bold text-zinc-500 mt-2 block">{data.ventas.hoy.cantidad} ventas</span>
                                            </div>
                                        </motion.div>
                                    </IonCol>
                                    <IonCol size="6" className="p-1.5">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.1 }}
                                            className="bg-white/70 backdrop-blur-xl border border-zinc-200/50 p-5 rounded-3xl h-full shadow-sm flex flex-col justify-between"
                                        >
                                            <div className="w-10 h-10 rounded-2xl bg-success/10 text-success flex items-center justify-center mb-4 shrink-0 shadow-inner">
                                                <IonIcon icon={statsChartOutline} className="text-xl" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Ventas Mes</p>
                                                <h3 className="text-2xl font-black text-zinc-950 tracking-tight leading-none">${parseFloat(data.finanzas.ingresosMes).toFixed(0)}</h3>
                                                <span className="text-[10px] font-bold text-zinc-500 mt-2 block">{data.ventas.mes.cantidad} ventas</span>
                                            </div>
                                        </motion.div>
                                    </IonCol>
                                </IonRow>
                                <IonRow>
                                    <IonCol size="6" className="p-1.5">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.2 }}
                                            className="bg-white/70 backdrop-blur-xl border border-zinc-200/50 p-5 rounded-3xl h-full shadow-sm flex flex-col justify-between"
                                        >
                                            <div className="w-10 h-10 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-4 shrink-0 shadow-inner">
                                                <IonIcon icon={trendingUpOutline} className="text-xl" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Ganancia Mes</p>
                                                <h3 className="text-2xl font-black text-zinc-950 tracking-tight leading-none">${parseFloat(data.finanzas.gananciaMes).toFixed(0)}</h3>
                                                <span className="text-[10px] font-bold text-zinc-500 mt-2 block">Neto Mes</span>
                                            </div>
                                        </motion.div>
                                    </IonCol>
                                    <IonCol size="6" className="p-1.5">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="bg-white/70 backdrop-blur-xl border border-zinc-200/50 p-5 rounded-3xl h-full shadow-sm flex flex-col justify-between"
                                        >
                                            <div className="w-10 h-10 rounded-2xl bg-warning/10 text-warning flex items-center justify-center mb-4 shrink-0 shadow-inner">
                                                <IonIcon icon={cubeOutline} className="text-xl" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Inventario</p>
                                                <h3 className="text-2xl font-black text-zinc-950 tracking-tight leading-none">{data.inventario.totalItems}</h3>
                                                {data.inventario.itemsStockBajo > 0 ? (
                                                    <span className="inline-flex mt-2 px-2 py-0.5 bg-warning/20 text-warning-shade text-[9px] font-black rounded-lg">
                                                        {data.inventario.itemsStockBajo} BAJO STOCK
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-zinc-500 mt-2 block">Total Items</span>
                                                )}
                                            </div>
                                        </motion.div>
                                    </IonCol>
                                </IonRow>
                            </IonGrid>

                            {/* Productos más vendidos */}
                            <div className="px-4 mt-2">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-white/70 backdrop-blur-xl border border-zinc-200/50 rounded-3xl overflow-hidden shadow-sm"
                                >
                                    <div className="p-5 border-b border-zinc-100/50 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                            <IonIcon icon={cartOutline} className="text-lg" />
                                        </div>
                                        <h3 className="text-sm font-black text-zinc-950 tracking-tight">Más Vendidos</h3>
                                    </div>
                                    <div className="p-2">
                                        {data.productosMasVendidos.length > 0 ? (
                                            <div className="space-y-1">
                                                {data.productosMasVendidos.map((producto, index) => (
                                                    <div key={index} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-50 transition-colors">
                                                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-lg font-bold">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-xs font-bold text-zinc-900 truncate">{producto.nombre}</h4>
                                                            <p className="text-[10px] text-zinc-500 font-medium">{producto.cantidad} unidades</p>
                                                        </div>
                                                        <div className="text-xs font-black text-primary bg-primary/10 px-3 py-1.5 rounded-xl">
                                                            ${producto.total.toFixed(2)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="p-8 text-center text-xs font-bold text-zinc-400">No hay datos de ventas aún</p>
                                        )}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Ventas últimos 7 días */}
                            <div className="px-4 mt-4">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-white/70 backdrop-blur-xl border border-zinc-200/50 rounded-3xl overflow-hidden shadow-sm"
                                >
                                    <div className="p-5 border-b border-zinc-100/50 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                                            <IonIcon icon={statsChartOutline} className="text-lg" />
                                        </div>
                                        <h3 className="text-sm font-black text-zinc-950 tracking-tight">Últimos 7 Días</h3>
                                    </div>
                                    <div className="p-5">
                                        <div className="h-48 w-full -ml-3">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart
                                                    data={data.ventasUltimos7Dias.map(dia => ({
                                                        name: new Date(dia.fecha).toLocaleDateString('es', { weekday: 'short' }),
                                                        total: dia.total,
                                                    }))}
                                                    margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                                                >
                                                    <defs>
                                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fafafa" />
                                                    <XAxis
                                                        dataKey="name"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 600 }}
                                                        tickFormatter={(str) => str.charAt(0).toUpperCase() + str.slice(1, 3)}
                                                    />
                                                    <YAxis
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 600 }}
                                                        tickFormatter={(value) => `$${value}`}
                                                    />
                                                    <Tooltip
                                                        cursor={{ stroke: '#e11d48', strokeWidth: 1, strokeDasharray: '4 4' }}
                                                        contentStyle={{ borderRadius: '16px', border: '1px solid #e4e4e7', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                                        formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Ventas']}
                                                        labelStyle={{ fontWeight: 800, color: '#18181b', textTransform: 'capitalize' }}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="total"
                                                        stroke="#e11d48"
                                                        strokeWidth={3}
                                                        fillOpacity={1}
                                                        fill="url(#colorTotal)"
                                                        activeDot={{ r: 6, fill: '#e11d48', stroke: '#fff', strokeWidth: 2 }}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Métodos de Pago */}
                            <div className="px-4 mt-4 mb-10">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="bg-white/70 backdrop-blur-xl border border-zinc-200/50 rounded-3xl overflow-hidden shadow-sm"
                                >
                                    <div className="p-5 border-b border-zinc-100/50 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center">
                                            <IonIcon icon={cashOutline} className="text-lg" />
                                        </div>
                                        <h3 className="text-sm font-black text-zinc-950 tracking-tight">Métodos de Pago (Mes)</h3>
                                    </div>
                                    <div className="p-5">
                                        {data.metodosPago && data.metodosPago.length > 0 ? (
                                            <div className="space-y-4">
                                                {data.metodosPago.map((metodo, index) => (
                                                    <div key={index} className="space-y-2">
                                                        <div className="flex justify-between items-center text-xs font-bold">
                                                            <span className="text-zinc-600">{metodo.metodo === 'yappy' ? '💸 Yappy' : '💵 Efectivo'}</span>
                                                            <span className="text-zinc-950">${metodo.total.toFixed(2)}</span>
                                                        </div>
                                                        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${metodo.porcentaje}%` }}
                                                                className={`h-full rounded-full ${metodo.metodo === 'yappy' ? 'bg-secondary' : 'bg-success'}`}
                                                            />
                                                        </div>
                                                        <div className="flex justify-between items-center text-[9px] font-black text-zinc-400 uppercase tracking-tighter">
                                                            <span>{metodo.cantidad} ventas</span>
                                                            <span>{metodo.porcentaje.toFixed(1)}%</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="no-data">No hay datos de pagos aún</p>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
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
