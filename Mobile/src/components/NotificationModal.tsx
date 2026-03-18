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
    type?: 'ai' | 'info' | 'error' | 'warning';
}

interface NotificationModalProps {
    visible: boolean;
    onClose: () => void;
    notifications?: Notification[];
    onNotificationPress?: (notif: Notification) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ visible, onClose, notifications = [], onNotificationPress }) => {
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
                            <TouchableOpacity 
                                key={notif.id} 
                                style={[
                                    styles.item, 
                                    { borderBottomColor: colors.border },
                                    notif.type === 'ai' && { backgroundColor: isDark ? 'rgba(225, 29, 72, 0.05)' : 'rgba(225, 29, 72, 0.03)', borderRadius: 16, marginVertical: 4, borderBottomWidth: 0, padding: 16 }
                                ]}
                                onPress={() => onNotificationPress?.(notif)}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.iconCircle, 
                                    { backgroundColor: colors.background },
                                    notif.type === 'ai' && { backgroundColor: colors.primary }
                                ]}>
                                    <Ionicons
                                        name={notif.type === 'ai' ? 'sparkles' : notif.title === 'Stock Bajo' ? 'alert-circle' : 'information-circle'}
                                        size={notif.type === 'ai' ? 18 : 22}
                                        color={notif.type === 'ai' ? '#fff' : notif.title === 'Stock Bajo' ? colors.error : colors.primary}
                                    />
                                </View>
                                <View style={styles.body}>
                                    <View style={styles.itemHeader}>
                                        <Text style={[
                                            styles.itemTitle, 
                                            { color: colors.textPrimary },
                                            notif.type === 'ai' && { color: colors.primary, fontWeight: '900' }
                                        ]}>{notif.title}</Text>
                                        <Text style={[styles.time, { color: colors.textMuted }]}>{notif.time}</Text>
                                    </View>
                                    <Text 
                                        style={[styles.msg, { color: colors.textSecondary }]}
                                        numberOfLines={notif.type === 'ai' ? 3 : 2}
                                    >
                                        {notif.message}
                                    </Text>
                                    {notif.type === 'ai' && (
                                        <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '700', marginTop: 8 }}>Toca para ver productos →</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
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
