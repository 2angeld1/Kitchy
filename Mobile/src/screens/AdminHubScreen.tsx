import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '../theme';
import { styles } from '../styles/AdminHubScreen.styles';
import Toast from 'react-native-toast-message';
import { KitchyToolbar } from '../components/KitchyToolbar';

export default function AdminHubScreen() {

    const menuItems = [
        {
            id: 'productos',
            title: 'Productos',
            desc: 'Gestionar catálogo',
            icon: 'fast-food-outline',
            color: colors.primary
        },
        {
            id: 'usuarios',
            title: 'Usuarios',
            desc: 'Cajeros y Meseros',
            icon: 'people-outline',
            color: '#3b82f6' // Azul para gestión
        },
        {
            id: 'menu',
            title: 'Menú Público',
            desc: 'QR para clientes',
            icon: 'qr-code-outline',
            color: '#f59e0b' // Ambar para visualización
        },
        {
            id: 'soporte',
            title: 'Soporte',
            desc: 'Ayuda técnica',
            icon: 'headset-outline',
            color: '#6366f1' // Indigo para soporte
        }
    ];

    const handlePress = (item: string) => {
        Toast.show({
            type: 'info',
            text1: 'Módulo en desarrollo',
            text2: `Accediendo a: ${item}`,
            position: 'top'
        });
    };

    return (
        <View style={styles.container}>
            <KitchyToolbar title="Panel" showNotifications={true} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
                    <Text style={styles.subtitle}>
                        Configuración y administración de Kitchy
                    </Text>
                </Animated.View>

                <View style={styles.grid}>
                    {menuItems.map((item, index) => (
                        <Animated.View
                            key={item.id}
                            entering={FadeInDown.duration(500).delay(200 + (index * 100))}
                        >
                            <TouchableOpacity
                                style={styles.hubCard}
                                onPress={() => handlePress(item.title)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                                    <Ionicons name={item.icon as any} size={28} color={item.color} />
                                </View>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardDesc}>{item.desc}</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
