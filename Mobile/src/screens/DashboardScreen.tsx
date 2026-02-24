import React from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../navigation/MainAppNavigator';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../theme';
import { styles, cardWidth } from '../styles/DashboardScreen.styles';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';

type DashboardScreenProps = {
    navigation: NativeStackNavigationProp<MainTabParamList, 'Dashboard'>;
};

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
    const { user } = useAuth();
    const { data, loading, refreshing, error, onRefresh, clearError } = useDashboard();
    const { isDark } = useTheme();

    const colors = isDark ? darkTheme : lightTheme;

    React.useEffect(() => {
        if (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error,
                position: 'top',
                onHide: clearError
            });
        }
    }, [error]);

    if (loading && !data) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando panel...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <KitchyToolbar title="Dashboard" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                {/* Saludo Animado */}
                <Animated.Text entering={FadeInDown.duration(400).delay(100)} style={[styles.greetingTitle, { color: colors.textMuted }]}>
                    Resumen General
                </Animated.Text>
                <Animated.Text entering={FadeInDown.duration(400).delay(150)} style={[styles.greetingSubtitle, { color: colors.textPrimary }]}>
                    ¡Hola de nuevo, {user?.nombre?.split(' ')[0]}!
                </Animated.Text>

                {data && (
                    <View style={styles.content}>

                        {/* 1. Métrica Principal: Ventas Hoy */}
                        <Animated.View entering={FadeInDown.springify().damping(15).delay(250)}>
                            <View style={[styles.glassCardBase, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={styles.cardHeaderRow}>
                                    <View style={[styles.glassIconContainerPrimary, { backgroundColor: isDark ? 'rgba(225, 29, 72, 0.15)' : 'rgba(225, 29, 72, 0.1)' }]}>
                                        <Ionicons name="cash-outline" size={28} color={colors.primary} />
                                    </View>
                                    <View style={[styles.datePill, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                        <Text style={[styles.datePillText, { color: colors.textSecondary }]}>Hoy</Text>
                                    </View>
                                </View>
                                <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Ventas Facturadas</Text>
                                <Text style={[styles.cardValue, { color: colors.textPrimary }]}>${data.ventas.hoy.total.toFixed(2)}</Text>
                                <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>{data.ventas.hoy.cantidad} tickets emitidos</Text>
                            </View>
                        </Animated.View>

                        {/* 2. Grid de dos columnas para Mes */}
                        <View style={styles.statsGrid}>
                            <Animated.View entering={FadeInDown.springify().damping(15).delay(350)}>
                                <View style={[styles.glassCardGrid, { width: cardWidth, backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <View style={[styles.glassIconContainerSecondary, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }]}>
                                        <Ionicons name="stats-chart-outline" size={20} color="#3b82f6" />
                                    </View>
                                    <Text style={[styles.gridCardLabel, { color: colors.textSecondary }]}>Ventas Mes</Text>
                                    <Text style={[styles.gridCardValue, { color: colors.textPrimary }]}>${Number(data.finanzas.ingresosMes).toFixed(0)}</Text>
                                    <Text style={[styles.gridCardSubtitle, { color: colors.textMuted }]}>{data.ventas.mes.cantidad} ventas</Text>
                                </View>
                            </Animated.View>

                            <Animated.View entering={FadeInDown.springify().damping(15).delay(450)}>
                                <View style={[styles.glassCardGrid, { width: cardWidth, backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <View style={[styles.glassIconContainerWarning, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)' }]}>
                                        <Ionicons name="cube-outline" size={20} color="#f59e0b" />
                                    </View>
                                    <Text style={[styles.gridCardLabel, { color: colors.textSecondary }]}>Inventario</Text>
                                    <Text style={[styles.gridCardValue, { color: colors.textPrimary }]}>{data.inventario.totalItems}</Text>
                                    {data.inventario.itemsStockBajo > 0 ? (
                                        <View style={styles.badgeWarning}>
                                            <Text style={styles.badgeWarningText}>{data.inventario.itemsStockBajo} BAJO STOCK</Text>
                                        </View>
                                    ) : (
                                        <Text style={[styles.gridCardSubtitle, { color: colors.textMuted }]}>Items totales</Text>
                                    )}
                                </View>
                            </Animated.View>
                        </View>

                        {/* 3. Módulo: Productos más vendidos */}
                        <Animated.View entering={FadeInDown.springify().damping(15).delay(550)}>
                            <View style={[styles.glassSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={[styles.sectionHeader, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
                                    <View style={[styles.glassIconSmall, { backgroundColor: colors.background }]}>
                                        <Ionicons name="trophy-outline" size={18} color={colors.textPrimary} />
                                    </View>
                                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Más Vendidos</Text>
                                </View>

                                <View style={styles.listContainer}>
                                    {data.productosMasVendidos.length > 0 ? (
                                        data.productosMasVendidos.map((prod, idx) => (
                                            <Animated.View
                                                key={idx}
                                                entering={FadeInDown.duration(300).delay(600 + (idx * 100))}
                                                style={[styles.glassListItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                                            >
                                                <View style={[styles.listItemRank, { backgroundColor: colors.background }]}>
                                                    <Text style={[styles.listItemRankText, { color: colors.textPrimary }]}>{idx + 1}</Text>
                                                </View>
                                                <View style={styles.listItemInfo}>
                                                    <Text style={[styles.listItemTitle, { color: colors.textPrimary }]} numberOfLines={1}>{prod.nombre}</Text>
                                                    <Text style={[styles.listItemSubtitle, { color: colors.textMuted }]}>{prod.cantidad} unid.</Text>
                                                </View>
                                                <View style={[styles.listItemRightBadge, { backgroundColor: isDark ? 'rgba(225, 29, 72, 0.15)' : 'rgba(225, 29, 72, 0.1)' }]}>
                                                    <Text style={[styles.listItemRightBadgeText, { color: colors.primary }]}>${prod.total.toFixed(0)}</Text>
                                                </View>
                                            </Animated.View>
                                        ))
                                    ) : (
                                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>Aún no hay ventas registradas.</Text>
                                    )}
                                </View>
                            </View>
                        </Animated.View>

                    </View>
                )}
            </ScrollView>
        </View>
    );
}
