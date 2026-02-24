import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { lightTheme, darkTheme } from '../theme';
import { styles } from '../styles/KitchyToolbar.styles';
import { NotificationModal } from './NotificationModal';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

interface KitchyToolbarProps {
    title: string;
    showNotifications?: boolean;
    extraButtons?: React.ReactNode;
    onBack?: () => void;
}

export const KitchyToolbar: React.FC<KitchyToolbarProps> = ({
    title,
    showNotifications = true,
    extraButtons,
    onBack
}) => {
    const { logout } = useAuth();
    const { isDark } = useTheme();
    const [showNotif, setShowNotif] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    // Explicit theme colors based on context
    const colors = isDark ? darkTheme : lightTheme;

    const handleLogout = () => {
        logout();
        Toast.show({
            type: 'info',
            text1: 'Sesión Cerrada',
            text2: 'Vuelve pronto',
            position: 'top'
        });
    };

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: colors.background
            }
        ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {onBack && (
                    <TouchableOpacity onPress={onBack} style={{ marginRight: 12, padding: 4 }}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                )}
                <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
            </View>

            <View style={styles.actions}>
                {extraButtons}

                {showNotifications && (
                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            {
                                backgroundColor: isDark ? colors.card : colors.white,
                                borderColor: colors.border,
                                shadowOpacity: isDark ? 0 : 0.03
                            }
                        ]}
                        onPress={() => setShowNotif(true)}
                    >
                        <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
                        <View style={[styles.badge, { borderColor: isDark ? colors.card : colors.white }]} />
                    </TouchableOpacity>
                )}

                {/* Botón Constante de Usuario */}
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
            </View>

            <NotificationModal
                visible={showNotif}
                onClose={() => setShowNotif(false)}
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
                            <Text style={{ fontSize: 11, fontWeight: '500', color: colors.textSecondary, marginTop: 2 }}>{isDark ? 'Administrador' : 'Administrador'}</Text>
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
        </View>
    );
};
