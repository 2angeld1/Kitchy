import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KitchyInput } from '../../../components/KitchyInput';

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
    const [categoria, setCategoria] = useState<'COMIDA' | 'BELLEZA'>('COMIDA');
    const [horarios, setHorarios] = useState<any>({});
    
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (negocio) {
            setNombre(negocio.nombre || '');
            setTelefono(negocio.telefono || '');
            setDireccion(negocio.direccion || '');
            setCategoria(negocio.categoria || 'COMIDA');
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
            nombre, categoria, telefono, direccion, horarios 
        });
        if (success) {
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
                                width: '100%',
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
                            <KitchyInput label="Nombre del Negocio" value={nombre} onChangeText={setNombre} />
                            <KitchyInput label="WhatsApp" placeholder="Ej. 61234567" keyboardType="phone-pad" value={telefono} onChangeText={setTelefono} />
                            <KitchyInput label="Dirección Física" placeholder="Ej. Calle 50, local 4" value={direccion} onChangeText={setDireccion} />

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
