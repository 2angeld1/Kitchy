import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown, FadeIn } from 'react-native-reanimated';
import { colors } from '../theme';
import { styles } from '../styles/NotificationModal.styles';

interface NotificationModalProps {
    visible: boolean;
    onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ visible, onClose }) => {
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
            <Animated.View entering={FadeIn} style={styles.overlay}>
                <Animated.View
                    entering={SlideInDown.springify().damping(15)}
                    style={styles.modal}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Notificaciones</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                        {dummyNotifications.map((notif) => (
                            <View key={notif.id} style={styles.item}>
                                <View style={styles.iconCircle}>
                                    <Ionicons
                                        name={notif.title === 'Stock Bajo' ? 'alert-circle' : 'information-circle'}
                                        size={22}
                                        color={notif.title === 'Stock Bajo' ? colors.error : colors.primary}
                                    />
                                </View>
                                <View style={styles.body}>
                                    <View style={styles.itemHeader}>
                                        <Text style={styles.itemTitle}>{notif.title}</Text>
                                        <Text style={styles.time}>{notif.time}</Text>
                                    </View>
                                    <Text style={styles.msg}>{notif.message}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    <TouchableOpacity style={styles.footerBtn} onPress={onClose}>
                        <Text style={styles.footerBtnText}>Entendido</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};
