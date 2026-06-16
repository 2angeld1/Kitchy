import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VestaInput } from '../../../components/VestaInput';
import { useAuth } from '../../../context/AuthContext';
import { createEspecialista } from '../../../services/api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Horario {
    abierto: boolean;
    inicio: string;
    fin: string;
}

interface Props {
    visible: boolean;
    onClose: () => void;
    negocio: any;
    onConfirm: (id: string, data: any) => Promise<boolean>;
    loading: boolean;
    colors: any;
    styles: any;
}

const DIAS = [
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miercoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' },
];

export const NegocioEditModal: React.FC<Props> = ({ 
    visible, onClose, negocio, onConfirm, loading, colors, styles 
}) => {
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [categoria, setCategoria] = useState<'COMIDA' | 'BELLEZA' | 'FRUTERIA' | 'LAVAUTOS' | 'JARDINERIA'>('BELLEZA');
    const [esLavadero, setEsLavadero] = useState(false);
    const [googleMapsReviewUrl, setGoogleMapsReviewUrl] = useState('');
    const [horarios, setHorarios] = useState<any>({});
    
    const insets = useSafeAreaInsets();
    const { user } = useAuth();

    useEffect(() => {
        if (negocio) {
            setNombre(negocio.nombre || '');
            setTelefono(negocio.telefono || '');
            setDireccion(negocio.direccion || '');
            setGoogleMapsReviewUrl(negocio.googleMapsReviewUrl || '');
            setCategoria(negocio.categoria || 'BELLEZA');
            setHorarios(negocio.horarios || {
                lunes: { abierto: true, inicio: '08:00', fin: '20:00' },
                martes: { abierto: true, inicio: '08:00', fin: '20:00' },
                miercoles: { abierto: true, inicio: '08:00', fin: '20:00' },
                jueves: { abierto: true, inicio: '08:00', fin: '20:00' },
                viernes: { abierto: true, inicio: '08:00', fin: '20:00' },
                sabado: { abierto: true, inicio: '08:00', fin: '20:00' },
                domingo: { abierto: false, inicio: '08:00', fin: '20:00' }
            });
        }
    }, [negocio, visible]);

    const handleToggleDia = (dia: string) => {
        setHorarios({
            ...horarios,
            [dia]: { ...horarios[dia], abierto: !horarios[dia].abierto }
        });
    };

    const handleChangeHora = (dia: string, field: 'inicio' | 'fin', value: string) => {
        setHorarios({
            ...horarios,
            [dia]: { ...horarios[dia], [field]: value }
        });
    };

    const handleSubmit = async () => {
        const success = await onConfirm(negocio._id, { 
            nombre, categoria, telefono, direccion, googleMapsReviewUrl, horarios 
        });
        if (success) {
            if (esLavadero && categoria === 'LAVAUTOS') {
                try {
                    await createEspecialista({
                        nombre: user?.nombre || 'Lavadero',
                        email: user?.email,
                        rol: 'Lavadero',
                        comision: 50,
                        tipoComision: 'fijo' as const,
                        turnoActual: 'ambos',
                        negocioId: negocio._id,
                    });
                } catch (err) {
                    console.error('Error al crear lavadero:', err);
                }
            }
            onClose();
        }
    };

    return (
        <Modal 
            visible={visible} 
            animationType="fade" 
            transparent={true} 
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                <TouchableOpacity 
                    activeOpacity={1} 
                    style={{ flex: 1, width: '100%' }} 
                    onPress={onClose} 
                />
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                    style={{ width: '100%', justifyContent: 'flex-end' }}
                >
                    <Animated.View 
                        entering={SlideInDown.springify().damping(20).stiffness(90)} 
                        style={[
                            styles.modalContent, 
                            { 
                                backgroundColor: colors.background,
                                paddingBottom: Math.max(insets.bottom, 24),
                                paddingTop: insets.top,
                                width: '100%',
                                height: SCREEN_HEIGHT, // Full height
                                borderTopLeftRadius: 32,
                                borderTopRightRadius: 32,
                                marginBottom: 0
                            }
                        ]}
                    >
                        <View style={{ width: 38, height: 5, borderRadius: 3, backgroundColor: colors.border, alignSelf: 'center', marginTop: 12, opacity: 0.4 }} />

                        <View style={styles.modalHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.modalTitle, { color: colors.textPrimary, fontSize: 20 }]}>
                                    Editar <Text style={{ color: colors.primary }}>Negocio</Text>
                                </Text>
                            </View>
                            <TouchableOpacity 
                                style={[styles.closeButton, { backgroundColor: colors.surface, width: 36, height: 36 }]} 
                                onPress={onClose}
                            >
                                <Ionicons name="close" size={20} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView 
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
                        >
                            <VestaInput label="Nombre del Negocio" value={nombre} onChangeText={setNombre} />
                            <VestaInput label="WhatsApp" placeholder="Ej. 61234567" keyboardType="phone-pad" value={telefono} onChangeText={setTelefono} />
                            <VestaInput label="Dirección Física" placeholder="Ej. Calle 50, local 4" value={direccion} onChangeText={setDireccion} />
                            <VestaInput label="Link de Reseñas de Google" placeholder="https://g.page/r/..." value={googleMapsReviewUrl} onChangeText={setGoogleMapsReviewUrl} />

                            <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textSecondary, marginTop: 16, marginBottom: 10, marginLeft: 4 }}>
                                CATEGORÍA DEL NEGOCIO
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                                {[
                                    { value: 'BELLEZA', label: 'Belleza', icon: 'cut-outline' as const, color: '#8b5cf6' },
                                    { value: 'COMIDA', label: 'Comida', icon: 'restaurant-outline' as const, color: '#059669' },
                                    { value: 'FRUTERIA', label: 'Frutería', icon: 'leaf-outline' as const, color: '#10b981' },
                                    { value: 'LAVAUTOS', label: 'Lavautos', icon: 'car-sport-outline' as const, color: '#38BDF8' },
                                    { value: 'JARDINERIA', label: 'Jardinería', icon: 'flower-outline' as const, color: '#f59e0b' },
                                ].map(cat => {
                                    const isSelected = categoria === cat.value;
                                    return (
                                        <TouchableOpacity
                                            key={cat.value}
                                            onPress={() => setCategoria(cat.value as any)}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 6,
                                                paddingHorizontal: 14,
                                                paddingVertical: 10,
                                                borderRadius: 14,
                                                backgroundColor: isSelected ? cat.color + '20' : colors.surface,
                                                borderWidth: 1.5,
                                                borderColor: isSelected ? cat.color : colors.border,
                                            }}
                                        >
                                            <Ionicons name={cat.icon} size={18} color={isSelected ? cat.color : colors.textMuted} />
                                            <Text style={{ fontSize: 12, fontWeight: '800', color: isSelected ? cat.color : colors.textSecondary }}>
                                                {cat.label}
                                            </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                            </View>

                            {categoria === 'LAVAUTOS' && (
                                <TouchableOpacity
                                    onPress={() => setEsLavadero(!esLavadero)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 10,
                                        backgroundColor: esLavadero ? '#38BDF820' : colors.surface,
                                        padding: 12,
                                        borderRadius: 14,
                                        borderWidth: 1.5,
                                        borderColor: esLavadero ? '#38BDF8' : colors.border,
                                        marginBottom: 8,
                                    }}
                                >
                                    <Ionicons
                                        name={esLavadero ? 'checkbox' : 'square-outline'}
                                        size={22}
                                        color={esLavadero ? '#38BDF8' : colors.textMuted}
                                    />
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '800', color: esLavadero ? '#38BDF8' : colors.textPrimary }}>
                                            Soy lavadero
                                        </Text>
                                        <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>
                                            Crear mi perfil como lavadero de este local
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}

                            <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textSecondary, marginTop: 16, marginBottom: 12 }}>
                                HORARIOS DE ATENCIÓN
                            </Text>
                            
                            {DIAS.map((dia) => {
                                const h = horarios[dia.key] || { abierto: false, inicio: '08:00', fin: '20:00' };
                                return (
                                    <View key={dia.key} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: colors.surface, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
                                        <TouchableOpacity 
                                            onPress={() => handleToggleDia(dia.key)}
                                            style={{ flexDirection: 'row', alignItems: 'center', flex: 1.2 }}
                                        >
                                            <Ionicons 
                                                name={h.abierto ? "checkbox" : "square-outline"} 
                                                size={22} 
                                                color={h.abierto ? colors.primary : colors.textMuted} 
                                            />
                                            <Text style={{ fontSize: 13, fontWeight: '700', color: h.abierto ? colors.textPrimary : colors.textMuted, marginLeft: 8 }}>
                                                {dia.label}
                                            </Text>
                                        </TouchableOpacity>

                                        {h.abierto ? (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 2, justifyContent: 'flex-end', gap: 6 }}>
                                                <TextInput 
                                                    value={h.inicio}
                                                    onChangeText={(v) => handleChangeHora(dia.key, 'inicio', v)}
                                                    style={{ backgroundColor: colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontSize: 12, fontWeight: '700', color: colors.textPrimary, width: 55, textAlign: 'center' }}
                                                    placeholder="00:00"
                                                />
                                                <Text style={{ fontSize: 12, color: colors.textMuted }}>a</Text>
                                                <TextInput 
                                                    value={h.fin}
                                                    onChangeText={(v) => handleChangeHora(dia.key, 'fin', v)}
                                                    style={{ backgroundColor: colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontSize: 12, fontWeight: '700', color: colors.textPrimary, width: 55, textAlign: 'center' }}
                                                    placeholder="00:00"
                                                />
                                            </View>
                                        ) : (
                                            <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textMuted, flex: 2, textAlign: 'right' }}>CERRADO</Text>
                                        )}
                                    </View>
                                );
                            })}

                            <TouchableOpacity
                                style={[
                                    styles.updateBtn, 
                                    { 
                                        backgroundColor: colors.primary, 
                                        opacity: loading || !nombre ? 0.6 : 1,
                                        height: 54, borderRadius: 16, marginTop: 20
                                    }
                                ]}
                                onPress={handleSubmit}
                                disabled={loading || !nombre}
                            >
                                <Text style={styles.updateBtnText}>
                                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};
