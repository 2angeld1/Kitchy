import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown, FadeIn } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../theme';
import { styles } from '../styles/NotificationModal.styles';
import { useTheme } from '../context/ThemeContext';

interface NotificationModalProps {
    visible: boolean;
    onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ visible, onClose }) => {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    const dummyNotifications = [
        { id: '1', title: 'Stock Bajo', message: 'El producto "Leche" está por agotarse.', time: 'Hace 5 min' },
        { id: '2', title: 'Venta Nueva', message: 'Se ha registrado una venta por $45.00', time: 'Hace 20 min' },
        { id: '3', title: 'Sistema', message: 'Bienvenido al nuevo Dashboard de Kitchy.', time: 'Hace 1 hora' },
    ];

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
                        {dummyNotifications.map((notif) => (
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
                        ))}
                    </ScrollView>

                    <TouchableOpacity style={[styles.footerBtn, { backgroundColor: colors.background }]} onPress={onClose}>
                        <Text style={[styles.footerBtnText, { color: colors.textPrimary }]}>Entendido</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};
