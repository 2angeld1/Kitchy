import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown, FadeIn } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../theme';
import { styles } from '../styles/NotificationModal.styles';
import { useTheme } from '../context/ThemeContext';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
}

interface NotificationModalProps {
    visible: boolean;
    onClose: () => void;
    notifications?: Notification[];
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ visible, onClose, notifications = [] }) => {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <Animated.View entering={FadeIn} style={[styles.overlay, isDark && { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                <Animated.View
                    entering={SlideInDown.springify().damping(15)}
                    style={[styles.modal, { backgroundColor: colors.card }]}
                >
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Notificaciones</Text>
                        <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.background }]}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                        {notifications.length > 0 ? notifications.map((notif: Notification) => (
                            <View key={notif.id} style={[styles.item, { borderBottomColor: colors.border }]}>
                                <View style={[styles.iconCircle, { backgroundColor: colors.background }]}>
                                    <Ionicons
                                        name={notif.title === 'Stock Bajo' ? 'alert-circle' : 'information-circle'}
                                        size={22}
                                        color={notif.title === 'Stock Bajo' ? colors.error : colors.primary}
                                    />
                                </View>
                                <View style={styles.body}>
                                    <View style={styles.itemHeader}>
                                        <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{notif.title}</Text>
                                        <Text style={[styles.time, { color: colors.textMuted }]}>{notif.time}</Text>
                                    </View>
                                    <Text style={[styles.msg, { color: colors.textSecondary }]}>{notif.message}</Text>
                                </View>
                            </View>
                        )) : (
                            <View style={{ padding: 40, alignItems: 'center' }}>
                                <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
                                <Text style={{ color: colors.textMuted, marginTop: 12, textAlign: 'center' }}>No hay notificaciones recientes</Text>
                            </View>
                        )}
                    </ScrollView>

                    <TouchableOpacity style={[styles.footerBtn, { backgroundColor: colors.background }]} onPress={onClose}>
                        <Text style={[styles.footerBtnText, { color: colors.textPrimary }]}>Entendido</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};
