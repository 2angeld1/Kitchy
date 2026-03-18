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

export default function AdminHubScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { exportarReporte } = useGastos();
    const { user } = useAuth();

    // Detectar categoría del negocio activo
    const categoriaNegocio = useMemo(() => {
        const negocios = (user as any)?.negocioIds || [];
        const activo = negocios.find((n: any) => n._id === user?.negocioActivo) || negocios[0];
        return activo?.categoria || 'COMIDA';
    }, [user]);
    
    // States para reportes
    const [showRangeModal, setShowRangeModal] = useState(false);
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    const menuItems = useMemo(() => {
        const esBelleza = categoriaNegocio === 'BELLEZA';
        const items = [
            {
                id: esBelleza ? 'especialistas' : 'productos',
                title: esBelleza ? 'Especialistas' : 'Productos',
                desc: esBelleza ? 'Barberos y Estilistas' : 'Gestionar catálogo',
                icon: esBelleza ? 'people-circle-outline' : 'fast-food-outline',
                color: lightTheme.primary
            },
            {
                id: esBelleza ? 'productos' : 'usuarios',
                title: esBelleza ? 'Servicios' : 'Usuarios',
                desc: esBelleza ? 'Precios y Cortes' : 'Cajeros y Meseros',
                icon: esBelleza ? 'cut-outline' : 'people-outline',
                color: '#3b82f6'
            },
            {
                id: 'gastos',
                title: 'Facturas',
                desc: 'Ver Gastos',
                icon: 'receipt-outline',
                color: '#10b981'
            },
            {
                id: 'finanzas',
                title: 'Salud Financiera',
                desc: 'Ingresos vs Gastos',
                icon: 'analytics-outline',
                color: '#f59e0b'
            },
        ];

        // Solo para BELLEZA: Comisiones
        if (esBelleza) {
            items.push({
                id: 'comisiones',
                title: 'Comisiones',
                desc: 'Reparto de Ganancias',
                icon: 'cash-outline',
                color: '#8b5cf6'
            });
        }

        items.push(
            {
                id: 'reportes',
                title: 'Reportes CSV',
                desc: 'Exportar para contador',
                icon: 'cloud-download-outline',
                color: '#6366f1'
            },
            {
                id: 'soporte',
                title: 'Soporte',
                desc: 'Ayuda técnica',
                icon: 'headset-outline',
                color: '#6366f1'
            }
        );

        return items;
    }, [categoriaNegocio]);

    const { isDark, toggleTheme } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    const handlePress = (id: string, title: string, disabled?: boolean) => {
        if (disabled) {
            Toast.show({
                type: 'info',
                text1: 'Módulo en desarrollo',
                text2: 'Estará disponible muy pronto 🚀',
                position: 'top'
            });
            return;
        }

        if (id === 'especialistas') {
            navigation.navigate('Especialistas' as any);
            return;
        }
        if (id === 'productos') {
            if (categoriaNegocio === 'BELLEZA') {
                navigation.navigate('Servicios' as any);
            } else {
                navigation.navigate('Productos');
            }
            return;
        }
        if (id === 'usuarios') {
            navigation.navigate('Usuarios');
            return;
        }
        if (id === 'gastos') {
            navigation.navigate('Gastos');
            return;
        }
        if (id === 'reportes') {
            setShowRangeModal(true);
            return;
        }
        if (id === 'finanzas') {
            navigation.navigate('Finanzas');
            return;
        }
        if (id === 'comisiones') {
            navigation.navigate('Comisiones');
            return;
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
                                style={[
                                    styles.hubCard,
                                    { backgroundColor: colors.card, borderColor: colors.border }
                                ]}
                                onPress={() => handlePress(item.id, item.title)}
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
