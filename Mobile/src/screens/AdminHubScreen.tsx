import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../theme';
import { styles } from '../styles/AdminHubScreen.styles';
import Toast from 'react-native-toast-message';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';

export default function AdminHubScreen() {

    const menuItems = [
        {
            id: 'productos',
            title: 'Productos',
            desc: 'Gestionar catálogo',
            icon: 'fast-food-outline',
            color: lightTheme.primary
        },
        {
            id: 'usuarios',
            title: 'Usuarios',
            desc: 'Cajeros y Meseros',
            icon: 'people-outline',
            color: '#3b82f6'
        },
        {
            id: 'menu',
            title: 'Menú Público',
            desc: 'QR para clientes',
            icon: 'qr-code-outline',
            color: '#f59e0b'
        },
        {
            id: 'soporte',
            title: 'Soporte',
            desc: 'Ayuda técnica',
            icon: 'headset-outline',
            color: '#6366f1'
        }
    ];

    const { isDark, toggleTheme } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    const handlePress = (item: string) => {
        Toast.show({
            type: 'info',
            text1: 'Módulo en desarrollo',
            text2: `Accediendo a: ${item}`,
            position: 'top'
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <KitchyToolbar
                title="Panel"
                showNotifications={true}
                extraButtons={
                    <TouchableOpacity
                        style={[styles.themeToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={toggleTheme}
                    >
                        <Ionicons
                            name={isDark ? "sunny-outline" : "moon-outline"}
                            size={22}
                            color={colors.textPrimary}
                        />
                    </TouchableOpacity>
                }
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
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
                                style={[styles.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={() => handlePress(item.title)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                                    <Ionicons name={item.icon as any} size={28} color={item.color} />
                                </View>
                                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                                <Text style={[styles.cardDesc, { color: colors.textMuted }]}>{item.desc}</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}

                    <Animated.View
                        entering={FadeInDown.duration(500).delay(200 + (menuItems.length * 100))}
                    >
                        <TouchableOpacity
                            style={[styles.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={toggleTheme}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(99, 102, 241, 0.1)' }]}>
                                <Ionicons
                                    name={isDark ? "sunny" : "moon"}
                                    size={28}
                                    color={isDark ? "#fbbf24" : "#6366f1"}
                                />
                            </View>
                            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{isDark ? 'Modo Claro' : 'Modo Oscuro'}</Text>
                            <Text style={[styles.cardDesc, { color: colors.textMuted }]}>Cambiar apariencia</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </ScrollView>
        </View>
    );
}
