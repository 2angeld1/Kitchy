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
import { useAuth } from '../context/AuthContext';
import { KitchyInput } from '../components/KitchyInput';
import { createNegocio } from '../services/api';

export default function UsuariosScreen() {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const navigation = useNavigation();

    const { user: currentUser, switchNegocioContext } = useAuth();
    const {
        usuarios, loading, refreshing, error, clearError, success, clearSuccess,
        handleRefresh, handleChangeRole, handleDeleteUser, handleCreateUser
    } = useUsuarios();

    const [showModal, setShowModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCreateNegocioModal, setShowCreateNegocioModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [tempRole, setTempRole] = useState<string>('usuario');
    const [isSubmittingNegocio, setIsSubmittingNegocio] = useState(false);

    // Formulario de nuevo usuario
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');

    // Formulario de nuevo negocio
    const [newNegocioNombre, setNewNegocioNombre] = useState('');

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

    const confirmCreateUser = async () => {
        if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Llena todos los campos' });
            return;
        }

        const success = await handleCreateUser({
            nombre: newUserName,
            email: newUserEmail,
            password: newUserPassword,
            rol: 'usuario' // Siempre empieza como usuario
        });

        if (success) {
            setShowCreateModal(false);
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('');
        }
    };

    const confirmCreateNegocio = async () => {
        if (!newNegocioNombre.trim()) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Ingresa el nombre del negocio' });
            return;
        }

        setIsSubmittingNegocio(true);
        try {
            const res = await createNegocio({ nombre: newNegocioNombre });
            Toast.show({ type: 'success', text1: 'Éxito', text2: 'Negocio creado correctamente' });
            setShowCreateNegocioModal(false);
            setNewNegocioNombre('');

            if (res.data.success && res.data.user) {
                clearSuccess(); // clear from hook so toast isn't overridden
                await switchNegocioContext(res.data.user, res.data.token);
                Toast.show({ type: 'success', text1: 'Éxito', text2: `Cambiado a ${res.data.user.negocioIds.length} negocios.` });
            }

        } catch (err: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: err.response?.data?.message || 'Error al crear negocio' });
        } finally {
            setIsSubmittingNegocio(false);
        }
    };

    const getRoleColor = (rol: string) => {
        switch (rol) {
            case 'admin': return '#3b82f6'; // Blue
            default: return '#10b981'; // Green for usuario
        }
    };

    const getRoleLabel = (rol: string) => {
        switch (rol) {
            case 'admin': return 'Administrador';
            default: return 'Cajero/Mesero';
        }
    };

    const getRoleIcon = (rol: string) => {
        switch (rol) {
            case 'admin': return 'options';
            default: return 'person';
        }
    };

    const renderRightActions = (item: User) => {
        // No se puede borrar a un admin desde la app
        const isProtected = item.rol === 'admin';

        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%' }}>
                <TouchableOpacity
                    style={{ backgroundColor: colors.surface, width: 60, height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 16, marginRight: 4, borderWidth: 1, borderColor: colors.border }}
                    onPress={() => openRoleModal(item)}
                >
                    <Ionicons name="key" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                {!isProtected && (
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
                    usuarios.map((user, index) => {
                        const isMe = currentUser?.id === user._id;
                        return (
                            <Animated.View key={user._id} entering={FadeInDown.delay(index * 50)} style={{ marginBottom: 8 }}>
                                <Swipeable renderRightActions={() => isMe ? <View /> : renderRightActions(user)}>
                                    <GHTouchableOpacity
                                        style={[styles.userCard, { backgroundColor: isMe ? `${colors.primary}10` : colors.card, borderColor: isMe ? colors.primary : colors.border }]}
                                        activeOpacity={0.8}
                                        onPress={() => !isMe && openRoleModal(user)}
                                    >
                                        <View style={[styles.avatarBox, { backgroundColor: `${getRoleColor(user.rol)}15` }]}>
                                            <Ionicons name={getRoleIcon(user.rol) as any} size={24} color={getRoleColor(user.rol)} />
                                        </View>

                                        <View style={styles.infoContainer}>
                                            <Text style={[styles.nameText, { color: colors.textPrimary }]} numberOfLines={1}>
                                                {user.nombre} {isMe && <Text style={{ color: colors.primary, fontSize: 12 }}> (Tú)</Text>}
                                            </Text>

                                            <View style={[styles.roleTag, { backgroundColor: `${getRoleColor(user.rol)}15` }]}>
                                                <Ionicons name="ribbon" size={12} color={getRoleColor(user.rol)} />
                                                <Text style={[styles.roleText, { color: getRoleColor(user.rol) }]}>{getRoleLabel(user.rol)}</Text>
                                            </View>

                                            <Text style={[styles.emailText, { color: colors.textSecondary }]}>{user.email}</Text>
                                        </View>

                                        {!isMe && <Ionicons name="chevron-back" size={18} color={colors.textMuted} style={{ opacity: 0.8 }} />}
                                    </GHTouchableOpacity>
                                </Swipeable>
                            </Animated.View>
                        )
                    })
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

            <View style={styles.fabContainer}>
                {currentUser?.rol === 'admin' && (
                    <TouchableOpacity
                        style={[styles.fab, { backgroundColor: colors.surface }]}
                        onPress={() => setShowCreateNegocioModal(true)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="storefront" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: colors.primary }]}
                    onPress={() => setShowCreateModal(true)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="person-add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Modal Editar Rol */}
            <Modal visible={showModal} animationType="fade" transparent={true} onRequestClose={() => setShowModal(false)}>
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
                                <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.surface }]} onPress={() => setShowModal(false)}>
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
                                    onPress={confirmRoleChange}
                                    disabled={tempRole === selectedUser?.rol}
                                >
                                    <Text style={[styles.updateBtnText, tempRole === selectedUser?.rol && { color: colors.textMuted }]}>Actualizar Permisos</Text>
                                </TouchableOpacity>

                            </ScrollView>
                        </Animated.View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Modal Crear Usuario */}
            <Modal visible={showCreateModal} animationType="fade" transparent={true} onRequestClose={() => setShowCreateModal(false)}>
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
                                <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.surface }]} onPress={() => setShowCreateModal(false)}>
                                    <Ionicons name="close" size={24} color={colors.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <KitchyInput
                                    label="Nombre Completo"
                                    placeholder="Ej. Juan Pérez"
                                    value={newUserName}
                                    onChangeText={setNewUserName}
                                />
                                <KitchyInput
                                    label="Correo Electrónico"
                                    placeholder="juan@ejemplo.com"
                                    value={newUserEmail}
                                    onChangeText={setNewUserEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                <KitchyInput
                                    label="Contraseña"
                                    placeholder="Minimo 6 caracteres"
                                    value={newUserPassword}
                                    onChangeText={setNewUserPassword}
                                    secureTextEntry
                                />
                                <Text style={[styles.inputHelper, { color: colors.textMuted }]}>
                                    * Los usuarios nuevos siempre se crean como Cajero/Mesero por seguridad.
                                    Luego podrás cambiarles el rol.
                                </Text>

                                <TouchableOpacity
                                    style={[styles.updateBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                                    onPress={confirmCreateUser}
                                    disabled={loading}
                                >
                                    <Text style={styles.updateBtnText}>
                                        {loading ? 'Creando...' : 'Crear Usuario'}
                                    </Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </Animated.View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* Modal Crear Negocio */}
            <Modal visible={showCreateNegocioModal} animationType="fade" transparent={true} onRequestClose={() => setShowCreateNegocioModal(false)}>
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
                                <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.surface }]} onPress={() => setShowCreateNegocioModal(false)}>
                                    <Ionicons name="close" size={24} color={colors.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <KitchyInput
                                    label="Nombre del Negocio"
                                    placeholder="Ej. Burguer Truck II"
                                    value={newNegocioNombre}
                                    onChangeText={setNewNegocioNombre}
                                />
                                <Text style={[styles.inputHelper, { color: colors.textMuted }]}>
                                    * Este nuevo negocio tendrá inventario y ventas 100% independientes.
                                </Text>

                                <TouchableOpacity
                                    style={[styles.updateBtn, { backgroundColor: colors.primary, opacity: isSubmittingNegocio ? 0.7 : 1 }]}
                                    onPress={confirmCreateNegocio}
                                    disabled={isSubmittingNegocio}
                                >
                                    <Text style={styles.updateBtnText}>
                                        {isSubmittingNegocio ? 'Creando...' : 'Crear Negocio'}
                                    </Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </Animated.View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

        </View>
    );
}
