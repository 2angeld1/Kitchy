import React from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Dimensions, TouchableOpacity, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../navigation/MainAppNavigator';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../theme';
import { createStyles, cardWidth } from '../styles/DashboardScreen.styles';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

type DashboardScreenProps = {
    navigation: NativeStackNavigationProp<MainTabParamList, 'Dashboard'>;
};

export default function BellezaDashboardScreen({ navigation }: DashboardScreenProps) {
    const { user } = useAuth();
    const [periodo, setPeriodo] = React.useState<'hoy' | 'semana' | 'quincena' | 'mes'>('mes');
    const {
        data,
        loading,
        refreshing,
        error,
        notifications,
        onRefresh,
        clearError
    } = useDashboard(periodo);

    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const styles = React.useMemo(() => createStyles(colors), [colors]);

    const periodos = [
        { id: 'hoy', label: 'Hoy' },
        { id: 'semana', label: 'Semana' },
        { id: 'quincena', label: '15 días' },
        { id: 'mes', label: 'Mes' },
    ];

    React.useEffect(() => {
        if (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: error, position: 'top', onHide: clearError });
        }
    }, [error]);

    if (loading && !data) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando local...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <KitchyToolbar title="Dashboard" notifications={notifications} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                <Animated.Text entering={FadeInDown.duration(400).delay(100)} style={[styles.greetingTitle, { color: colors.textMuted }]}>
                    Centro de Belleza
                </Animated.Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20 }}>
                    <Animated.Text entering={FadeInDown.duration(400).delay(150)} style={[styles.greetingSubtitle, { color: colors.textPrimary, marginBottom: 12 }]}>
                        ¡Hola, {user?.nombre?.split(' ')[0]}!
                    </Animated.Text>
                </View>

                {/* Selector de Periodo */}
                <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginBottom: 24, gap: 8 }}>
                    {periodos.map((p) => (
                        <TouchableOpacity
                            key={p.id}
                            onPress={() => setPeriodo(p.id as any)}
                            style={{
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 12,
                                backgroundColor: periodo === p.id ? colors.primary : colors.surface,
                                borderWidth: 1,
                                borderColor: periodo === p.id ? colors.primary : colors.border
                            }}
                        >
                            <Text style={{
                                fontSize: 12,
                                fontWeight: '700',
                                color: periodo === p.id ? '#fff' : colors.textSecondary
                            }}>
                                {p.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Caitlyn AI Highlight */}
                {notifications.find(n => n.id === 'caitlyn-beauty-insight') && (
                    <Animated.View 
                        entering={FadeInDown.duration(400).delay(200)}
                        style={{ marginHorizontal: 20, marginBottom: 20 }}
                    >
                        <View style={{ 
                            backgroundColor: colors.primary + '15', 
                            padding: 16, 
                            borderRadius: 20, 
                            borderWidth: 1, 
                            borderColor: colors.primary + '30',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 12
                        }}>
                            <View style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', borderWidth: 2, borderColor: colors.primary }}>
                                <Image source={require('../../assets/caitlyn_beauty_avatar.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>Caitlyn AI Insight</Text>
                                <Text style={{ color: colors.textPrimary, fontSize: 13, marginTop: 2 }}>
                                    {notifications.find(n => n.id === 'caitlyn-beauty-insight')?.message}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                )}

                {data && (
                    <View style={styles.content}>

                        {/* 1. Métrica Principal: Comisiones a pagar */}
                        <Animated.View entering={FadeInDown.springify().damping(15).delay(250)}>
                            <View style={[styles.glassCardBase, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={styles.cardHeaderRow}>
                                    <View style={[styles.glassIconContainerPrimary, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                                        <Ionicons name="cut-outline" size={28} color="#8b5cf6" />
                                    </View>
                                    <View style={[styles.datePill, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                        <Text style={[styles.datePillText, { color: colors.textSecondary }]}>
                                            {periodos.find(p => p.id === periodo)?.label}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Comisiones a pagar</Text>
                                <Text style={[styles.cardValue, { color: colors.textPrimary, fontSize: 36 }]}>
                                    ${Number(data.comisiones?.pagoEspecialistas || 0).toFixed(2)}
                                </Text>
                                <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                                    Sobre ${Number(data.comisiones?.totalGenerado || 0).toFixed(2)} generados
                                </Text>
                            </View>
                        </Animated.View>

                        {/* 2. Grid de Resumen */}
                        <View style={styles.statsGrid}>
                            <Animated.View entering={FadeInDown.springify().damping(15).delay(350)}>
                                <View style={[styles.glassCardGrid, { width: cardWidth, backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <View style={[styles.glassIconContainerSecondary, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                        <Ionicons name="wallet-outline" size={20} color="#10b981" />
                                    </View>
                                    <Text style={[styles.gridCardLabel, { color: colors.textSecondary }]}>Tu Ganancia</Text>
                                    <Text style={[styles.gridCardValue, { color: colors.textPrimary }]}>
                                        ${Number(data.comisiones?.pagoDueno || 0).toFixed(0)}
                                    </Text>
                                    <Text style={[styles.gridCardSubtitle, { color: colors.textMuted }]}>
                                        {periodos.find(p => p.id === periodo)?.label}
                                    </Text>
                                </View>
                            </Animated.View>

                            <Animated.View entering={FadeInDown.springify().damping(15).delay(400)}>
                                <View style={[styles.glassCardGrid, { width: cardWidth, backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <View style={[styles.glassIconContainerWarning, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                                        <Ionicons name="people-outline" size={20} color="#3b82f6" />
                                    </View>
                                    <Text style={[styles.gridCardLabel, { color: colors.textSecondary }]}>Servicios</Text>
                                    <Text style={[styles.gridCardValue, { color: colors.textPrimary }]}>
                                        {data.comisiones?.totalServicios ?? 0}
                                    </Text>
                                    <Text style={[styles.gridCardSubtitle, { color: colors.textMuted }]}>En este periodo</Text>
                                </View>
                            </Animated.View>
                        </View>

                        {/* 3. Ranking de Barberos / Especialistas */}
                        <Animated.View entering={FadeInDown.springify().damping(15).delay(450)}>
                            <View style={[styles.glassSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={[styles.sectionHeader, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
                                    <View style={[styles.glassIconSmall, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                                        <Ionicons name="star-outline" size={18} color="#8b5cf6" />
                                    </View>
                                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Top Especialistas</Text>
                                </View>

                                <View style={styles.listContainer}>
                                    {data.comisiones?.especialistas && data.comisiones.especialistas.length > 0 ? (
                                        data.comisiones.especialistas.sort((a, b) => b.generado - a.generado).slice(0, 5).map((esp, idx) => {
                                            const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
                                            const isTop3 = idx < 3;
                                            const rankColor = isTop3 ? rankColors[idx] : colors.textPrimary;

                                            return (
                                                <View key={esp.id} style={[styles.glassListItem, { borderBottomColor: idx === data.comisiones!.especialistas.length - 1 ? 'transparent' : colors.border }]}>
                                                    <View style={[styles.listItemRank, isTop3 && { borderColor: rankColor, backgroundColor: rankColor + '10' }]}>
                                                        <Text style={[styles.listItemRankText, { color: isTop3 ? rankColor : colors.textPrimary }]}>{idx + 1}</Text>
                                                    </View>
                                                    <View style={styles.listItemInfo}>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                            <Text style={[styles.listItemTitle, { color: colors.textPrimary }]}>{esp.nombre}</Text>
                                                            {idx === 0 && <Ionicons name="medal" size={14} color="#FFD700" />}
                                                        </View>
                                                        <Text style={[styles.listItemSubtitle, { color: colors.textMuted }]}>
                                                            {esp.servicios} {esp.servicios === 1 ? 'servicio' : 'servicios'} • {esp.eficiencia} serv/día • {esp.porcentajeActual}% com.
                                                        </Text>
                                                    </View>
                                                    <View
                                                        style={[styles.listItemRightBadge, { backgroundColor: isTop3 ? rankColor + '15' : 'rgba(139, 92, 246, 0.1)' }]}
                                                    >
                                                        <Text style={[styles.listItemRightBadgeText, { color: isTop3 ? rankColor : '#8b5cf6' }]}>${esp.pago.toFixed(0)}</Text>
                                                    </View>
                                                </View>
                                            );
                                        })
                                    ) : (
                                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No hay servicios en este rango.</Text>
                                    )}
                                </View>
                            </View>
                        </Animated.View>

                        {/* 4. Gráfico de Ventas (Siete días) */}
                        <Animated.View entering={FadeInDown.springify().damping(15).delay(500)}>
                            <View style={[styles.glassSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={[styles.sectionHeader, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
                                    <View style={[styles.glassIconSmall, { backgroundColor: colors.background }]}>
                                        <Ionicons name="pulse-outline" size={18} color={colors.primary} />
                                    </View>
                                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Actividad Reciente</Text>
                                </View>

                                {data.ventasUltimos7Dias && data.ventasUltimos7Dias.length > 0 && (
                                    <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                                        <LineChart
                                            data={{
                                                labels: data.ventasUltimos7Dias.map((v: any) => {
                                                    const parts = v.fecha.split('-');
                                                    return `${parts[2]}/${parts[1]}`;
                                                }),
                                                datasets: [
                                                    {
                                                        data: data.ventasUltimos7Dias.map((v: any) => v.total)
                                                    }
                                                ]
                                            }}
                                            width={width - 50}
                                            height={180}
                                            yAxisLabel="$"
                                            chartConfig={{
                                                backgroundColor: colors.card,
                                                backgroundGradientFrom: colors.card,
                                                backgroundGradientTo: colors.card,
                                                decimalPlaces: 0,
                                                color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                                                labelColor: (opacity = 1) => colors.textMuted,
                                                propsForDots: {
                                                    r: "4",
                                                    strokeWidth: "2",
                                                    stroke: "#8b5cf6"
                                                }
                                            }}
                                            bezier
                                            style={{ marginVertical: 8, borderRadius: 16 }}
                                        />
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
