import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../theme';
import { createStyles } from '../styles/UsuariosScreen.styles';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useUsuarios, User } from '../hooks/useUsuarios';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';

// Subcomponentes extra\u00eddos
import { UserItemCard } from './Usuarios/components/UserItemCard';
import { UserRoleModal } from './Usuarios/components/UserRoleModal';
import { UserCreateModal } from './Usuarios/components/UserCreateModal';
import { NegocioCreateModal } from './Usuarios/components/NegocioCreateModal';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function UsuariosScreen() {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const styles = useMemo(() => createStyles(colors), [colors]);
    const navigation = useNavigation();

    const { user: currentUser, switchNegocioContext } = useAuth();
    const {
        usuarios, loading, refreshing, isSubmittingNegocio, error, clearError, success, clearSuccess,
        handleRefresh, handleChangeRole, handleDeleteUser, handleCreateUser, handleCreateNegocio, getRoleInfo
    } = useUsuarios();

    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCreateNegocioModal, setShowCreateNegocioModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        if (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: error, position: 'top', onHide: clearError });
        }
        if (success) {
            Toast.show({ type: 'success', text1: '\u00c9xito', text2: success, position: 'top', onHide: clearSuccess });
        }
    }, [error, success]);

    const handleSwitchContext = async (user: any, token: string) => {
        const activeNegocio = typeof user.negocioActivo === 'object' 
            ? user.negocioActivo 
            : (user.negocioIds?.find((n: any) => (n._id || n) === user.negocioActivo));

        const categoria = (activeNegocio?.categoria || '').toUpperCase();

        await switchNegocioContext(user, token);
        
        (navigation as any).reset({
            index: 0,
            routes: [{ name: 'Main' }],
        });

        Toast.show({ type: 'success', text1: '\u00c9xito', text2: `Cambiado a ${activeNegocio?.nombre || 'nuevo negocio'}` });
    };

    return (
        <View style={styles.container}>
            <KitchyToolbar title="Usuarios" onBack={() => navigation.goBack()} />

            <ScrollView
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
            >
                {usuarios.length > 0 ? (
                    usuarios.map((user, index) => (
                        <UserItemCard
                            key={user._id}
                            user={user}
                            index={index}
                            isMe={currentUser?.id === user._id}
                            colors={colors}
                            styles={styles}
                            onEditRole={(u) => { setSelectedUser(u); setShowRoleModal(true); }}
                            onDelete={handleDeleteUser}
                            getRoleInfo={getRoleInfo}
                        />
                    ))
                ) : (
                    !loading && (
                        <Animated.View entering={FadeInDown} style={styles.emptyState}>
                            <View style={styles.emptyIconBox}>
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
                    >
                        <Ionicons name="storefront" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: colors.primary }]}
                    onPress={() => setShowCreateModal(true)}
                >
                    <Ionicons name="person-add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Modales Extra\u00eddos */}
            <UserRoleModal
                visible={showRoleModal}
                onClose={() => setShowRoleModal(false)}
                selectedUser={selectedUser}
                onConfirm={(id, role) => { handleChangeRole(id, role); setShowRoleModal(false); }}
                colors={colors}
                styles={styles}
            />

            <UserCreateModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onConfirm={handleCreateUser}
                loading={loading}
                colors={colors}
                styles={styles}
            />

            <NegocioCreateModal
                visible={showCreateNegocioModal}
                onClose={() => setShowCreateNegocioModal(false)}
                onConfirm={handleCreateNegocio}
                onSwitch={handleSwitchContext}
                loading={isSubmittingNegocio}
                colors={colors}
                styles={styles}
            />
        </View>
    );
}
