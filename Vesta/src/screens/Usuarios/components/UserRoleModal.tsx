import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { User } from '../../../hooks/useUsuarios';

interface Props {
    visible: boolean;
    onClose: () => void;
    selectedUser: User | null;
    onConfirm: (id: string, newRol: string) => void;
    colors: any;
    styles: any;
}

export const UserRoleModal: React.FC<Props> = ({
    visible, onClose, selectedUser, onConfirm, colors, styles
}) => {
    const [tempRole, setTempRole] = useState<string>('usuario');

    useEffect(() => {
        if (selectedUser) setTempRole(selectedUser.rol);
    }, [selectedUser]);

    return (
        <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
                    <Animated.View entering={SlideInDown.duration(300).springify()} style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                                    Editar <Text style={{ color: colors.primary }}>Rol</Text>
                                </Text>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textMuted, marginTop: 4 }}>
                                    {selectedUser?.nombre}
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <Ionicons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {[
                                { id: 'admin', name: 'Administrador', icon: 'options', desc: 'Acceso total para editar catálogo y modificar ventas', color: '#3b82f6' },
                                { id: 'usuario', name: 'Cajero/Mesero', icon: 'person', desc: 'Acceso solamente al Punto de Venta (POS)', color: '#10b981' },
                            ].map((rol) => {
                                const isSelected = tempRole === rol.id;
                                return (
                                    <TouchableOpacity
                                        key={rol.id}
                                        style={[
                                            styles.roleOption,
                                            { backgroundColor: colors.surface, borderColor: isSelected ? rol.color : colors.border },
                                            isSelected && { backgroundColor: `${rol.color}0A` }
                                        ]}
                                        onPress={() => setTempRole(rol.id)}
                                    >
                                        <View style={[styles.roleIconBox, { backgroundColor: `${rol.color}15` }]}>
                                            <Ionicons name={rol.icon as any} size={20} color={rol.color} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.roleOptionText, { color: isSelected ? rol.color : colors.textPrimary }]}>{rol.name}</Text>
                                            <Text style={[styles.roleOptionSub, { color: colors.textMuted }]}>{rol.desc}</Text>
                                        </View>
                                        {isSelected && <Ionicons name="checkmark-circle" size={24} color={rol.color} />}
                                    </TouchableOpacity>
                                );
                            })}

                            <TouchableOpacity
                                style={[styles.updateBtn, { backgroundColor: tempRole === selectedUser?.rol ? colors.surface : colors.primary }]}
                                onPress={() => selectedUser && onConfirm(selectedUser._id, tempRole)}
                                disabled={tempRole === selectedUser?.rol}
                            >
                                <Text style={[styles.updateBtnText, tempRole === selectedUser?.rol && { color: colors.textMuted }]}>Actualizar Permisos</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};
