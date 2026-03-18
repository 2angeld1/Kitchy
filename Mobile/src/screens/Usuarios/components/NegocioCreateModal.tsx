import React, { useState } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { KitchyInput } from '../../../components/KitchyInput';

interface Props {
    visible: boolean;
    onClose: () => void;
    onConfirm: (data: { nombre: string, categoria: 'COMIDA' | 'BELLEZA' }) => Promise<any>;
    onSwitch: (user: any, token: string) => Promise<void>;
    loading: boolean;
    colors: any;
    styles: any;
}

export const NegocioCreateModal: React.FC<Props> = ({ 
    visible, onClose, onConfirm, onSwitch, loading, colors, styles 
}) => {
    const [nombre, setNombre] = useState('');
    const [categoria, setCategoria] = useState<'COMIDA' | 'BELLEZA'>('COMIDA');

    const handleSubmit = async () => {
        const res = await onConfirm({ nombre, categoria });
        if (res?.success) {
            setNombre('');
            onClose();
            if (res.user && res.token) {
                await onSwitch(res.user, res.token);
            }
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
                    <Animated.View entering={SlideInDown.duration(300).springify()} style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                                    Nuevo <Text style={{ color: colors.primary }}>Negocio</Text>
                                </Text>
                                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textMuted, marginTop: 4 }}>
                                    Abre otra sucursal o foodtruck
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <Ionicons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KitchyInput label="Nombre del Negocio" placeholder="Ej. Burguer Truck II" value={nombre} onChangeText={setNombre} />

                            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 12, marginTop: 10, marginHorizontal: 28 }}>\u00bfQu\u00e9 tipo de negocio es?</Text>
                            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16, marginHorizontal: 28 }}>
                                <TouchableOpacity
                                    onPress={() => setCategoria('COMIDA')}
                                    style={{
                                        flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center',
                                        backgroundColor: categoria === 'COMIDA' ? 'rgba(225, 29, 72, 0.1)' : colors.surface,
                                        borderWidth: 2, borderColor: categoria === 'COMIDA' ? colors.primary : colors.border
                                    }}
                                >
                                    <Ionicons name="restaurant-outline" size={24} color={categoria === 'COMIDA' ? colors.primary : colors.textMuted} />
                                    <Text style={{ color: categoria === 'COMIDA' ? colors.primary : colors.textSecondary, fontWeight: '700', marginTop: 4, fontSize: 12 }}>Comida</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setCategoria('BELLEZA')}
                                    style={{
                                        flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center',
                                        backgroundColor: categoria === 'BELLEZA' ? 'rgba(139, 92, 246, 0.1)' : colors.surface,
                                        borderWidth: 2, borderColor: categoria === 'BELLEZA' ? '#8b5cf6' : colors.border
                                    }}
                                >
                                    <Ionicons name="cut-outline" size={24} color={categoria === 'BELLEZA' ? '#8b5cf6' : colors.textMuted} />
                                    <Text style={{ color: categoria === 'BELLEZA' ? '#8b5cf6' : colors.textSecondary, fontWeight: '700', marginTop: 4, fontSize: 12 }}>Belleza</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={[styles.inputHelper, { color: colors.textMuted }]}>
                                * Este nuevo negocio tendr\u00e1 inventario y ventas 100% independientes.
                            </Text>

                            <TouchableOpacity
                                style={[styles.updateBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                <Text style={styles.updateBtnText}>{loading ? 'Creando...' : 'Crear Negocio'}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};
