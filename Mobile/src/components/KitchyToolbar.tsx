import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { lightTheme, darkTheme } from '../theme';
import { styles } from '../styles/KitchyToolbar.styles';
import { NotificationModal } from './NotificationModal';
import Toast from 'react-native-toast-message';
import { useTheme } from '../context/ThemeContext';

interface KitchyToolbarProps {
    title: string;
    showNotifications?: boolean;
    showLogout?: boolean;
    extraButtons?: React.ReactNode;
}

export const KitchyToolbar: React.FC<KitchyToolbarProps> = ({
    title,
    showNotifications = true,
    showLogout = false,
    extraButtons
}) => {
    const { logout } = useAuth();
    const { isDark } = useTheme();
    const [showNotif, setShowNotif] = useState(false);

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
            <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>

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

                {showLogout && (
                    <TouchableOpacity
                        style={[
                            styles.logoutButton,
                            {
                                backgroundColor: isDark ? 'rgba(225, 29, 72, 0.15)' : 'rgba(225, 29, 72, 0.05)',
                                borderColor: isDark ? 'rgba(225, 29, 72, 0.2)' : 'rgba(225, 29, 72, 0.1)'
                            }
                        ]}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={22} color={colors.primary} />
                    </TouchableOpacity>
                )}
            </View>

            <NotificationModal
                visible={showNotif}
                onClose={() => setShowNotif(false)}
            />
        </View>
    );
};
