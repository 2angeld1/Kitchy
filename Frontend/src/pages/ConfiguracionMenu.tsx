import React, { useState, useEffect } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonButtons,
    IonMenuButton,
    IonLoading,
    IonToast,
    IonIcon,
    IonSegment,
    IonSegmentButton,
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
    image as imageIcon
} from 'ionicons/icons';
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

    // Form State
    const [config, setConfig] = useState<MenuConfigData>({
        nombreRestaurante: '',
        subtitulo: '',
        tema: 'paper',
        colorPrimario: '#c92c2c',
        colorSecundario: '#d4af37',
        imagenHero: '',
        telefono: '',
        direccion: '',
        horario: '',
        redesSociales: {
            instagram: '',
            facebook: '',
            whatsapp: ''
        }
    });

    useEffect(() => {
        cargarConfig();
    }, []);

    const cargarConfig = async () => {
        setLoading(true);
        try {
            const response = await getMenuConfig();
            setConfig(response.data);
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
            setSuccess('Configuración guardada correctamente');
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

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Configurar Menú</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave} disabled={saving}>
                            <IonIcon icon={saveOutline} slot="start" />
                            Guardar
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
                    {/* Quick Actions */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                        <IonButton expand="block" fill="outline" routerLink="/menu" target="_blank" style={{ flex: 1 }}>
                            <IonIcon icon={eyeOutline} slot="start" />
                            Ver Menú
                        </IonButton>
                        <IonButton expand="block" fill="outline" style={{ flex: 1 }} onClick={() => {
                            navigator.clipboard.writeText(menuUrl);
                            setSuccess('URL copiada al portapapeles');
                        }}>
                            <IonIcon icon={qrCodeOutline} slot="start" />
                            Copiar URL
                        </IonButton>
                    </div>

                    {/* Identidad del Restaurante */}
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                <IonIcon icon={restaurantOutline} style={{ marginRight: 10 }} />
                                Identidad
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonItem>
                                <IonInput
                                    label="Nombre del Restaurante"
                                    labelPlacement="floating"
                                    value={config.nombreRestaurante}
                                    onIonInput={(e) => updateField('nombreRestaurante', e.detail.value)}
                                />
                            </IonItem>
                            <IonItem>
                                <IonInput
                                    label="Subtítulo / Eslogan"
                                    labelPlacement="floating"
                                    value={config.subtitulo}
                                    onIonInput={(e) => updateField('subtitulo', e.detail.value)}
                                />
                            </IonItem>
                            <IonItem>
                                <div style={{ width: '100%', paddingTop: 10, paddingBottom: 10 }}>
                                    <IonLabel position="stacked" style={{ marginBottom: 10 }}>Imagen Principal / Logo</IonLabel>
                                    
                                    <div 
                                        className="image-upload-container"
                                        style={{
                                            width: '100%',
                                            height: '200px',
                                            borderRadius: '12px',
                                            border: '2px dashed #ccc',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            backgroundColor: '#f9f9f9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundImage: config.imagenHero ? `url(${config.imagenHero})` : 'none',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}
                                        onClick={() => document.getElementById('hero-image-upload')?.click()}
                                    >
                                        {!config.imagenHero && (
                                            <div style={{ textAlign: 'center', color: '#666' }}>
                                                <IonIcon icon={camera} style={{ fontSize: '48px', marginBottom: '8px' }} />
                                                <div>Toca para subir imagen</div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <input
                                        id="hero-image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        style={{ display: 'none' }}
                                    />
                                    
                                    {config.imagenHero && (
                                        <IonButton 
                                            fill="clear" 
                                            color="danger" 
                                            size="small" 
                                            onClick={() => updateField('imagenHero', '')}
                                            style={{ marginTop: 5 }}
                                        >
                                            <IonIcon icon={trash} slot="start" />
                                            Eliminar Imagen
                                        </IonButton>
                                    )}
                                </div>
                            </IonItem>
                        </IonCardContent>
                    </IonCard>

                    {/* Tema Visual */}
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                <IonIcon icon={colorPaletteOutline} style={{ marginRight: 10 }} />
                                Apariencia
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonItem lines="none" style={{ '--padding-start': '0', marginBottom: '15px' }}>
                                <IonSelect 
                                    label="Estilo del Menú"
                                    labelPlacement="stacked"
                                    value={config.tema} 
                                    onIonChange={(e) => updateField('tema', e.detail.value)}
                                    interface="action-sheet"
                                    placeholder="Selecciona un tema"
                                    style={{ width: '100%' }}
                                >
                                    <IonSelectOption value="paper">📜 Papel (Clásico)</IonSelectOption>
                                    <IonSelectOption value="tasty">🍔 Tasty (Vibrante)</IonSelectOption>
                                    <IonSelectOption value="modern">✨ Moderno (Limpio)</IonSelectOption>
                                    <IonSelectOption value="minimal">💖 Minimal (Find & Order)</IonSelectOption>
                                    <IonSelectOption value="gourmet">🌑 Gourmet Dark (Elegante)</IonSelectOption>
                                </IonSelect>
                            </IonItem>

                            <IonLabel style={{ display: 'block', marginBottom: '15px', marginTop: '10px', fontSize: '0.9em', color: 'var(--ion-color-medium)' }}>Paleta de Colores</IonLabel>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                {/* Color Primario */}
                                <div style={{ 
                                    border: '1px solid var(--ion-color-light-shade)', 
                                    borderRadius: '12px', 
                                    padding: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    backgroundColor: 'var(--ion-card-background)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Primario</span>
                                        <div style={{ 
                                            width: '24px', 
                                            height: '24px', 
                                            borderRadius: '50%', 
                                            backgroundColor: config.colorPrimario,
                                            border: '1px solid rgba(0,0,0,0.1)'
                                        }} />
                                    </div>
                                    <input 
                                        type="color" 
                                        value={config.colorPrimario}
                                        onChange={(e) => updateField('colorPrimario', e.target.value)}
                                        style={{ width: '100%', height: '40px', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                                    />
                                </div>

                                {/* Color Secundario */}
                                <div style={{ 
                                    border: '1px solid var(--ion-color-light-shade)', 
                                    borderRadius: '12px', 
                                    padding: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    backgroundColor: 'var(--ion-card-background)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Secundario</span>
                                        <div style={{ 
                                            width: '24px', 
                                            height: '24px', 
                                            borderRadius: '50%', 
                                            backgroundColor: config.colorSecundario,
                                            border: '1px solid rgba(0,0,0,0.1)'
                                        }} />
                                    </div>
                                    <input 
                                        type="color" 
                                        value={config.colorSecundario}
                                        onChange={(e) => updateField('colorSecundario', e.target.value)}
                                        style={{ width: '100%', height: '40px', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                                    />
                                </div>
                            </div>
                        </IonCardContent>
                    </IonCard>

                    {/* Contacto */}
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>
                                <IonIcon icon={callOutline} style={{ marginRight: 10 }} />
                                Contacto
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonItem>
                                <IonInput
                                    label="Teléfono"
                                    labelPlacement="floating"
                                    value={config.telefono}
                                    onIonInput={(e) => updateField('telefono', e.detail.value)}
                                />
                            </IonItem>
                            <IonItem>
                                <IonInput
                                    label="Dirección"
                                    labelPlacement="floating"
                                    value={config.direccion}
                                    onIonInput={(e) => updateField('direccion', e.detail.value)}
                                />
                            </IonItem>
                            <IonItem>
                                <IonInput
                                    label="Horario"
                                    labelPlacement="floating"
                                    value={config.horario}
                                    onIonInput={(e) => updateField('horario', e.detail.value)}
                                    placeholder="Lun-Vie 10:00-22:00"
                                />
                            </IonItem>
                        </IonCardContent>
                    </IonCard>

                    {/* Redes Sociales */}
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>Redes Sociales</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonItem>
                                <IonInput
                                    label="Instagram"
                                    labelPlacement="floating"
                                    value={config.redesSociales?.instagram || ''}
                                    onIonInput={(e) => updateSocialField('instagram', e.detail.value || '')}
                                    placeholder="@tu_restaurante"
                                />
                            </IonItem>
                            <IonItem>
                                <IonInput
                                    label="WhatsApp"
                                    labelPlacement="floating"
                                    value={config.redesSociales?.whatsapp || ''}
                                    onIonInput={(e) => updateSocialField('whatsapp', e.detail.value || '')}
                                    placeholder="+507-0000-0000"
                                />
                            </IonItem>
                        </IonCardContent>
                    </IonCard>

                    {/* Save Button (Mobile) */}
                    <IonButton 
                        expand="block" 
                        onClick={handleSave} 
                        disabled={saving}
                        style={{ marginTop: 20, marginBottom: 40 }}
                    >
                        <IonIcon icon={saveOutline} slot="start" />
                        Guardar Configuración
                    </IonButton>
                </div>

                <IonLoading isOpen={loading} message="Cargando..." />
                <IonLoading isOpen={saving} message="Guardando..." />
                <IonToast isOpen={!!error} message={error} duration={3000} color="danger" onDidDismiss={() => setError('')} />
                <IonToast isOpen={!!success} message={success} duration={3000} color="success" onDidDismiss={() => setSuccess('')} />
            </IonContent>
        </IonPage>
    );
};

export default ConfiguracionMenu;
