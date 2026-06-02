import React, { useState } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { KitchyInput } from '../../../components/KitchyInput';

interface Props {
    visible: boolean;
    onClose: () => void;
    onConfirm: (data: any) => Promise<boolean>;
    loading: boolean;
    colors: any;
    styles: any;
}

export const UserCreateModal: React.FC<Props> = ({
    visible, onClose, onConfirm, loading, colors, styles
}) => {
    const [form, setForm] = useState({ nombre: '', email: '', password: '' });

    const handleSubmit = async () => {
        const success = await onConfirm({ ...form, rol: 'usuario' });
        if (success) {
            setForm({ nombre: '', email: '', password: '' });
            onClose();
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
                                    Nuevo <Text style={{ color: colors.primary }}>Empleado</Text>
                                </Text>
                                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textMuted, marginTop: 4 }}>
                                    Añade a alguien a tu equipo
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <Ionicons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KitchyInput label="Nombre Completo" placeholder="Ej. Juan P\u00e9rez" value={form.nombre} onChangeText={(t) => setForm({ ...form, nombre: t })} />
                            <KitchyInput label="Correo Electróico" placeholder="juan@ejemplo.com" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} keyboardType="email-address" autoCapitalize="none" />
                            <KitchyInput label="Contrase\u00f1a" placeholder="Minimo 6 caracteres" value={form.password} onChangeText={(t) => setForm({ ...form, password: t })} secureTextEntry />

                            <Text style={[styles.inputHelper, { color: colors.textMuted }]}>
                                * Los usuarios nuevos siempre se crean como Cajero/Mesero por seguridad.
                                Luego podr\u00e1s cambiarles el rol.
                            </Text>

                            <TouchableOpacity
                                style={[styles.updateBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                <Text style={styles.updateBtnText}>{loading ? 'Creando...' : 'Crear Usuario'}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};
