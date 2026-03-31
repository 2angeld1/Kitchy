import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';

export const CaitlynOnboardingWizard = () => {
    const { user, updateOnboardingProgress } = useAuth();
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    const [loading, setLoading] = useState(false);
    const [caitlynAction, setCaitlynAction] = useState('');
    
    // Step 1: Factura
    const [scannedItem, setScannedItem] = useState<{ nombre: string; costo: number; cantidad: number } | null>(null);

    // Step 2: Producto IA
    const [platoDeseado, setPlatoDeseado] = useState('');
    const [recetaGenerada, setRecetaGenerada] = useState<any>(null);

    const negocioActual = typeof user?.negocioActivo === 'object' ? user.negocioActivo : null;
    const step = negocioActual?.onboardingStep;
    const isBelleza = negocioActual?.categoria === 'BELLEZA';

    const validatedRef = React.useRef(false);

    useEffect(() => {
        if (step === undefined || step >= 4 || validatedRef.current) return;

        const validateOnboarding = async () => {
            validatedRef.current = true;
            try {
                if (isBelleza) {
                    await updateOnboardingProgress(4);
                    return;
                }

                const [prodRes, invRes, venRes] = await Promise.all([
                    api.get('/productos', { params: { limit: 1 } }),
                    api.get('/inventario', { params: { limit: 1 } }),
                    api.get('/ventas', { params: { limit: 1 } })
                ]);

                const tieneProductos = prodRes.data && prodRes.data.length > 0;
                const tieneInventario = invRes.data && invRes.data.length > 0;
                const tieneHistorial = venRes.data && venRes.data.length > 0;

                // Si ya tiene algún registro (productos OR inventario OR historial),
                // asumimos que no necesita el onboarding para nuevos usuarios desde 0.
                if (tieneProductos || tieneInventario || tieneHistorial) {
                    await updateOnboardingProgress(4);
                }
            } catch (error) {
                console.error('Error validando onboarding:', error);
                validatedRef.current = false;
            }
        };
        
        validateOnboarding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, isBelleza]);

    if (step === undefined || step >= 4) {
        return null;
    }

    const avatarSource = isBelleza ? require('../../assets/caitlyn_beauty_avatar.png') : require('../../assets/caitlyn_avatar.png');

    const handleNextStep = async (nextStep: number) => {
        setLoading(true);
        try {
            await updateOnboardingProgress(nextStep);
            setScannedItem(null);
            setRecetaGenerada(null);
            setPlatoDeseado('');
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No pudimos guardar tu progreso' });
        } finally {
            setLoading(false);
        }
    };

    // --- ACCIÓN PASO 1: Escanear Factura ---
    const handleEscanearFactura = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({ type: 'error', text1: 'Permiso Denegado', text2: 'Necesitamos la cámara para leer la factura.' });
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            base64: true,
            quality: 0.6,
        });

        if (!result.canceled && result.assets[0].base64) {
            setLoading(true);
            setCaitlynAction('Pensando... leyendo los tickets de compra 🧾👓');
            try {
                const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
                const res = await api.post('/agente/invoice', { imagen: base64Img });
                
                if (res.data.items && res.data.items.length > 0) {
                    const firstItem = res.data.items[0];
                    const invItem = {
                        nombre: firstItem.nombre || 'Insumo Misterioso',
                        costo: parseFloat(firstItem.precioUnitario) || parseFloat(firstItem.total) || 5.00,
                        cantidad: parseFloat(firstItem.cantidad) || 1
                    };
                    
                    // Guardar en la BD el insumo auto-detectado
                    await api.post('/inventario', {
                        nombre: invItem.nombre,
                        costoUnitario: invItem.costo,
                        cantidad: invItem.cantidad,
                        categoria: isBelleza ? 'herramienta' : 'insumo',
                        unidadMedida: 'unidad',
                        cantidadMinima: 1
                    });

                    setScannedItem(invItem);
                    Toast.show({ type: 'success', text1: '¡Leído!', text2: `Guardado: ${invItem.nombre}` });
                    setTimeout(() => handleNextStep(2), 2500); // Avanzar después de mostrar qué leyó
                } else {
                    Toast.show({ type: 'error', text1: 'Sin resultados', text2: 'Caitlyn no encontró productos aquí.' });
                }
            } catch (error) {
                Toast.show({ type: 'error', text1: 'Error IA', text2: 'No pude leer la factura correctamente.' });
            } finally {
                setLoading(false);
            }
        }
    };

    // --- ACCIÓN PASO 2: Generar Receta con IA ---
    const handleGenerarReceta = async () => {
        if (!platoDeseado) {
            Toast.show({ type: 'info', text1: 'Dime qué venderás', text2: 'Escribe el nombre del plato o servicio primero.' });
            return;
        }
        setLoading(true);
        setCaitlynAction('Armando la receta perfecta... 👩🏻‍🍳✨');
        try {
            const res = await api.post('/agente/recipe/suggest', {
                nombrePlato: platoDeseado,
                servingSize: 1,
                categoria: 'General'
            });

            if (res.data.success) {
                setRecetaGenerada({
                    nombre: platoDeseado,
                    ingredientes: res.data.recipe,
                    precioSugerido: res.data.precioSugerido,
                    costoTotal: res.data.costoTotal,
                    faltantes: res.data.faltantes
                });
            }
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Uy', text2: 'Hubo un fallo generando la receta.' });
        } finally {
            setLoading(false);
        }
    };

    const handleGuardarProductoIA = async () => {
        if (!recetaGenerada) return;
        setLoading(true);
        setCaitlynAction('Guardando en tu menú...');
        try {
            // Transformar receta en objeto para Producto
            const descIngredientes = recetaGenerada.ingredientes.map((i: any) => `${i.cantidad} ${i.unidad} ${i.nombre}`).join(', ');
            await api.post('/productos', {
                nombre: recetaGenerada.nombre,
                precio: parseFloat(recetaGenerada.precioSugerido),
                descripcion: `Creado con Caitlyn AI ✨ Contiene: ${descIngredientes}`,
                categoria: 'General'
            });
            await handleNextStep(3);
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar el producto.' });
            setLoading(false);
        }
    };

    return (
        <Modal visible={true} transparent={true} animationType="fade">
            <View style={styles.overlay}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    
                    {/* Header con Avatar */}
                    <View style={styles.header}>
                        <View style={[styles.avatarContainer, { borderColor: colors.primary }]}>
                            <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />
                        </View>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>
                            {step === 0 && '¡Hola, soy Caitlyn! ✨'}
                            {step === 1 && 'Paso 1: Inteligencia Visual 📷'}
                            {step === 2 && 'Paso 2: Ingeniería de Menú 👩🏻‍🍳'}
                            {step === 3 && '¡Todo Listo! 🚀'}
                        </Text>
                    </View>

                    {/* Contenido Dinámico */}
                    <View style={styles.content}>
                        {step === 0 && (
                            <>
                                <Text style={[styles.message, { color: colors.textSecondary }]}>
                                    Soy tu socia e Inteligencia Artificial corporativa. No tienes que hacer el trabajo aburrido tú solo. 
                                    ¿Qué tal si me dejas hacer magia para configurar tu negocio en 60 segundos?
                                </Text>
                                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={() => handleNextStep(1)}>
                                    <Text style={styles.primaryButtonText}>¡Muéstrame esa magia!</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {step === 1 && (
                            <>
                                <Text style={[styles.message, { color: colors.textSecondary }]}>
                                    No te haré escribir el inventario a mano. Sube o toma una foto de la factura de tu reciente compra. ¡Yo la leeré por ti!
                                </Text>
                                
                                {scannedItem ? (
                                    <View style={{ backgroundColor: `${colors.primary}10`, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.primary, marginBottom: 20 }}>
                                        <Ionicons name="checkmark-circle" size={30} color={colors.primary} style={{ alignSelf: 'center' }} />
                                        <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16, color: colors.primary, marginTop: 8 }}>¡Factura Procesada!</Text>
                                        <Text style={{ textAlign: 'center', color: colors.textPrimary, marginTop: 4 }}>
                                            Detecté y guardé: {scannedItem.nombre} ({scannedItem.cantidad} uds a ${scannedItem.costo.toFixed(2)})
                                        </Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity style={[styles.outlineButton, { borderColor: colors.primary, marginBottom: 20 }]} onPress={handleEscanearFactura} disabled={loading}>
                                        <Ionicons name="camera-outline" size={24} color={colors.primary} />
                                        <Text style={[styles.outlineButtonText, { color: colors.primary, marginLeft: 8 }]}>Escanear Factura</Text>
                                    </TouchableOpacity>
                                )}

                                {loading && <Text style={{ textAlign: 'center', color: colors.textSecondary, marginBottom: 16 }}>{caitlynAction}</Text>}
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <Text style={[styles.message, { color: colors.textSecondary }]}>
                                    Ahora usaré lo que escaneamos. Dime qué plato o servicio quieres vender, y yo buscaré la receta perfecta y te calcularé cuánto cobrar para no perder dinero.
                                </Text>
                                
                                {!recetaGenerada ? (
                                    <>
                                        <TextInput 
                                            style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background, marginBottom: 16 }]} 
                                            placeholder={isBelleza ? "Ej: Tinturado Balayage" : "Ej: Hamburguesa Doble"} 
                                            placeholderTextColor={colors.textMuted}
                                            value={platoDeseado} onChangeText={setPlatoDeseado}
                                        />
                                        <TouchableOpacity style={[styles.outlineButton, { borderColor: colors.primary, marginBottom: 20 }]} onPress={handleGenerarReceta} disabled={loading}>
                                            <Ionicons name="sparkles" size={24} color={colors.primary} />
                                            <Text style={[styles.outlineButtonText, { color: colors.primary, marginLeft: 8 }]}>Generar Receta con IA</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <ScrollView style={{ maxHeight: 200, backgroundColor: `${colors.primary}05`, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 16 }}>
                                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.textPrimary, marginBottom: 8 }}>{recetaGenerada.nombre}</Text>
                                        {recetaGenerada.ingredientes.map((ing: any, i: number) => (
                                            <Text key={i} style={{ color: colors.textSecondary, marginBottom: 4 }}>
                                                • {ing.cantidad} {ing.unidad} {ing.nombre}
                                            </Text>
                                        ))}
                                        <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
                                            <Text style={{ color: colors.textSecondary }}>Costo Elaboración: ${recetaGenerada.costoTotal.toFixed(2)}</Text>
                                            <Text style={{ fontWeight: 'bold', color: colors.primary, fontSize: 18, marginTop: 4 }}>Precio Sugerido: ${recetaGenerada.precioSugerido.toFixed(2)}</Text>
                                        </View>
                                    </ScrollView>
                                )}

                                {recetaGenerada && (
                                    <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleGuardarProductoIA} disabled={loading}>
                                        <Text style={styles.primaryButtonText}>Aprobar y Guardar Producto</Text>
                                    </TouchableOpacity>
                                )}

                                {loading && <Text style={{ textAlign: 'center', color: colors.textSecondary, marginBottom: 16 }}>{caitlynAction}</Text>}
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <View style={{ alignItems: 'center', marginVertical: 10 }}>
                                    <Ionicons name="rocket-outline" size={50} color={colors.primary} />
                                </View>
                                <Text style={[styles.message, { color: colors.textSecondary, textAlign: 'center' }]}>
                                    ¡Wow! Viste cómo hicimos todo sin escribir ni un solo precio a mano. Tu negocio ya es del futuro. 
                                    He desbloqueado la app. Ve al POS y prueba vender tu nuevo invento.
                                </Text>
                                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary, marginTop: 10 }]} onPress={() => handleNextStep(4)}>
                                    <Text style={styles.primaryButtonText}>Liberar a la Bestia 🔥</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {step < 3 && (
                            <TouchableOpacity onPress={() => handleNextStep(4)} style={{ marginTop: 16, alignItems: 'center' }} disabled={loading}>
                                <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' }}>
                                    Saltar tutorial
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                </View>
            </View>
        </Modal>
    );
};

// ... estilos previos
const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    card: { width: '100%', borderRadius: 24, padding: 24, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
    header: { alignItems: 'center', marginBottom: 20 },
    avatarContainer: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, overflow: 'hidden', marginBottom: 12, backgroundColor: '#fff' },
    avatar: { width: '100%', height: '100%' },
    title: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
    content: { alignItems: 'stretch' },
    message: { fontSize: 15, lineHeight: 22, marginBottom: 24, textAlign: 'left' },
    input: { height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 16 },
    primaryButton: { height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    outlineButton: { height: 52, borderRadius: 16, borderWidth: 2, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
    outlineButtonText: { fontSize: 16, fontWeight: '800' }
});
