import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/KitchyToolbar.styles';
import { NotificationModal } from './NotificationModal';
import { useKitchyToolbar } from '../hooks/useKitchyToolbar';

interface KitchyToolbarProps {
    title: string;
    showNotifications?: boolean;
    notifications?: any[]; // Prop opcional para inyectar notificaciones
    extraButtons?: React.ReactNode;
    onBack?: () => void;
    onNotificationPress?: (notif: any) => void;
    showUserMenuButton?: boolean;
    showSwitchNegocioButton?: boolean;
}

export const KitchyToolbar: React.FC<KitchyToolbarProps> = ({
    title,
    showNotifications = true,
    notifications,
    extraButtons,
    onBack,
    onNotificationPress,
    showUserMenuButton = true,
    showSwitchNegocioButton = true
}) => {
    const {
        user,
        colors,
        isDark,
        navigation,
        showNotif,
        setShowNotif,
        showUserMenu,
        setShowUserMenu,
        isSwitching,
        showSwitchModal,
        setShowSwitchModal,
        negocioActual,
        hasMultipleNegocios,
        handleLogout,
        handleSwitchNegocio
    } = useKitchyToolbar();

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: colors.background
            }
        ]}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                {onBack && (
                    <TouchableOpacity onPress={onBack} style={{ marginRight: 12, padding: 4 }}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                )}
                <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
                    {user?.negocioActivo && title === 'Dashboard' && (
                        <Text numberOfLines={1} ellipsizeMode="tail" style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginTop: -2, textTransform: 'uppercase' }}>
                            {negocioActual?.nombre || (negocioActual?.categoria === 'BELLEZA' ? 'Mi Local' : 'Mi Sucursal')}
                        </Text>
                    )}
                </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {extraButtons}

                {showSwitchNegocioButton && hasMultipleNegocios && (
                    <TouchableOpacity
                        style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }}
                        onPress={() => setShowSwitchModal(true)}
                    >
                        <Ionicons name="storefront" size={20} color={colors.primary} />
                    </TouchableOpacity>
                )}

                {showNotifications && (
                    <TouchableOpacity
                        style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }}
                        onPress={() => setShowNotif(true)}
                    >
                        <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
                        <View style={[styles.badge, { borderColor: isDark ? colors.card : colors.white }]} />
                    </TouchableOpacity>
                )}

                {/* Botón Constante de Usuario */}
                {showUserMenuButton && (
                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            {
                                backgroundColor: isDark ? colors.card : colors.white,
                                borderColor: colors.border,
                                shadowOpacity: isDark ? 0 : 0.03
                            }
                        ]}
                        onPress={() => setShowUserMenu(true)}
                    >
                        <Ionicons name="person-outline" size={22} color={colors.textPrimary} />
                    </TouchableOpacity>
                )}
            </View>

            <NotificationModal
                visible={showNotif}
                onClose={() => setShowNotif(false)}
                notifications={notifications}
                onNotificationPress={(notif) => {
                    setShowNotif(false);
                    onNotificationPress?.(notif);
                }}
            />

            {/* Modal Menú de Usuario */}
            <Modal visible={showUserMenu} transparent animationType="fade" onRequestClose={() => setShowUserMenu(false)}>
                <Pressable
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 90, paddingRight: 16 }}
                    onPress={() => setShowUserMenu(false)}
                >
                    <View style={{ width: 200, backgroundColor: colors.card, borderRadius: 16, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8, borderWidth: 1, borderColor: colors.border }}>
                        <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 4 }}>
                            <Text style={{ fontSize: 14, fontWeight: '900', color: colors.textPrimary }}>Mi Cuenta</Text>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary, marginTop: 2, textTransform: 'uppercase' }}>
                                {negocioActual?.nombre || 'Administrador'}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10 }}
                            onPress={() => {
                                setShowUserMenu(false);
                                navigation.navigate('Usuarios');
                            }}
                        >
                            <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
                            <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 14, marginLeft: 12 }}>Configuración</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, marginTop: 4, backgroundColor: 'rgba(225, 29, 72, 0.05)' }}
                            onPress={() => {
                                setShowUserMenu(false);
                                handleLogout();
                            }}
                        >
                            <Ionicons name="log-out-outline" size={20} color="#e11d48" />
                            <Text style={{ color: '#e11d48', fontWeight: '800', fontSize: 14, marginLeft: 12 }}>Cerrar Sesión</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            {/* Modal para Cambiar de Negocio */}
            {hasMultipleNegocios && (
                <Modal visible={showSwitchModal} transparent animationType="fade" onRequestClose={() => setShowSwitchModal(false)}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                        <View style={{ width: '100%', backgroundColor: colors.card, borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 15 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <Text style={{ fontSize: 20, fontWeight: '900', color: colors.textPrimary }}>
                                    {negocioActual?.categoria === 'BELLEZA' ? 'Mis Locales' : 'Mis Negocios'}
                                </Text>
                                <TouchableOpacity onPress={() => setShowSwitchModal(false)}>
                                    <Ionicons name="close-circle" size={28} color={colors.textMuted} />
                                </TouchableOpacity>
                            </View>

                            <View style={{ gap: 12 }}>
                                {user?.negocioIds?.map((n: any, index: number) => {
                                    const nId = n._id || n; // Handle if it's an object or just a string
                                    const nNombre = n.nombre || `Sucursal ${index + 1}`;
                                    const isActivo = user?.negocioActivo?.toString() === nId.toString();

                                    return (
                                        <TouchableOpacity
                                            key={nId.toString()}
                                            style={{
                                                flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16,
                                                backgroundColor: isActivo ? `${colors.primary}15` : colors.surface,
                                                borderWidth: 1, borderColor: isActivo ? colors.primary : colors.border
                                            }}
                                            onPress={() => handleSwitchNegocio(nId)}
                                            disabled={isSwitching}
                                        >
                                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isActivo ? colors.primary : colors.border, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                                                <Ionicons name="storefront" size={20} color={isActivo ? "#fff" : colors.textSecondary} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 16, fontWeight: '800', color: isActivo ? colors.primary : colors.textPrimary }}>
                                                    {nNombre}
                                                </Text>
                                                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>ID: {nId.toString().substring(0, 8)}...</Text>
                                            </View>
                                            {isActivo && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};
