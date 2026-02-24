import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../theme';
import { styles } from '../styles/UsuariosScreen.styles';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useUsuarios, User } from '../hooks/useUsuarios';
import Toast from 'react-native-toast-message';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { TouchableOpacity as GHTouchableOpacity } from 'react-native-gesture-handler';

export default function UsuariosScreen() {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const navigation = useNavigation();

    const {
        usuarios, loading, refreshing, error, clearError, success, clearSuccess,
        handleRefresh, handleChangeRole, handleDeleteUser
    } = useUsuarios();

    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [tempRole, setTempRole] = useState<string>('usuario');

    useEffect(() => {
        if (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: error });
            clearError();
        }
        if (success) {
            Toast.show({ type: 'success', text1: 'Éxito', text2: success });
            clearSuccess();
        }
    }, [error, success]);

    const openRoleModal = (user: User) => {
        setSelectedUser(user);
        setTempRole(user.rol);
        setShowModal(true);
    };

    const confirmRoleChange = () => {
        if (selectedUser && selectedUser.rol !== tempRole) {
            handleChangeRole(selectedUser._id, tempRole);
        }
        setShowModal(false);
    };

    const getRoleColor = (rol: string) => {
        switch (rol) {
            case 'superadmin': return '#e11d48'; // Red
            case 'admin': return '#3b82f6'; // Blue
            default: return '#10b981'; // Green for usuario
        }
    };

    const getRoleLabel = (rol: string) => {
        switch (rol) {
            case 'superadmin': return 'SuperAdmin';
            case 'admin': return 'Administrador';
            default: return 'Cajero/Mesero';
        }
    };

    const getRoleIcon = (rol: string) => {
        switch (rol) {
            case 'superadmin': return 'shield-checkmark';
            case 'admin': return 'options';
            default: return 'person';
        }
    };

    const renderRightActions = (item: User) => {
        // Validación más robusta: que sea superadmin o contenga '@superadmin' literal en su email
        const isGodUser = item.rol === 'superadmin' || item.email.includes('@superadmin');

        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%' }}>
                <TouchableOpacity
                    style={{ backgroundColor: colors.surface, width: 60, height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 16, marginRight: 4, borderWidth: 1, borderColor: colors.border }}
                    onPress={() => openRoleModal(item)}
                >
                    <Ionicons name="key" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                {!isGodUser && (
                    <TouchableOpacity
                        style={{ backgroundColor: 'rgba(225, 29, 72, 0.1)', width: 60, height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(225, 29, 72, 0.2)' }}
                        onPress={() => handleDeleteUser(item._id)}
                    >
                        <Ionicons name="trash" size={22} color="#e11d48" />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <KitchyToolbar title="Usuarios" onBack={() => navigation.goBack()} />

            <ScrollView
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
            >
                {usuarios.length > 0 ? (
                    usuarios.map((user, index) => (
                        <Animated.View key={user._id} entering={FadeInDown.delay(index * 50)} style={{ marginBottom: 8 }}>
                            <Swipeable renderRightActions={() => renderRightActions(user)}>
                                <GHTouchableOpacity
                                    style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                    activeOpacity={0.8}
                                    onPress={() => openRoleModal(user)}
                                >
                                    <View style={[styles.avatarBox, { backgroundColor: `${getRoleColor(user.rol)}15` }]}>
                                        <Ionicons name={getRoleIcon(user.rol) as any} size={24} color={getRoleColor(user.rol)} />
                                    </View>

                                    <View style={styles.infoContainer}>
                                        <Text style={[styles.nameText, { color: colors.textPrimary }]} numberOfLines={1}>{user.nombre}</Text>

                                        <View style={[styles.roleTag, { backgroundColor: `${getRoleColor(user.rol)}15` }]}>
                                            <Ionicons name="ribbon" size={12} color={getRoleColor(user.rol)} />
                                            <Text style={[styles.roleText, { color: getRoleColor(user.rol) }]}>{getRoleLabel(user.rol)}</Text>
                                        </View>

                                        <Text style={[styles.emailText, { color: colors.textSecondary }]}>{user.email}</Text>
                                    </View>

                                    <Ionicons name="chevron-back" size={18} color={colors.textMuted} style={{ opacity: 0.8 }} />
                                </GHTouchableOpacity>
                            </Swipeable>
                        </Animated.View>
                    ))
                ) : (
                    !loading && (
                        <Animated.View entering={FadeInDown} style={styles.emptyState}>
                            <View style={[styles.emptyIconBox, { backgroundColor: colors.surface }]}>
                                <Ionicons name="people-outline" size={40} color={colors.textMuted} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sin Usuarios</Text>
                            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                                Aún no hay usuarios registrados en el sistema de este negocio.
                            </Text>
                        </Animated.View>
                    )
                )}
            </ScrollView>

            {/* Modal Editar Rol */}
            <Modal visible={showModal} animationType="slide" transparent={true} onRequestClose={() => setShowModal(false)}>
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
                        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                            <View style={styles.modalHeader}>
                                <View>
                                    <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                                        Editar <Text style={{ color: colors.primary }}>Rol</Text>
                                    </Text>
                                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textMuted, marginTop: 4 }}>
                                        {selectedUser?.nombre}
                                    </Text>
                                </View>
                                <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.surface }]} onPress={() => setShowModal(false)}>
                                    <Ionicons name="close" size={24} color={colors.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {[
                                    { id: 'superadmin', name: 'SuperAdmin', icon: 'shield-checkmark', desc: 'Acceso total a borrar el negocio y facturacion', color: '#e11d48' },
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
                                    onPress={confirmRoleChange}
                                    disabled={tempRole === selectedUser?.rol}
                                >
                                    <Text style={[styles.updateBtnText, tempRole === selectedUser?.rol && { color: colors.textMuted }]}>Actualizar Permisos</Text>
                                </TouchableOpacity>

                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

        </View>
    );
}
