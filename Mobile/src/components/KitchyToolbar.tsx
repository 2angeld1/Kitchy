import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { styles } from '../styles/KitchyToolbar.styles';
import { NotificationModal } from './NotificationModal';
import Toast from 'react-native-toast-message';

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
    const [showNotif, setShowNotif] = useState(false);

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
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>

            <View style={styles.actions}>
                {extraButtons}

                {showNotifications && (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => setShowNotif(true)}
                    >
                        <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
                        <View style={styles.badge} />
                    </TouchableOpacity>
                )}

                {showLogout && (
                    <TouchableOpacity
                        style={styles.logoutButton}
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
