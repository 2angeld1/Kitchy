import React, { useRef } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonBadge, IonItem, IonLabel, IonList, IonFab, IonFabButton, IonModal, IonInput, IonSelect, IonSelectOption, IonLoading, IonToast, IonButtons, IonRefresher, IonRefresherContent } from '@ionic/react';
import { add, cart, remove, checkmark, trash, searchOutline, close, receiptOutline } from 'ionicons/icons';
import { optimizeImageUrl } from '../utils/imageUtils';
import { useVentas } from '../hooks/useVentas';
import KitchyToolbar from '../components/KitchyToolbar';
import { motion, AnimatePresence } from 'framer-motion';
import { slideUp, springTransition } from '../animations/variants';

const Ventas: React.FC = () => {
    const { carrito, ventas, loading, showModal, setShowModal, showHistorial, setShowHistorial, metodoPago, setMetodoPago, cliente, setCliente, error, clearError, success, clearSuccess, busqueda, setBusqueda, categoriaFiltro, setCategoriaFiltro, handleRefresh, agregarAlCarrito, quitarDelCarrito, eliminarDelCarrito, calcularTotal, procesarVenta, abrirHistorial, productosFiltrados } = useVentas();

    const categorias = ['comida', 'bebida', 'postre'];

    return (
        <IonPage className="bg-[#fafafa]" style={{ background: 'var(--ion-background-color)' }}>
            <KitchyToolbar
                title="Ventas"
                onNotificationsClick={abrirHistorial}
                extraButtons={
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowModal(true)}
                        className="!w-10 !h-10 !flex !items-center !justify-center !rounded-xl !bg-zinc-100 !text-zinc-600 relative"
                    >
                        <IonIcon icon={cart} className="text-xl" />
                        {carrito.length > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                {carrito.reduce((sum, i) => sum + i.cantidad, 0)}
                            </span>
                        )}
                    </motion.button>
                }
            />

            <IonContent style={{ '--background': 'transparent' }}>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                <div className="max-w-4xl mx-auto px-4 pt-6 pb-24 space-y-6">

                    {/* Search Bar */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <IonIcon icon={searchOutline} className="text-zinc-400 text-lg" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full bg-white backdrop-blur-xl border border-zinc-200 rounded-2xl pl-11 pr-4 py-3.5 text-base font-bold text-zinc-800 placeholder:text-zinc-400 focus:ring-4 ring-primary/10 outline-none shadow-sm transition-all"
                        />
                    </div>

                    {/* Categories Chips */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setCategoriaFiltro('')}
                            className={`!whitespace-nowrap !px-5 !py-2.5 !rounded-2xl !font-black !text-[11px] !uppercase !tracking-widest !transition-all ${!categoriaFiltro ? '!bg-zinc-900 !text-white !shadow-md' : '!bg-white !text-zinc-500 !border !border-zinc-200 hover:!bg-zinc-50'}`}
                        >
                            Todos
                        </button>
                        {categorias.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoriaFiltro(cat)}
                                className={`!whitespace-nowrap !px-5 !py-2.5 !rounded-2xl !font-black !text-[11px] !uppercase !tracking-widest !transition-all ${categoriaFiltro === cat ? '!bg-primary !text-white !shadow-md !shadow-primary/20' : '!bg-white !text-zinc-500 !border !border-zinc-200 hover:!bg-zinc-50'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Products Grid */}
                    {productosFiltrados.length === 0 ? (
                        <motion.div variants={slideUp} initial="initial" animate="animate" className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                                <IonIcon icon={cart} className="text-4xl" />
                            </div>
                            <h3 className="text-lg font-black text-zinc-800 mb-1">Sin productos</h3>
                            <p className="text-sm font-medium text-zinc-500 max-w-[250px]">No se encontraron productos que coincidan con la búsqueda.</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <AnimatePresence>
                                {productosFiltrados.map((producto, i) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={producto._id}
                                        onClick={() => agregarAlCarrito(producto)}
                                        className="bg-white/70 backdrop-blur-xl border border-zinc-200/50 rounded-3xl p-3 shadow-sm flex flex-col justify-between cursor-pointer hover:bg-white transition-colors group"
                                    >
                                        <div>
                                            <div className="aspect-square bg-zinc-100 rounded-2xl mb-3 flex items-center justify-center overflow-hidden relative">
                                                {producto.imagen ? (
                                                    <img
                                                        src={optimizeImageUrl(producto.imagen)}
                                                        alt={producto.nombre}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <span className="text-4xl group-hover:scale-125 transition-transform duration-500">
                                                        {producto.categoria === 'comida' ? '🍔' :
                                                            producto.categoria === 'bebida' ? '🥤' :
                                                                producto.categoria === 'postre' ? '🍰' : '📦'}
                                                    </span>
                                                )}
                                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur p-1.5 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <IonIcon icon={add} className="text-primary font-bold block" />
                                                </div>
                                            </div>
                                            <h3 className="font-black text-sm text-zinc-900 leading-tight mb-1 line-clamp-2">{producto.nombre}</h3>
                                            {producto.descripcion && <p className="text-[10px] font-bold text-zinc-400 line-clamp-1 mb-2">{producto.descripcion}</p>}
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-lg font-black text-primary">${producto.precio.toFixed(2)}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Carrito Drawer/Modal */}
                <IonModal
                    isOpen={showModal}
                    onDidDismiss={() => setShowModal(false)}
                    initialBreakpoint={1}
                    breakpoints={[0, 0.5, 0.75, 1]}
                    className="kitchy-bottom-sheet"
                >
                    <div className="bg-white h-full flex flex-col">
                        <div className="p-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-zinc-900 tracking-tight">Tu Pedido</h2>
                                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{carrito.length} Items seleccionados</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500">
                                <IonIcon icon={close} className="text-xl" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {carrito.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center pb-20">
                                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-3 text-zinc-400">
                                        <IonIcon icon={cart} className="text-3xl" />
                                    </div>
                                    <p className="text-sm font-bold text-zinc-500">El carrito está vacío</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {carrito.map(item => (
                                        <div key={item.producto._id} className="flex items-center gap-3 p-3 bg-zinc-50/50 border border-zinc-100 rounded-2xl">
                                            <div className="w-12 h-12 bg-zinc-100 rounded-xl flex shrink-0 items-center justify-center overflow-hidden">
                                                {item.producto.imagen ? (
                                                    <img src={optimizeImageUrl(item.producto.imagen)} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xl">🍔</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-black text-zinc-900 truncate">{item.producto.nombre}</h4>
                                                <p className="text-xs font-bold text-primary">${item.producto.precio.toFixed(2)}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex items-center bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                                                    <button onClick={() => quitarDelCarrito(item.producto._id)} className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 active:bg-zinc-100 transition-colors">
                                                        <IonIcon icon={remove} />
                                                    </button>
                                                    <span className="w-6 text-center text-xs font-black text-zinc-900">{item.cantidad}</span>
                                                    <button onClick={() => agregarAlCarrito(item.producto)} className="w-8 h-8 flex items-center justify-center text-primary hover:bg-zinc-50 active:bg-zinc-100 transition-colors">
                                                        <IonIcon icon={add} />
                                                    </button>
                                                </div>
                                                <button onClick={() => eliminarDelCarrito(item.producto._id)} className="text-[10px] uppercase font-black tracking-widest text-danger hover:opacity-70 transition-opacity flex items-center gap-1">
                                                    <IonIcon icon={trash} /> Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Checkout Footer */}
                        {carrito.length > 0 && (
                            <div className="border-t border-zinc-100 bg-white p-4 space-y-4 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-8 z-10">
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        value={cliente}
                                        onChange={(e) => setCliente(e.target.value)}
                                        placeholder="Cliente (Opcional)"
                                        className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all placeholder:text-zinc-400"
                                    />
                                    <select
                                        value={metodoPago}
                                        onChange={(e) => setMetodoPago(e.target.value)}
                                        className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all appearance-none"
                                    >
                                        <option value="efectivo">💵 Efectivo</option>
                                        <option value="yappy">💸 Yappy</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Total a pagar</span>
                                    <span className="text-3xl font-black text-zinc-900 tracking-tight">${calcularTotal().toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        procesarVenta();
                                    }}
                                    className="!w-full !bg-primary hover:!bg-primary-shade !text-white !font-black !py-4 !rounded-2xl !shadow-xl !shadow-primary/20 !flex !items-center !justify-center !gap-2 active:!scale-95 !transition-all"
                                >
                                    <IonIcon icon={checkmark} className="text-xl" />
                                    Confirmar Pedido
                                </button>
                            </div>
                        )}
                    </div>
                </IonModal>

                {/* Historial Modal */}
                <IonModal
                    isOpen={showHistorial}
                    onDidDismiss={() => setShowHistorial(false)}
                    className="--border-radius: 32px;"
                >
                    <div className="bg-[#fafafa] h-full flex flex-col">
                        <IonHeader className="ion-no-border">
                            <IonToolbar className="--background: transparent; pt-4 px-2">
                                <IonTitle className="font-outfit font-black text-2xl text-zinc-900 tracking-tight">Ventas Recientes</IonTitle>
                                <IonButtons slot="end">
                                    <button onClick={() => setShowHistorial(false)} className="bg-zinc-200/50 p-2.5 rounded-full mr-2 text-zinc-600 hover:rotate-90 transition-transform">
                                        <IonIcon icon={close} className="text-xl block" />
                                    </button>
                                </IonButtons>
                            </IonToolbar>
                        </IonHeader>
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                            {ventas.length === 0 ? (
                                <div className="text-center py-10">
                                    <IonIcon icon={receiptOutline} className="text-4xl text-zinc-300 mb-2" />
                                    <p className="text-sm font-bold text-zinc-500">No hay ventas registradas</p>
                                </div>
                            ) : (
                                ventas.map(venta => (
                                    <div key={venta._id} className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl text-primary flex items-center justify-center shrink-0">
                                            <IonIcon icon={receiptOutline} className="text-xl" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-lg font-black text-zinc-900 leading-none">${venta.total.toFixed(2)}</h3>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">{venta.metodoPago}</span>
                                            </div>
                                            <p className="text-[11px] font-bold text-zinc-500 truncate">{venta.cliente || 'Consumidor Final'} • {venta.items.length} items</p>
                                            <p className="text-[9px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">{new Date(venta.createdAt).toLocaleDateString()} {new Date(venta.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </IonModal>

                {/* FAB */}
                {carrito.length > 0 && !showModal && (
                    <IonFab vertical="bottom" horizontal="end" slot="fixed" className="mb-4">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} className="relative">
                            <IonFabButton color="primary" onClick={() => setShowModal(true)}>
                                <IonIcon icon={cart} />
                            </IonFabButton>
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-white text-primary text-xs font-black rounded-full flex items-center justify-center border-2 border-primary z-10 shadow-sm">
                                {carrito.reduce((sum, i) => sum + i.cantidad, 0)}
                            </span>
                        </motion.div>
                    </IonFab>
                )}

                <IonLoading isOpen={loading} message="Procesando..." spinner="crescent" />
                <IonToast isOpen={!!error} message={error} duration={3000} color="danger" onDidDismiss={clearError} />
                <IonToast isOpen={!!success} message={success} duration={2000} color="success" onDidDismiss={clearSuccess} />
            </IonContent>
        </IonPage>
    );
};

export default Ventas;
