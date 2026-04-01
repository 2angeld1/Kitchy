import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Modal, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../theme';
import { styles } from '../styles/AdminHubScreen.styles';
import Toast from 'react-native-toast-message';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

import { useGastos } from '../hooks/useGastos';
import { getAdminHubConfig, AdminMenuItem } from '../config/adminHubConfig';

export default function AdminHubScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { exportarReporte } = useGastos();
    const { user } = useAuth();

    // Detectar categoría del negocio activo de forma robusta
    const categoriaNegocio = useMemo(() => {
        if (!user) return 'COMIDA';
        const negocioActual = typeof user.negocioActivo === 'object' 
            ? user.negocioActivo 
            : (user as any).negocioIds?.find((n: any) => (typeof n === 'object' ? n._id : n) === user.negocioActivo);
        
        return (negocioActual as any)?.categoria || 'COMIDA';
    }, [user]);

    // Obtener la configuración ("vestido") según el negocio
    const config = useMemo(() => getAdminHubConfig(categoriaNegocio), [categoriaNegocio]);
    
    // States para reportes
    const [showRangeModal, setShowRangeModal] = useState(false);
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    const { isDark, toggleTheme } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    const handlePress = (item: AdminMenuItem) => {
        if (item.id === 'reportes') {
            setShowRangeModal(true);
            return;
        }

        // Navegación automática según la configuración del item
        if (item.navigation) {
            navigation.navigate(item.navigation as any);
        }
    };


    const handleExport = async (startDate?: string, endDate?: string) => {
        setShowRangeModal(false);
        await exportarReporte(startDate, endDate);
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
                        {config.subtitle}
                    </Text>
                </Animated.View>

                <View style={styles.grid}>
                    {config.menuItems.map((item, index) => (
                        <Animated.View
                            key={item.id}
                            entering={FadeInDown.duration(500).delay(200 + (index * 100))}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.hubCard,
                                    { backgroundColor: colors.card, borderColor: colors.border }
                                ]}
                                onPress={() => handlePress(item)}
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
                        entering={FadeInDown.duration(500).delay(200 + (config.menuItems.length * 100))}
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
            {/* Modal de Rango de Fechas para Reportes */}
            <Modal visible={showRangeModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <Animated.View entering={FadeInDown} style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Reporte Contable</Text>
                            <TouchableOpacity onPress={() => setShowRangeModal(false)}>
                                <Ionicons name="close-circle" size={32} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ color: colors.textSecondary, marginBottom: 20 }}>
                            Selecciona el rango de fechas para el reporte CSV.
                        </Text>

                        <View style={{ gap: 16, marginBottom: 24 }}>
                            <View>
                                <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8, fontWeight: '700' }}>DESDE (AAAA-MM-DD)</Text>
                                <View style={{ backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border }}>
                                    <TextInput 
                                        style={{ color: colors.textPrimary, height: 50 }}
                                        placeholder="2024-01-01"
                                        placeholderTextColor={colors.textMuted}
                                        value={fechaDesde}
                                        onChangeText={setFechaDesde}
                                    />
                                </View>
                            </View>

                            <View>
                                <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8, fontWeight: '700' }}>HASTA (AAAA-MM-DD)</Text>
                                <View style={{ backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border }}>
                                    <TextInput 
                                        style={{ color: colors.textPrimary, height: 50 }}
                                        placeholder="2024-12-31"
                                        placeholderTextColor={colors.textMuted}
                                        value={fechaHasta}
                                        onChangeText={setFechaHasta}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={{ gap: 10 }}>
                            <TouchableOpacity 
                                style={{ backgroundColor: colors.primary, height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}
                                onPress={() => handleExport(fechaDesde, fechaHasta)}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Generar Reporte Excel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={{ height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border }}
                                onPress={() => handleExport()}
                            >
                                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Descargar Todo el Historial</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}
