import React, { useRef, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonFab, IonFabButton, IonModal, IonLoading, IonToast, IonRefresher, IonRefresherContent, IonPopover, IonButtons } from '@ionic/react';
import { add, restaurant, trash, create, eye, eyeOff, camera, image as imageIcon, listCircleOutline, cloudUpload, searchOutline, close, ellipsisVertical, archive } from 'ionicons/icons';
import { useProductos } from '../hooks/useProductos';
import { useInventario } from '../hooks/useInventario';
import { optimizeImageUrl } from '../utils/imageUtils';
import KitchyToolbar from '../components/KitchyToolbar';
import { motion, AnimatePresence } from 'framer-motion';
import { slideUp, springTransition, listItemVariant } from '../animations/variants';

const Productos: React.FC = () => {
    const { loading, showModal, setShowModal, editItem, error, clearError, success, clearSuccess, busqueda, setBusqueda, nombre, setNombre, descripcion, setDescripcion, precio, setPrecio, categoria, setCategoria, disponible, setDisponible, imagen, setImagen, ingredientes, setIngredientes, handleRefresh, resetForm, openEditModal, handleSubmit, handleDelete, handleToggleDisponible, handleImageUpload, getEmoji, productosFiltrados, handleImportCsv } = useProductos();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [popoverEvent, setPopoverEvent] = useState<{ event: Event | null, id: string | null }>({ event: null, id: null });

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleImportCsv(e.target.files[0]);
            e.target.value = ''; // Reset
        }
    };

    // Traer el inventario para poder agregarlo a la receta
    const { itemsFiltrados: itemsInventario } = useInventario();

    // Función para manejar agregar/quitar ingredientes en el form
    const handleChangeIngrediente = (index: number, field: string, value: any) => {
        const nuevos = [...ingredientes];
        nuevos[index] = { ...nuevos[index], [field]: value };
        setIngredientes(nuevos);
    };

    const handleAddIngrediente = () => {
        setIngredientes([...ingredientes, { inventario: '', cantidad: 1 }]);
    };

    const handleRemoveIngrediente = (index: number) => {
        const nuevos = [...ingredientes];
        nuevos.splice(index, 1);
        setIngredientes(nuevos);
    };

    return (
        <IonPage className="bg-[#fafafa]" style={{ background: 'var(--ion-background-color)' }}>
            <KitchyToolbar title="Productos" />

            <IonContent style={{ '--background': 'transparent' }}>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                <div className="max-w-3xl mx-auto px-4 pt-6 pb-24 space-y-6">

                    {/* Search Bar & Import Action */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Buscar producto..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full bg-white backdrop-blur-xl border border-zinc-200 rounded-2xl pl-11 pr-4 py-3.5 text-base font-bold text-zinc-800 placeholder:text-zinc-400 focus:ring-4 ring-primary/10 outline-none shadow-sm transition-all"
                            />
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                <IonIcon icon={searchOutline} className="text-zinc-400 text-lg" />
                            </div>
                        </div>
                        <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={onFileChange} />
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => fileInputRef.current?.click()}
                            className="w-12 h-12 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-secondary hover:bg-secondary/10 hover:border-secondary/20 transition-all shadow-sm shrink-0"
                        >
                            <IonIcon icon={cloudUpload} className="text-xl" />
                        </motion.button>
                    </div>

                    {/* Product List */}
                    <div className="bg-zinc-50/50 backdrop-blur-3xl border border-zinc-200 rounded-3xl overflow-hidden shadow-sm !p-0">
                        <AnimatePresence mode="popLayout">
                            {productosFiltrados.map((producto, index) => (
                                <motion.div
                                    variants={listItemVariant}
                                    initial="initial"
                                    animate="animate"
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    layout
                                    key={producto._id}
                                    className={`group flex items-center w-full px-4 py-3 bg-transparent transition-colors hover:bg-zinc-50 cursor-default ${index !== productosFiltrados.length - 1 ? 'border-b border-zinc-100' : ''} ${!producto.disponible ? 'opacity-60 grayscale-[0.5]' : ''}`}
                                >
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="w-12 h-12 flex-shrink-0 rounded-[14px] bg-zinc-100 flex items-center justify-center overflow-hidden border border-zinc-200/50 group-hover:scale-110 transition-transform">
                                            {producto.imagen ? (
                                                <img src={optimizeImageUrl(producto.imagen)} alt={producto.nombre} className="w-full h-full object-cover" loading="lazy" />
                                            ) : (
                                                <span className="text-2xl">{getEmoji(producto.categoria)}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                                            <h2 className={`!text-[1.1rem] font-black truncate leading-none ${producto.disponible ? 'text-zinc-900' : 'text-zinc-500 line-through'}`}>
                                                {producto.nombre}
                                            </h2>
                                            <p className="text-[0.65rem] font-bold text-zinc-500 uppercase tracking-widest mt-1.5 truncate">
                                                {producto.categoria} {producto.descripcion && `• ${producto.descripcion}`}
                                            </p>
                                        </div>

                                        <div className="flex flex-col flex-shrink-0 text-right mr-3 items-end gap-1">
                                            <span className="font-black text-primary text-base leading-none">
                                                ${producto.precio.toFixed(2)}
                                            </span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${producto.disponible ? 'bg-success/10 text-success' : 'bg-zinc-200 text-zinc-500'}`}>
                                                {producto.disponible ? 'Activo' : 'Oculto'}
                                            </span>
                                        </div>

                                        <button
                                            className="p-2 -mr-2 text-zinc-400 hover:text-zinc-800 transition-colors rounded-full active:scale-95 hover:bg-zinc-100"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPopoverEvent({ event: e.nativeEvent, id: producto._id });
                                            }}
                                        >
                                            <IonIcon icon={ellipsisVertical} className="text-xl block" />
                                        </button>
                                    </div>

                                    {/* Action Menu (Popover) */}
                                    <IonPopover
                                        isOpen={popoverEvent.id === producto._id}
                                        event={popoverEvent.event}
                                        onDidDismiss={() => setPopoverEvent({ event: null, id: null })}
                                        className="kitchy-action-popover"
                                    >
                                        <div className="bg-white/95 backdrop-blur-xl p-1.5 flex flex-col min-w-[160px] rounded-2xl shadow-xl border border-zinc-200">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setPopoverEvent({ event: null, id: null }); handleToggleDisponible(producto._id); }}
                                                className={`!flex !items-center !gap-3 !w-full !px-3 !py-2.5 !text-left !text-[0.85rem] !font-bold !rounded-xl !transition-colors ${producto.disponible ? '!text-warning hover:!bg-warning/10' : '!text-success hover:!bg-success/10'}`}
                                            >
                                                <IonIcon icon={producto.disponible ? eyeOff : eye} className="text-lg" />
                                                {producto.disponible ? 'Pausar Venta' : 'Activar Venta'}
                                            </button>

                                            <div className="h-px bg-zinc-200 my-1 mx-2" />

                                            <button
                                                onClick={(e) => { e.stopPropagation(); setPopoverEvent({ event: null, id: null }); openEditModal(producto); }}
                                                className="!flex !items-center !gap-3 !w-full !px-3 !py-2.5 !text-left !text-[0.85rem] !font-bold !text-primary hover:!bg-primary/10 !rounded-xl !transition-colors"
                                            >
                                                <IonIcon icon={create} className="text-lg" /> Editar Info
                                            </button>

                                            <div className="h-px bg-zinc-200 my-1 mx-2" />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setPopoverEvent({ event: null, id: null }); handleDelete(producto._id); }}
                                                className="!flex !items-center !gap-3 !w-full !px-3 !py-2.5 !text-left !text-[0.85rem] !font-bold !text-danger hover:!bg-danger/10 !rounded-xl !transition-colors"
                                            >
                                                <IonIcon icon={trash} className="text-lg" /> Eliminar
                                            </button>
                                        </div>
                                    </IonPopover>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Empty State */}
                    {productosFiltrados.length === 0 && !loading && (
                        <motion.div variants={slideUp} initial="initial" animate="animate" className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                                <IonIcon icon={restaurant} className="text-4xl" />
                            </div>
                            <h3 className="text-lg font-black text-zinc-800 mb-1">Menú Vacío</h3>
                            <p className="text-sm font-medium text-zinc-500 mb-6 max-w-[250px]">No hemos encontrado productos. Crea uno nuevo para empezar a vender.</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-zinc-900 hover:bg-zinc-800 text-white font-black px-6 py-3 rounded-2xl shadow-md transition-colors flex items-center gap-2"
                            >
                                <IonIcon icon={add} /> Crear Producto
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Modal Crear/Editar */}
                <IonModal
                    isOpen={showModal}
                    onDidDismiss={() => { setShowModal(false); resetForm(); }}
                    className="--border-radius: 32px; --height: 95%;"
                >
                    <div className="h-full flex flex-col bg-white overflow-y-auto pb-8">
                        <IonHeader className="ion-no-border">
                            <IonToolbar className="--background: transparent; pt-6 px-4">
                                <IonTitle className="font-outfit font-black text-2xl text-zinc-800 italic tracking-tighter">
                                    {editItem ? 'Editar' : 'Nuevo'} Producto
                                </IonTitle>
                                <IonButtons slot="end">
                                    <button
                                        onClick={() => { setShowModal(false); resetForm(); }}
                                        className="bg-zinc-200/50 p-2.5 rounded-full hover:rotate-90 transition-transform duration-300"
                                    >
                                        <IonIcon icon={close} className="text-xl" />
                                    </button>
                                </IonButtons>
                            </IonToolbar>
                        </IonHeader>

                        <div className="flex-1 px-6 py-6 space-y-6">

                            {/* Image Upload Area */}
                            <div className="flex justify-center mb-4">
                                <div className="relative group cursor-pointer inline-block" onClick={() => document.getElementById('file-upload')?.click()}>
                                    <div className={`w-36 h-36 rounded-[2.5rem] flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${imagen ? 'shadow-xl shadow-zinc-200 text-transparent' : 'bg-zinc-100 border-2 border-dashed border-zinc-300 text-zinc-400 group-hover:bg-zinc-200/50 group-hover:border-primary/50 group-hover:text-primary'}`}>
                                        {imagen ? (
                                            <>
                                                <img src={imagen} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <IonIcon icon={camera} className="text-white text-3xl" />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <IonIcon icon={imageIcon} className="text-4xl mb-2 transition-transform group-hover:scale-110 group-hover:-translate-y-1" />
                                                <span className="text-[10px] uppercase font-black tracking-widest text-center px-4 leading-tight">Toca para<br />Foto</span>
                                            </>
                                        )}
                                    </div>
                                    <input id="file-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    {imagen && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setImagen(''); }}
                                            className="absolute -top-2 -right-2 bg-white text-danger w-8 h-8 rounded-full shadow-lg border border-zinc-100 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                                        >
                                            <IonIcon icon={trash} className="text-sm" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 ml-1">Nombre</label>
                                    <input
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        placeholder="Ej: Hamburguesa Kitchy"
                                        className="w-full bg-zinc-100/50 border border-zinc-200 rounded-2xl px-5 py-4 text-base font-bold focus:ring-4 ring-primary/10 outline-none transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Precio ($)</label>
                                        <input
                                            type="number"
                                            value={precio}
                                            onChange={(e) => setPrecio(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-zinc-100/50 border border-zinc-200 rounded-2xl px-5 py-4 text-base font-bold transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Categoría</label>
                                        <select
                                            value={categoria}
                                            onChange={(e) => setCategoria(e.target.value)}
                                            className="w-full bg-zinc-100/50 border border-zinc-200 rounded-2xl px-5 py-4 text-base font-bold transition-all appearance-none h-full"
                                        >
                                            <option value="comida">🍔 Comida</option>
                                            <option value="bebida">🥤 Bebida</option>
                                            <option value="postre">🍰 Postre</option>
                                            <option value="otro">📦 Otro</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Descripción</label>
                                    <textarea
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        placeholder="Detalles deliciosos..."
                                        rows={2}
                                        className="w-full bg-zinc-100/50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-bold transition-all outline-none focus:ring-4 ring-primary/10 resize-none"
                                    />
                                </div>

                                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between cursor-pointer" onClick={() => setDisponible(!disponible)}>
                                    <div>
                                        <h3 className="font-black text-sm text-zinc-900">Visibilidad</h3>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Mostrar en el Punto de Venta</p>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${disponible ? 'bg-success' : 'bg-zinc-300'}`}>
                                        <motion.div
                                            layout
                                            className={`w-5 h-5 bg-white rounded-full absolute shadow-sm transition-all ${disponible ? 'right-0.5' : 'left-0.5'}`}
                                        />
                                    </div>
                                </div>

                                {/* Receta Section */}
                                <div className="pt-4 border-t border-zinc-100 mt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-black text-sm text-zinc-900 flex items-center gap-2">
                                                <IonIcon icon={archive} className="text-primary text-base" /> Receta / Insumos
                                            </h3>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Descuenta stock automáticamente</p>
                                        </div>
                                        <button onClick={handleAddIngrediente} className="bg-primary/10 text-primary font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1 active:scale-95 transition-transform">
                                            <IonIcon icon={add} /> Insumo
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {ingredientes.map((ingrediente: any, index: number) => (
                                            <div key={index} className="flex gap-2 items-center bg-zinc-50/50 p-2 rounded-2xl border border-zinc-100">
                                                <select
                                                    value={ingrediente.inventario}
                                                    onChange={(e) => handleChangeIngrediente(index, 'inventario', e.target.value)}
                                                    className="flex-[2] bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-xs font-bold transition-all outline-none"
                                                >
                                                    <option value="" disabled>Seleccionar...</option>
                                                    {itemsInventario.map(invItem => (
                                                        <option key={invItem._id} value={invItem._id}>
                                                            {invItem.nombre} ({invItem.unidad})
                                                        </option>
                                                    ))}
                                                    {ingrediente.nombreDisplay && !itemsInventario.find(i => i._id === ingrediente.inventario) && (
                                                        <option value={ingrediente.inventario}>{ingrediente.nombreDisplay} (No disp.)</option>
                                                    )}
                                                </select>

                                                <input
                                                    type="number"
                                                    value={ingrediente.cantidad}
                                                    onChange={(e) => handleChangeIngrediente(index, 'cantidad', e.target.value)}
                                                    className="flex-1 w-20 bg-white border border-zinc-200 rounded-xl px-3 py-2.5 text-xs font-bold transition-all outline-none text-center"
                                                    min="0.01" step="0.01" placeholder="Cant."
                                                />

                                                <button onClick={() => handleRemoveIngrediente(index)} className="w-9 h-9 flex shrink-0 items-center justify-center text-danger hover:bg-danger/10 rounded-lg transition-colors">
                                                    <IonIcon icon={trash} className="text-lg" />
                                                </button>
                                            </div>
                                        ))}

                                        {ingredientes.length === 0 && (
                                            <div className="py-6 border-2 border-dashed border-zinc-200 rounded-2xl text-center">
                                                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Sin insumos registrados</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    onClick={handleSubmit}
                                    className="!w-full !bg-primary !hover:!bg-primary-shade !text-white !font-black !py-5 !rounded-[2rem] !shadow-2xl !shadow-primary/40 !transition-all !flex !items-center !justify-center !gap-3 !active:scale-95 !group"
                                >
                                    <IonIcon icon={editItem ? create : add} className="text-2xl group-hover:rotate-12 transition-transform" />
                                    <span className="text-lg tracking-tight">{editItem ? 'Actualizar Producto' : 'Crear Producto'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </IonModal>

                {/* FAB */}
                <IonFab vertical="bottom" horizontal="end" slot="fixed" className="mb-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>
                        <IonFabButton color="primary" onClick={() => { resetForm(); setShowModal(true); }}>
                            <IonIcon icon={add} />
                        </IonFabButton>
                    </motion.div>
                </IonFab>

                <IonLoading isOpen={loading} message="Procesando..." spinner="crescent" />
                <IonToast isOpen={!!error} message={error} duration={3000} color="danger" onDidDismiss={clearError} />
                <IonToast isOpen={!!success} message={success} duration={2000} color="success" onDidDismiss={clearSuccess} />
            </IonContent>
        </IonPage>
    );
};

export default Productos;
