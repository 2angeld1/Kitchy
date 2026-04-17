import React, { useState } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KitchyInput } from '../../../components/KitchyInput';
import { useAuth } from '../../../context/AuthContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
    visible: boolean;
    onClose: () => void;
    onConfirm: (data: { nombre: string, categoria: 'COMIDA' | 'BELLEZA', telefono?: string }) => Promise<any>;
    onSwitch: (user: any, token: string) => Promise<void>;
    loading: boolean;
    colors: any;
    styles: any;
}

export const NegocioCreateModal: React.FC<Props> = ({ 
    visible, onClose, onConfirm, onSwitch, loading, colors, styles 
}) => {
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [categoria, setCategoria] = useState<'COMIDA' | 'BELLEZA'>('COMIDA');
    const insets = useSafeAreaInsets();
    
    const { user } = useAuth();
    const telefonosRegistrados = React.useMemo(() => {
        if (!user?.negocioIds) return [];
        const phones = (user.negocioIds as any[])
            .map(n => typeof n === 'object' ? n.telefono : null)
            .filter(t => t && t.trim() !== '');
        return [...new Set(phones)] as string[];
    }, [user?.negocioIds]);

    const handleSubmit = async () => {
        const res = await onConfirm({ nombre, categoria, telefono });
        if (res?.success) {
            setNombre('');
            setTelefono('');
            onClose();
            if (res.user && res.token) {
                await onSwitch(res.user, res.token);
            }
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
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: -10 },
                                shadowOpacity: 0.1,
                                shadowRadius: 15,
                                elevation: 20
                            }
                        ]}
                    >
                        {/* Indicador superior estético */}
                        <View style={{ 
                            width: 38, height: 5, borderRadius: 3, 
                            backgroundColor: colors.border, alignSelf: 'center', 
                            marginTop: 12, opacity: 0.4 
                        }} />

                        <View style={styles.modalHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.modalTitle, { color: colors.textPrimary, fontSize: 22 }]}>
                                    Nuevo <Text style={{ color: colors.primary }}>Negocio</Text>
                                </Text>
                                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textMuted, marginTop: 2 }}>
                                    Abre otra sucursal o foodtruck
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
                            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 10 }}
                        >
                            <View style={{ marginBottom: 18 }}>
                                <KitchyInput 
                                    label="Nombre del Negocio" 
                                    placeholder="Ej. Burguer Truck II" 
                                    value={nombre} 
                                    onChangeText={setNombre} 
                                    containerStyle={{ marginHorizontal: 0 }}
                                />
                            </View>

                            <View style={{ marginBottom: 18 }}>
                                <KitchyInput 
                                    label="WhatsApp del Negocio (Opcional)" 
                                    placeholder="Ej. 61234567" 
                                    keyboardType="phone-pad"
                                    value={telefono} 
                                    onChangeText={setTelefono} 
                                    containerStyle={{ marginHorizontal: 0 }}
                                />
                                {telefonosRegistrados.length > 0 && (
                                    <ScrollView 
                                        horizontal 
                                        showsHorizontalScrollIndicator={false}
                                        style={{ marginTop: 10, marginHorizontal: 2 }}
                                    >
                                        {telefonosRegistrados.map((tel, idx) => (
                                            <TouchableOpacity 
                                                key={idx}
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    backgroundColor: telefono === tel ? colors.primary + '20' : colors.surface,
                                                    borderWidth: 1,
                                                    borderColor: telefono === tel ? colors.primary : colors.border,
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 6,
                                                    borderRadius: 16,
                                                    marginRight: 8
                                                }}
                                                onPress={() => setTelefono(tel)}
                                            >
                                                <Ionicons name="logo-whatsapp" size={14} color={telefono === tel ? colors.primary : colors.textSecondary} style={{ marginRight: 6 }} />
                                                <Text style={{ fontSize: 12, fontWeight: '600', color: telefono === tel ? colors.primary : colors.textSecondary }}>
                                                    {tel}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}
                            </View>

                            <Text style={{ 
                                fontSize: 13, fontWeight: '800', 
                                color: colors.textSecondary, marginBottom: 12 
                            }}>
                                ¿Qué tipo de negocio es?
                            </Text>

                            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                                <CategoryOption 
                                    selected={categoria === 'COMIDA'}
                                    onPress={() => setCategoria('COMIDA')}
                                    icon="restaurant-outline"
                                    label="Restaurante"
                                    color={colors.primary}
                                    colors={colors}
                                />
                                <CategoryOption 
                                    selected={categoria === 'BELLEZA'}
                                    onPress={() => setCategoria('BELLEZA')}
                                    icon="cut-outline"
                                    label="Belleza"
                                    color="#8b5cf6"
                                    colors={colors}
                                />
                            </View>

                            <View style={{ 
                                backgroundColor: colors.surface, 
                                padding: 14, borderRadius: 16, 
                                borderLeftWidth: 4, borderLeftColor: colors.primary,
                                marginBottom: 24
                            }}>
                                <Text style={[styles.inputHelper, { color: colors.textMuted, marginHorizontal: 0, marginTop: 0, fontSize: 11 }]}>
                                    • Este nuevo negocio tendrá inventario y ventas 100% independientes del actual.
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.updateBtn, 
                                    { 
                                        backgroundColor: colors.primary, 
                                        opacity: loading || !nombre ? 0.6 : 1,
                                        marginHorizontal: 0,
                                        marginTop: 0,
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: 10,
                                        height: 58,
                                        borderRadius: 18
                                    }
                                ]}
                                onPress={handleSubmit}
                                disabled={loading || !nombre}
                            >
                                {loading && (
                                    <Animated.View entering={FadeIn}>
                                        <Ionicons name="sync" size={20} color="#fff" />
                                    </Animated.View>
                                )}
                                <Text style={[styles.updateBtnText, { fontSize: 16 }]}>
                                    {loading ? 'Creando...' : 'Crear Negocio'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const CategoryOption = ({ selected, onPress, icon, label, color, colors }: any) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
            flex: 1, paddingVertical: 20, borderRadius: 20, alignItems: 'center',
            backgroundColor: selected ? `${color}15` : colors.surface,
            borderWidth: 2, borderColor: selected ? color : 'transparent'
        }}
    >
        <Ionicons 
            name={icon} 
            size={28} 
            color={selected ? color : colors.textMuted} 
        />
        <Text style={{ 
            color: selected ? color : colors.textSecondary, 
            fontWeight: '800', marginTop: 8, fontSize: 13 
        }}>
            {label}
        </Text>
    </TouchableOpacity>
);

