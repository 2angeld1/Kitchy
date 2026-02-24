import React from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../navigation/MainAppNavigator';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '../theme';
import { styles, cardWidth } from '../styles/DashboardScreen.styles';
import { KitchyToolbar } from '../components/KitchyToolbar';

type DashboardScreenProps = {
    navigation: NativeStackNavigationProp<MainTabParamList, 'Dashboard'>;
};

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
    const { user } = useAuth();
    const { data, loading, refreshing, error, onRefresh, clearError } = useDashboard();

    React.useEffect(() => {
        if (error) {
            Alert.alert("Error", error, [{ text: "Ok", onPress: clearError }]);
        }
    }, [error]);

    if (loading && !data) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Cargando panel...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <KitchyToolbar title="Dashboard" showLogout={true} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                {/* Saludo Animado */}
                <Animated.Text entering={FadeInDown.duration(400).delay(100)} style={styles.greetingTitle}>
                    Resumen General
                </Animated.Text>
                <Animated.Text entering={FadeInDown.duration(400).delay(150)} style={styles.greetingSubtitle}>
                    ¡Hola de nuevo, {user?.nombre?.split(' ')[0]}!
                </Animated.Text>

                {data && (
                    <View style={styles.content}>

                        {/* 1. Métrica Principal: Ventas Hoy */}
                        <Animated.View entering={FadeInDown.springify().damping(15).delay(250)}>
                            <View style={styles.glassCardBase}>
                                <View style={styles.cardHeaderRow}>
                                    <View style={styles.glassIconContainerPrimary}>
                                        <Ionicons name="cash-outline" size={28} color={colors.primary} />
                                    </View>
                                    <View style={styles.datePill}>
                                        <Text style={styles.datePillText}>Hoy</Text>
                                    </View>
                                </View>
                                <Text style={styles.cardLabel}>Ventas Facturadas</Text>
                                <Text style={styles.cardValue}>${data.ventas.hoy.total.toFixed(2)}</Text>
                                <Text style={styles.cardSubtitle}>{data.ventas.hoy.cantidad} tickets emitidos</Text>
                            </View>
                        </Animated.View>

                        {/* 2. Grid de dos columnas para Mes */}
                        <View style={styles.statsGrid}>
                            <Animated.View entering={FadeInDown.springify().damping(15).delay(350)}>
                                <View style={[styles.glassCardGrid, { width: cardWidth }]}>
                                    <View style={styles.glassIconContainerSecondary}>
                                        <Ionicons name="stats-chart-outline" size={20} color="#3b82f6" />
                                    </View>
                                    <Text style={styles.gridCardLabel}>Ventas Mes</Text>
                                    <Text style={styles.gridCardValue}>${Number(data.finanzas.ingresosMes).toFixed(0)}</Text>
                                    <Text style={styles.gridCardSubtitle}>{data.ventas.mes.cantidad} ventas</Text>
                                </View>
                            </Animated.View>

                            <Animated.View entering={FadeInDown.springify().damping(15).delay(450)}>
                                <View style={[styles.glassCardGrid, { width: cardWidth }]}>
                                    <View style={styles.glassIconContainerWarning}>
                                        <Ionicons name="cube-outline" size={20} color="#f59e0b" />
                                    </View>
                                    <Text style={styles.gridCardLabel}>Inventario</Text>
                                    <Text style={styles.gridCardValue}>{data.inventario.totalItems}</Text>
                                    {data.inventario.itemsStockBajo > 0 ? (
                                        <View style={styles.badgeWarning}>
                                            <Text style={styles.badgeWarningText}>{data.inventario.itemsStockBajo} BAJO STOCK</Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.gridCardSubtitle}>Items totales</Text>
                                    )}
                                </View>
                            </Animated.View>
                        </View>

                        {/* 3. Módulo: Productos más vendidos */}
                        <Animated.View entering={FadeInDown.springify().damping(15).delay(550)}>
                            <View style={styles.glassSection}>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.glassIconSmall}>
                                        <Ionicons name="trophy-outline" size={18} color={colors.textPrimary} />
                                    </View>
                                    <Text style={styles.sectionTitle}>Más Vendidos</Text>
                                </View>

                                <View style={styles.listContainer}>
                                    {data.productosMasVendidos.length > 0 ? (
                                        data.productosMasVendidos.map((prod, idx) => (
                                            <Animated.View
                                                key={idx}
                                                entering={FadeInDown.duration(300).delay(600 + (idx * 100))}
                                                style={styles.glassListItem}
                                            >
                                                <View style={styles.listItemRank}>
                                                    <Text style={styles.listItemRankText}>{idx + 1}</Text>
                                                </View>
                                                <View style={styles.listItemInfo}>
                                                    <Text style={styles.listItemTitle} numberOfLines={1}>{prod.nombre}</Text>
                                                    <Text style={styles.listItemSubtitle}>{prod.cantidad} unid.</Text>
                                                </View>
                                                <View style={styles.listItemRightBadge}>
                                                    <Text style={styles.listItemRightBadgeText}>${prod.total.toFixed(0)}</Text>
                                                </View>
                                            </Animated.View>
                                        ))
                                    ) : (
                                        <Text style={styles.emptyText}>Aún no hay ventas registradas.</Text>
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
