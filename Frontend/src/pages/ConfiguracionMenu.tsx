import React, { useState, useEffect } from 'react';
import {
    IonPage,
    IonContent,
    IonLoading,
    IonToast,
    IonIcon,
    IonRefresher,
    IonRefresherContent
} from '@ionic/react';
import {
    colorPaletteOutline,
    restaurantOutline,
    callOutline,
    qrCodeOutline,
    eyeOutline,
    saveOutline,
    camera,
    trash,
    image as imageIcon,
    logoInstagram,
    logoWhatsapp,
    copyOutline
} from 'ionicons/icons';
import { motion, AnimatePresence } from 'framer-motion';
import KitchyToolbar from '../components/KitchyToolbar';
import { getMenuConfig, updateMenuConfig } from '../services/api';
import { resizeImage } from '../utils/imageUtils';

interface MenuConfigData {
    nombreRestaurante: string;
    subtitulo: string;
    tema: 'paper' | 'modern' | 'minimal';
    colorPrimario: string;
    colorSecundario: string;
    imagenHero: string;
    telefono: string;
    direccion: string;
    horario: string;
    redesSociales: {
        instagram: string;
        facebook: string;
        whatsapp: string;
    };
}

const ConfiguracionMenu: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [config, setConfig] = useState<MenuConfigData>({
        nombreRestaurante: '',
        subtitulo: '',
        tema: 'modern',
        colorPrimario: '#18181b', // zinc-900
        colorSecundario: '#f4f4f5',
        imagenHero: '',
        telefono: '',
        direccion: '',
        horario: '',
        redesSociales: { instagram: '', facebook: '', whatsapp: '' }
    });

    useEffect(() => {
        cargarConfig();
    }, []);

    const cargarConfig = async () => {
        setLoading(true);
        try {
            const response = await getMenuConfig();
            if (response.data) {
                setConfig(response.data);
            }
        } catch (err) {
            console.error('Error cargando config:', err);
            setError('Error al cargar la configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async (event: CustomEvent) => {
        await cargarConfig();
        event.detail.complete();
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateMenuConfig(config);
            setSuccess('Menú actualizado exitosamente');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: keyof MenuConfigData, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const updateSocialField = (field: string, value: string) => {
        setConfig(prev => ({
            ...prev,
            redesSociales: { ...prev.redesSociales, [field]: value }
        }));
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const resizedImage = await resizeImage(file, 800, 800);
                setConfig(prev => ({ ...prev, imagenHero: resizedImage }));
            } catch (error) {
                console.error('Error resizing image:', error);
                setError('Error al procesar la imagen');
            }
        }
    };

    const menuUrl = `${window.location.origin}/menu`;

    const inputClasses = "w-full bg-zinc-100/50 border border-zinc-200 rounded-2xl px-5 py-4 text-base font-bold text-zinc-900 placeholder:text-zinc-400 focus:ring-4 ring-primary/10 transition-all outline-none";
    const labelClasses = "block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1";

    return (
        <IonPage className="bg-[#fafafa]">
            <KitchyToolbar
                title="Menú Digital"
                extraButtons={
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        disabled={saving}
                        className="!flex !items-center !gap-2 !px-4 !py-2.5 !rounded-2xl !bg-zinc-900 !text-white !font-black !text-xs disabled:!opacity-50 !shadow-md !shadow-zinc-900/20"
                    >
                        <IonIcon icon={saveOutline} className="!text-base" />
                        <span className="hidden sm:inline">Guardar Cambios</span>
                    </motion.button>
                }
            />

            <IonContent style={{ '--background': 'transparent' }}>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                <div className="max-w-3xl mx-auto px-4 pt-6 pb-24 space-y-6">

                    {/* Quick Access Strip */}
                    <div className="flex gap-3">
                        <a
                            href="/menu"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-primary/10 border border-primary/20 text-primary font-black py-4 rounded-3xl flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors active:scale-95"
                        >
                            <IonIcon icon={eyeOutline} className="text-xl" />
                            Ver Menú Público
                        </a>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(menuUrl);
                                setSuccess('¡Enlace copiado al portapapeles!');
                            }}
                            className="!flex-1 !bg-white !border !border-zinc-200 !text-zinc-700 !font-black !py-4 !rounded-3xl !flex !items-center !justify-center !gap-2 hover:!bg-zinc-50 !transition-colors active:!scale-95 !shadow-sm"
                        >
                            <IonIcon icon={copyOutline} className="text-xl" />
                            Copiar Enlace
                        </button>
                    </div>

                    {/* Identidad del Restaurante */}
                    <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                <IonIcon icon={restaurantOutline} className="text-xl" />
                            </div>
                            <h2 className="text-xl font-black text-zinc-900 tracking-tight">Identidad Visual</h2>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className={labelClasses}>Nombre de tu Local</label>
                                <input
                                    type="text"
                                    value={config.nombreRestaurante}
                                    onChange={(e) => updateField('nombreRestaurante', e.target.value)}
                                    placeholder="Ej. Kitchy Burger"
                                    className={inputClasses}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Subtítulo / Eslogan</label>
                                <input
                                    type="text"
                                    value={config.subtitulo}
                                    onChange={(e) => updateField('subtitulo', e.target.value)}
                                    placeholder="Las mejores hamburguesas de la ciudad"
                                    className={inputClasses}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Portada / Header del Menú</label>
                                <div className="flex justify-center mt-2">
                                    <div
                                        className="relative group cursor-pointer w-full h-48 rounded-[2rem] flex flex-col items-center justify-center overflow-hidden transition-all duration-300 border-2 border-dashed border-zinc-300 text-zinc-400 bg-zinc-50 hover:bg-zinc-100 hover:border-primary/50"
                                        onClick={() => document.getElementById('hero-image-upload')?.click()}
                                    >
                                        {config.imagenHero ? (
                                            <>
                                                <img src={config.imagenHero} className="w-full h-full object-cover" alt="Hero" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <IonIcon icon={camera} className="text-white text-4xl" />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <IonIcon icon={imageIcon} className="text-4xl mb-2 transition-transform group-hover:scale-110" />
                                                <span className="text-xs uppercase font-black tracking-widest text-center mt-2">Sube una foto<br />atractiva</span>
                                            </>
                                        )}
                                    </div>
                                    <input id="hero-image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </div>
                                {config.imagenHero && (
                                    <div className="flex justify-end mt-3">
                                        <button
                                            onClick={() => updateField('imagenHero', '')}
                                            className="text-[11px] font-black uppercase tracking-widest text-danger bg-danger/10 px-4 py-2 rounded-xl flex items-center gap-1 active:scale-95 transition-transform"
                                        >
                                            <IonIcon icon={trash} /> Quitar Foto
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Apariencia / Tema */}
                    <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                <IonIcon icon={colorPaletteOutline} className="text-xl" />
                            </div>
                            <h2 className="text-xl font-black text-zinc-900 tracking-tight">Estilo & Colores</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className={labelClasses}>Tema de la app</label>
                                <div className="relative">
                                    <select
                                        value={config.tema}
                                        onChange={(e) => updateField('tema', e.target.value)}
                                        className={`${inputClasses} appearance-none pr-10`}
                                    >
                                        <option value="modern">✨ Moderno (Recomendado)</option>
                                        <option value="minimal">💖 Minimalista</option>
                                        <option value="paper">📜 Papel Clásico</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <IonIcon icon={colorPaletteOutline} className="text-zinc-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col relative overflow-hidden group">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-3">Color Primario</span>
                                    <div className="flex items-center justify-between">
                                        <input
                                            type="color"
                                            value={config.colorPrimario}
                                            onChange={(e) => updateField('colorPrimario', e.target.value)}
                                            className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                                        />
                                        <span className="text-xs font-bold text-zinc-400 uppercase">{config.colorPrimario}</span>
                                    </div>
                                </div>

                                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col relative overflow-hidden group">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-3">Color Sec.{' (Opcional)'}</span>
                                    <div className="flex items-center justify-between">
                                        <input
                                            type="color"
                                            value={config.colorSecundario}
                                            onChange={(e) => updateField('colorSecundario', e.target.value)}
                                            className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                                        />
                                        <span className="text-xs font-bold text-zinc-400 uppercase">{config.colorSecundario}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contacto & Redes */}
                    <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                <IonIcon icon={callOutline} className="text-xl" />
                            </div>
                            <h2 className="text-xl font-black text-zinc-900 tracking-tight">Contacto Público</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className={labelClasses}>Teléfono</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={config.telefono}
                                        onChange={(e) => updateField('telefono', e.target.value)}
                                        placeholder="Ej. +507 6000-0000"
                                        className={inputClasses}
                                    />
                                    <IonIcon icon={callOutline} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>WhatsApp de Pedidos</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={config.redesSociales.whatsapp}
                                        onChange={(e) => updateSocialField('whatsapp', e.target.value)}
                                        placeholder="Ej. 6000-0000"
                                        className={inputClasses}
                                    />
                                    <IonIcon icon={logoWhatsapp} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>Instagram</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={config.redesSociales.instagram}
                                        onChange={(e) => updateSocialField('instagram', e.target.value)}
                                        placeholder="@mi_restaurante"
                                        className={inputClasses}
                                    />
                                    <IonIcon icon={logoInstagram} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className={labelClasses}>Dirección Física</label>
                                <input
                                    type="text"
                                    value={config.direccion}
                                    onChange={(e) => updateField('direccion', e.target.value)}
                                    placeholder="Plaza Kitchy, Local 1"
                                    className={inputClasses}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Horario de Atención</label>
                                <input
                                    type="text"
                                    value={config.horario}
                                    onChange={(e) => updateField('horario', e.target.value)}
                                    placeholder="Lun-Dom 12:00 PM a 10:00 PM"
                                    className={inputClasses}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="!w-full !bg-zinc-900 hover:!bg-zinc-800 !text-white !font-black !py-5 !rounded-[2rem] !shadow-xl !shadow-zinc-900/20 !transition-all !flex !items-center !justify-center !gap-3 active:!scale-95 disabled:!opacity-70 disabled:active:!scale-100"
                        >
                            <IonIcon icon={saveOutline} className="text-xl" />
                            <span className="text-lg tracking-tight">Publicar Menú</span>
                        </button>
                    </div>
                </div>

                <IonLoading isOpen={loading} message="Cargando configuración..." spinner="crescent" />
                <IonLoading isOpen={saving} message="Guardando cambios..." spinner="crescent" />
                <IonToast isOpen={!!error} message={error} duration={3000} color="danger" onDidDismiss={() => setError('')} />
                <IonToast isOpen={!!success} message={success} duration={2000} color="success" onDidDismiss={() => setSuccess('')} />
            </IonContent>
        </IonPage>
    );
};

export default ConfiguracionMenu;
