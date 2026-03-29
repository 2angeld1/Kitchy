import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Dimensions, TouchableOpacity, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../navigation/MainAppNavigator';
import { useAuth, Negocio } from '../context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { useGastos } from '../hooks/useGastos';
import { useCaitlyn } from '../hooks/useCaitlyn';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../theme';
import { createStyles, cardWidth } from '../styles/DashboardScreen.styles';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';
import { LineChart } from 'react-native-chart-kit';
import { FinancialAlertCard } from '../components/FinancialAlertCard';
import { CaitlynAlertsModal } from '../components/CaitlynAlertsModal';
import BellezaDashboardScreen from './BellezaDashboardScreen';

// Subcomponentes extra\u00eddos
import { DashboardFinancialSummary } from './Dashboard/components/DashboardFinancialSummary';
import { DashboardInventoryRisk } from './Dashboard/components/DashboardInventoryRisk';
import { DashboardBestSellers } from './Dashboard/components/DashboardBestSellers';
import { DashboardGastoModal } from './Dashboard/components/DashboardGastoModal';
import { CaitlynAutomaticInsight } from '../components/CaitlynAutomaticInsight';

const { width } = Dimensions.get('window');

type DashboardScreenProps = {
    navigation: NativeStackNavigationProp<MainTabParamList, 'Dashboard'>;
};

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const styles = useMemo(() => createStyles(colors), [colors]);

    const { getDashboardAlertsAnalysis, advice, loading: analyzingAlerts, error: caitlynError } = useCaitlyn();
    const {
        data, loading, refreshing, error, success, notifications, onRefresh, handleAjustarPrecio, handleAjustarTodosLosPrecios, clearError, clearSuccess
    } = useDashboard('mes', advice);

    const { registrarGasto, loading: creatingGasto } = useGastos();

    const [showGastoModal, setShowGastoModal] = useState(false);
    const [showCaitlynAlerts, setShowCaitlynAlerts] = useState(false);

    const hasAnalyzedRef = React.useRef(false);

    useEffect(() => {
        const alertas = data?.inventario?.alertasRentabilidad;
        // Candado Síncrono: evita ráfagas en re-renders concurrentes
        if (alertas && alertas.length > 0 && !hasAnalyzedRef.current && !advice && !analyzingAlerts && !caitlynError) {
            hasAnalyzedRef.current = true;
            getDashboardAlertsAnalysis(alertas);
        }
    }, [data?.inventario?.alertasRentabilidad, advice, analyzingAlerts, caitlynError]);

    useEffect(() => {
        if (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: error, position: 'top', onHide: clearError });
        }
    }, [error]);

    useEffect(() => {
        if (success) {
            Toast.show({ type: 'success', text1: '\u00c9xito', text2: success, position: 'top', onHide: clearSuccess });
        }
    }, [success]);

    const handleGuardarGasto = async (descripcion: string, monto: number, categoria: string) => {
        if (!descripcion || !monto) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Completa todos los campos' });
            return false;
        }
        const ok = await registrarGasto({ descripcion, monto, categoria });
        if (ok) {
            Toast.show({ type: 'success', text1: '\u00c9xito', text2: 'Gasto guardado' });
            onRefresh();
            return true;
        }
        return false;
    };

    if (loading && !data) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Cargando panel...</Text>
            </View>
        );
    }

    const negocioActual = typeof user?.negocioActivo === 'object'
        ? user.negocioActivo as Negocio
        : (user?.negocioIds?.find(n => (typeof n === 'object' ? n._id : n) === user?.negocioActivo) as Negocio);

    if (negocioActual?.categoria === 'BELLEZA') {
        return <BellezaDashboardScreen navigation={navigation} />;
    }

    return (
        <View style={styles.container}>
            <KitchyToolbar
                title="Dashboard"
                notifications={notifications}
                onNotificationPress={(n) => {
                    if (n.id === 'caitlyn-ai-insight' || n.id === 'low-stock') setShowCaitlynAlerts(true);
                }}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                <Animated.Text entering={FadeInDown.duration(400).delay(100)} style={styles.greetingTitle}>Resumen General</Animated.Text>
                <Animated.Text entering={FadeInDown.duration(400).delay(150)} style={styles.greetingSubtitle}>¡Hola, {user?.nombre?.split(' ')[0]}!</Animated.Text>

                {data && (
                    <View style={styles.content}>
                        {data.inventario?.alertasRentabilidad?.length > 0 && (
                            <FinancialAlertCard alertCount={data.inventario.alertasRentabilidad.length} onPress={() => setShowCaitlynAlerts(true)} />
                        )}

                        {/* M\u00e9tricas Principales */}
                        <Animated.View entering={FadeInDown.springify().damping(15).delay(250)} style={styles.glassCardBase}>
                            <View style={styles.cardHeaderRow}>
                                <View style={styles.glassIconContainerPrimary}><Ionicons name="cash-outline" size={28} color={colors.primary} /></View>
                                <View style={styles.datePill}><Text style={styles.datePillText}>Hoy</Text></View>
                            </View>
                            <Text style={styles.cardLabel}>Ventas Facturadas</Text>
                            <Text style={styles.cardValue}>${data.ventas.hoy.total.toFixed(2)}</Text>
                            <Text style={styles.cardSubtitle}>{data.ventas.hoy.cantidad} tickets emitidos</Text>
                        </Animated.View>

                        <View style={styles.statsGrid}>
                            <Animated.View entering={FadeInDown.springify().damping(15).delay(350)} style={[styles.glassCardGrid, { width: cardWidth }]}>
                                <View style={styles.glassIconContainerSecondary}><Ionicons name="stats-chart-outline" size={20} color="#3b82f6" /></View>
                                <Text style={styles.gridCardLabel}>Ventas Mes</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Text style={styles.gridCardValue}>${Number(data.finanzas.ingresosMes).toFixed(0)}</Text>
                                    <View style={[styles.growthBadge, { backgroundColor: Number(data.ventas.crecimiento) >= 0 ? '#10b981' : '#ef4444' }]}>
                                        <Text style={styles.growthText}>{Math.abs(Number(data.ventas.crecimiento))}%</Text>
                                    </View>
                                </View>
                                <Text style={styles.gridCardSubtitle}>{data.ventas.mes.cantidad} ventas</Text>
                            </Animated.View>

                            <Animated.View entering={FadeInDown.springify().damping(15).delay(400)} style={[styles.glassCardGrid, { width: cardWidth }]}>
                                <View style={[styles.glassIconContainerPrimary, { backgroundColor: 'rgba(16, 185, 129, 0.1)', overflow: 'hidden' }]}>
                                    <Image
                                        source={require('../../assets/caitlyn_avatar.png')}
                                        style={{ width: 44, height: 44, borderRadius: 22 }}
                                    />
                                </View>
                                <Text style={styles.gridCardLabel}>Ahorro Kitchy</Text>
                                <Text style={styles.gridCardValue}>{data.ahorro.tiempoHoras}h</Text>
                                <Text style={styles.gridCardSubtitle}>{data.ahorro.hojasPapel} hojas 📝</Text>
                            </Animated.View>
                        </View>

                        {/* Secciones Modulares */}
                        <DashboardInventoryRisk 
                            data={data} 
                            colors={colors} 
                            styles={styles} 
                            onAddPress={() => navigation.navigate('Inventario')}
                        />
                        <DashboardFinancialSummary data={data} colors={colors} styles={styles} />

                        {/* Merma / Gasto R\u00e1pido */}
                        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                            <TouchableOpacity style={{ flex: 1, backgroundColor: colors.card, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }} onPress={() => setShowGastoModal(true)}>
                                <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                                <Text style={{ color: colors.textPrimary, fontWeight: '700', marginTop: 4 }}>Registrar Gasto</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Gráfico Histórico Admin */}
                        {user?.rol === 'admin' && data.ventasUltimos7Dias?.length > 0 && (
                            <Animated.View entering={FadeInDown.springify().damping(15).delay(500)} style={styles.glassSection}>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.glassIconSmall}><Ionicons name="pulse-outline" size={18} color={colors.primary} /></View>
                                    <Text style={styles.sectionTitle}>Tendencia de Ventas (7 días)</Text>
                                </View>
                                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                                    <LineChart
                                        data={{
                                            labels: data.ventasUltimos7Dias.map((v: any) => v.fecha.split('-').slice(1).reverse().join('/')),
                                            datasets: [{ data: data.ventasUltimos7Dias.map((v: any) => v.total) }]
                                        }}
                                        width={width - 64} // Ajustado para el padding de content (24*2) + borde (1*2) + margen seguro
                                        height={180}
                                        yAxisLabel="$"
                                        yAxisInterval={1}
                                        chartConfig={{
                                            backgroundColor: colors.card,
                                            backgroundGradientFrom: colors.card,
                                            backgroundGradientTo: colors.card,
                                            decimalPlaces: 0,
                                            color: (opacity = 1) => `rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, ${opacity})`,
                                            labelColor: (opacity = 1) => colors.textMuted,
                                            propsForDots: { r: "4", strokeWidth: "2", stroke: colors.primary }
                                        }}
                                        bezier
                                        style={{ marginVertical: 8, borderRadius: 16 }}
                                    />
                                </View>
                            </Animated.View>
                        )}

                        <DashboardBestSellers data={data} colors={colors} styles={styles} />
                    </View>
                )}
            </ScrollView>

            <DashboardGastoModal visible={showGastoModal} onClose={() => setShowGastoModal(false)} onSave={handleGuardarGasto} loading={creatingGasto} colors={colors} styles={styles} />

            <CaitlynAlertsModal
                visible={showCaitlynAlerts}
                onClose={() => setShowCaitlynAlerts(false)}
                alertas={data?.inventario?.alertasRentabilidad || []}
                onViewStrategy={(alerta) => {
                    setShowCaitlynAlerts(false);
                    (navigation as any).navigate('CaitlynStrategy', { alerta });
                }}
                onAplicarTodo={handleAjustarTodosLosPrecios}
            />

            <CaitlynAutomaticInsight />
        </View>
    );
}
