import React from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Dimensions, TouchableOpacity, Modal } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../navigation/MainAppNavigator';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { useGastos } from '../hooks/useGastos';
import { useCaitlyn } from '../hooks/useCaitlyn';
import { KitchyInput } from '../components/KitchyInput';
import { KitchyButton } from '../components/KitchyButton';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../theme';
import { styles, cardWidth } from '../styles/DashboardScreen.styles';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';
import { LineChart } from 'react-native-chart-kit';
import { autoAjustarPrecio } from '../services/api';
import { FinancialAlertCard } from '../components/FinancialAlertCard';
import { CaitlynAlertsModal } from '../components/CaitlynAlertsModal';
import BellezaDashboardScreen from './BellezaDashboardScreen';
import { Negocio } from '../context/AuthContext';

const { width } = Dimensions.get('window');

type DashboardScreenProps = {
    navigation: NativeStackNavigationProp<MainTabParamList, 'Dashboard'>;
};

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
    const { user } = useAuth();
    const { getDashboardAlertsAnalysis, advice, loading: analyzingAlerts } = useCaitlyn();
    const {
        data,
        loading,
        refreshing,
        error,
        notifications, // Consumimos la lógica de negocio procesada
        onRefresh,
        clearError
    } = useDashboard('mes', advice);

    const { registrarGasto, loading: creatingGasto } = useGastos();
    const { isDark } = useTheme();

    // Estado UI (Este sí puede vivir aquí porque es puramente visual/modal)
    const [showGastoModal, setShowGastoModal] = React.useState(false);
    const [showCaitlynAlerts, setShowCaitlynAlerts] = React.useState(false);

    React.useEffect(() => {
        // Caching preventivo: no gastamos tokens de la IA si ya generó el resumen para este render de datos
        // Ahora se dispara automáticamente si detectamos alertas al cargar el dashboard
        if (data?.inventario?.alertasRentabilidad && data.inventario.alertasRentabilidad.length > 0 && !advice && !analyzingAlerts) {
            getDashboardAlertsAnalysis(data.inventario.alertasRentabilidad);
        }
    }, [data?.inventario?.alertasRentabilidad]);
    const [form, setForm] = React.useState({ desc: '', monto: '', cat: 'servicios' });

    const colors = isDark ? darkTheme : lightTheme;

    React.useEffect(() => {
        if (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: error, position: 'top', onHide: clearError });
        }
    }, [error]);

    const handleGuardarGasto = async () => {
        if (!form.desc || !form.monto) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Completa todos los campos' });
            return;
        }

        const success = await registrarGasto({
            descripcion: form.desc,
            monto: parseFloat(form.monto),
            categoria: form.cat
        });

        if (success) {
            Toast.show({ type: 'success', text1: 'Éxito', text2: 'Gasto guardado' });
            setShowGastoModal(false);
            setForm({ desc: '', monto: '', cat: 'servicios' });
            onRefresh();
        }
    };

    const handleAjustarPrecio = async (id: string) => {
        try {
            await autoAjustarPrecio(id);
            Toast.show({ type: 'success', text1: '¡Precio Actualizado!', text2: 'El margen se ha restaurado correctamente.' });
            onRefresh();
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo actualizar el precio.' });
        }
    };

    if (loading && !data) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando panel...</Text>
            </View>
        );
    }

    const negocioActual = typeof user?.negocioActivo === 'object' 
        ? user.negocioActivo as Negocio 
        : (user?.negocioIds?.find(n => (typeof n === 'object' ? n._id : n) === user?.negocioActivo) as Negocio);
    
    // Si es un negocio de belleza, derivamos a su dashboard especializado
    if (negocioActual?.categoria === 'BELLEZA') {
        return <BellezaDashboardScreen navigation={navigation} />;
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <KitchyToolbar 
                title="Dashboard" 
                notifications={notifications} 
                onNotificationPress={(n) => {
                    if (n.id === 'caitlyn-ai-insight' || n.id === 'low-stock') {
                        setShowCaitlynAlerts(true);
                    }
                }}
            />

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

                        {/* 🤖 ALERTA CAITLYN: Rentabilidad en Peligro */}
                        {data.inventario?.alertasRentabilidad?.length > 0 && (
                            <FinancialAlertCard 
                                alertCount={data.inventario.alertasRentabilidad.length}
                                onPress={() => setShowCaitlynAlerts(true)}
                            />
                        )}

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
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Text style={[styles.gridCardValue, { color: colors.textPrimary }]}>${Number(data.finanzas.ingresosMes).toFixed(0)}</Text>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: Number(data.ventas.crecimiento) >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            paddingHorizontal: 4,
                                            borderRadius: 4
                                        }}>
                                            <Ionicons
                                                name={Number(data.ventas.crecimiento) >= 0 ? "arrow-up" : "arrow-down"}
                                                size={10}
                                                color={Number(data.ventas.crecimiento) >= 0 ? "#10b981" : "#ef4444"}
                                            />
                                            <Text style={{
                                                fontSize: 8,
                                                fontWeight: 'bold',
                                                color: Number(data.ventas.crecimiento) >= 0 ? "#10b981" : "#ef4444"
                                            }}>
                                                {Math.abs(Number(data.ventas.crecimiento))}%
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.gridCardSubtitle, { color: colors.textMuted }]}>{data.ventas.mes.cantidad} ventas</Text>
                                </View>
                            </Animated.View>

                            <Animated.View entering={FadeInDown.springify().damping(15).delay(400)}>
                                <View style={[styles.glassCardGrid, { width: cardWidth, backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <View style={[styles.glassIconContainerPrimary, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                        <Ionicons name="sparkles-outline" size={20} color="#10b981" />
                                    </View>
                                    <Text style={[styles.gridCardLabel, { color: colors.textSecondary }]}>Ahorro Kitchy</Text>
                                    <Text style={[styles.gridCardValue, { color: colors.textPrimary }]}>{data.ahorro.tiempoHoras}h</Text>
                                    <Text style={[styles.gridCardSubtitle, { color: colors.textMuted }]}>{data.ahorro.hojasPapel} hojas papel 📝</Text>
                                </View>
                            </Animated.View>
                        </View>

                        {/* 2.2 Inventario & Recetas en Riesgo */}
                        <Animated.View entering={FadeInDown.springify().damping(15).delay(450)}>
                            <View style={[styles.glassSection, { backgroundColor: colors.card, borderColor: colors.border, padding: 16 }]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Ionicons name="cube-outline" size={20} color="#f59e0b" />
                                        <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0, fontSize: 16 }]}>Control de Inventario</Text>
                                    </View>
                                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>{data.inventario.totalItems} insumos</Text>
                                </View>

                                {data.inventario.productosEnRiesgo.length > 0 ? (
                                    <View style={{ marginBottom: 10 }}>
                                        <Text style={{ color: colors.primary, fontSize: 11, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>⚠️ Recetas con ingredientes escasos</Text>
                                        {data.inventario.productosEnRiesgo.map((prod, idx) => (
                                            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, opacity: 0.9 }}>
                                                <Text style={{ color: colors.textPrimary, fontSize: 14 }}>{prod.nombre}</Text>
                                                <View style={{ flexDirection: 'row', gap: 4 }}>
                                                    {prod.ingredientesFaltantes.map((ing, iIdx) => (
                                                        <View key={iIdx} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                                            <Text style={{ color: '#ef4444', fontSize: 10 }}>{ing}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <View style={{ padding: 10, alignItems: 'center' }}>
                                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>Todas tus recetas tienen insumos completos ✅</Text>
                                    </View>
                                )}
                            </View>
                        </Animated.View>

                        {/* 2.5 Nueva Sección: Salud Financiera del Mes */}
                        <Animated.View entering={FadeInDown.springify().damping(15).delay(480)}>
                            <View style={[styles.glassSection, { backgroundColor: colors.card, borderColor: colors.border, padding: 16 }]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <Text style={[styles.cardLabel, { color: colors.textMuted, marginBottom: 0 }]}>Finanzas del Mes</Text>
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        {/* Merma Button */}
                                        <TouchableOpacity
                                            style={{ backgroundColor: 'rgba(225, 29, 72, 0.1)', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}
                                            onPress={() => { /* Handle merma action */ }} // Placeholder for merma action
                                        >
                                            <Ionicons name="flask-outline" size={20} color={colors.primary} />
                                        </TouchableOpacity>
                                        {/* Gasto Button */}
                                        <TouchableOpacity
                                            style={{ backgroundColor: colors.primary, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}
                                            onPress={() => setShowGastoModal(true)}
                                        >
                                            <Ionicons name="add" size={20} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={{ alignItems: 'center', flex: 1 }}>
                                        <Text style={{ fontSize: 9, color: colors.textMuted, textTransform: 'uppercase' }}>Ganancia</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#10b981' }}>${Number(data.finanzas.gananciaMes).toFixed(0)}</Text>
                                            <View style={{ backgroundColor: Number(data.finanzas.crecimientoGanancia) >= 0 ? '#10b981' : '#ef4444', paddingHorizontal: 3, borderRadius: 2 }}>
                                                <Text style={{ fontSize: 7, color: 'white', fontWeight: 'bold' }}>{Number(data.finanzas.crecimientoGanancia) >= 0 ? '+' : ''}{data.finanzas.crecimientoGanancia}%</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ width: 1, height: '100%', backgroundColor: colors.border }} />
                                    <View style={{ alignItems: 'center', flex: 1 }}>
                                        <Text style={{ fontSize: 9, color: colors.textMuted, textTransform: 'uppercase' }}>Insumos</Text>
                                        <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary }}>${Number(data.finanzas.costosMes).toFixed(0)}</Text>
                                    </View>
                                    <View style={{ width: 1, height: '100%', backgroundColor: colors.border }} />
                                    <View style={{ alignItems: 'center', flex: 1 }}>
                                        <Text style={{ fontSize: 9, color: colors.textMuted, textTransform: 'uppercase' }}>Gastos</Text>
                                        <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary }}>${Number(data.finanzas.gastosMes).toFixed(0)}</Text>
                                    </View>
                                    <View style={{ width: 1, height: '100%', backgroundColor: colors.border }} />
                                    <View style={{ alignItems: 'center', flex: 1 }}>
                                        <Text style={{ fontSize: 9, color: colors.textMuted, textTransform: 'uppercase' }}>Merma</Text>
                                        <Text style={{ fontSize: 13, fontWeight: '800', color: colors.primary }}>${Number(data.finanzas.mermaMes).toFixed(0)}</Text>
                                    </View>
                                </View>
                            </View>
                        </Animated.View>

                        {/* Módulo Admin: Finanzas Históricas y Gráficos */}
                        {user?.rol === 'admin' && data.historico && (
                            <Animated.View entering={FadeInDown.springify().damping(15).delay(500)}>
                                <View style={[styles.glassSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <View style={[styles.sectionHeader, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
                                        <View style={[styles.glassIconSmall, { backgroundColor: colors.background }]}>
                                            <Ionicons name="pie-chart-outline" size={18} color="#8b5cf6" />
                                        </View>
                                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Rendimiento Total (Histórico)</Text>
                                    </View>

                                    <View style={{ padding: 20, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                        <View>
                                            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Ventas Totales</Text>
                                            <Text style={[styles.cardValue, { fontSize: 24, color: colors.textPrimary }]}>${Number(data.historico.ventasTotal).toFixed(0)}</Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Ganancias Totales</Text>
                                            <Text style={[styles.cardValue, { fontSize: 24, color: '#10b981' }]}>${Number(data.historico.gananciaTotal).toFixed(0)}</Text>
                                        </View>
                                    </View>

                                    {/* Line Chart */}
                                    {data.ventasUltimos7Dias && data.ventasUltimos7Dias.length > 0 && (
                                        <View style={{ paddingTop: 20, alignItems: 'center' }}>
                                            <Text style={[styles.cardLabel, { color: colors.textSecondary, marginBottom: 12, marginLeft: 20, alignSelf: 'flex-start' }]}>Últimos 7 Días</Text>
                                            <LineChart
                                                data={{
                                                    labels: data.ventasUltimos7Dias.map((v: any) => {
                                                        const parts = v.fecha.split('-');
                                                        return `${parts[2]}/${parts[1]}`; // DD/MM formatting
                                                    }),
                                                    datasets: [
                                                        {
                                                            data: data.ventasUltimos7Dias.map((v: any) => v.total)
                                                        }
                                                    ]
                                                }}
                                                width={width - 48} // Padding offset
                                                height={180}
                                                yAxisLabel="$"
                                                yAxisInterval={1}
                                                chartConfig={{
                                                    backgroundColor: colors.card,
                                                    backgroundGradientFrom: colors.card,
                                                    backgroundGradientTo: colors.card,
                                                    decimalPlaces: 0,
                                                    color: (opacity = 1) => isDark ? `rgba(225, 29, 72, ${opacity})` : `rgba(225, 29, 72, ${opacity})`,
                                                    labelColor: (opacity = 1) => colors.textMuted,
                                                    style: {
                                                        borderRadius: 16
                                                    },
                                                    propsForDots: {
                                                        r: "4",
                                                        strokeWidth: "2",
                                                        stroke: colors.primary
                                                    }
                                                }}
                                                bezier
                                                style={{
                                                    marginVertical: 8,
                                                    borderRadius: 16
                                                }}
                                            />
                                        </View>
                                    )}
                                </View>
                            </Animated.View>
                        )}

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
                                                style={[styles.glassListItem, { borderBottomColor: idx === data.productosMasVendidos.length - 1 ? 'transparent' : colors.border }]}
                                            >
                                                <View style={[styles.listItemRank, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
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

            {/* Modal de Gastos */}
            <Modal visible={showGastoModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <Animated.View entering={FadeInDown.springify().damping(15)} style={[styles.notificationModal, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Registrar Gasto Operativo</Text>
                            <TouchableOpacity onPress={() => setShowGastoModal(false)}>
                                <Ionicons name="close-circle" size={32} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <KitchyInput label="Descripción" value={form.desc} onChangeText={(t) => setForm({ ...form, desc: t })} placeholder="Luz, Gas, Renta..." />
                        <KitchyInput label="Monto ($)" value={form.monto} onChangeText={(t) => setForm({ ...form, monto: t })} keyboardType="numeric" placeholder="0.00" />

                        <Text style={[styles.cardLabel, { color: colors.textMuted, marginTop: 10, marginBottom: 10 }]}>Categoría</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                            {['servicios', 'renta', 'personal', 'mantenimiento', 'impuestos', 'otro'].map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    style={{
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 20,
                                        borderWidth: 1,
                                        borderColor: form.cat === cat ? colors.primary : colors.border,
                                        backgroundColor: form.cat === cat ? 'rgba(225, 29, 72, 0.1)' : 'transparent'
                                    }}
                                    onPress={() => setForm({ ...form, cat })}
                                >
                                    <Text style={{
                                        fontSize: 12,
                                        color: form.cat === cat ? colors.primary : colors.textSecondary,
                                        textTransform: 'capitalize'
                                    }}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <KitchyButton
                            title="Guardar Gasto"
                            onPress={handleGuardarGasto}
                            loading={creatingGasto}
                        />
                    </Animated.View>
                </View>
            </Modal>

            <CaitlynAlertsModal 
                visible={showCaitlynAlerts}
                onClose={() => setShowCaitlynAlerts(false)}
                alertas={data?.inventario?.alertasRentabilidad || []}
                onAjustarPrecio={handleAjustarPrecio}
            />
        </View>
    );
}
