import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp, Layout, SlideInRight } from 'react-native-reanimated';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme, typography, spacing } from '../theme';
import { getVentas, getNegocioActual } from '../services/api';
import { getTodayLocalString } from '../utils/date-helpers';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

type TabType = 'diario' | 'semanal';

export default function BellezaResumenScreen() {
    const navigation = useNavigation();
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const [activeTab, setActiveTab] = useState<TabType>('diario');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [ventas, setVentas] = useState<any[]>([]);
    const [negocioInfo, setNegocioInfo] = useState<any>(null);
    const [expandedEspecialista, setExpandedEspecialista] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const now = new Date();
            let fechaInicio, fechaFin;

            if (activeTab === 'diario') {
                const hoy = getTodayLocalString();
                fechaInicio = hoy;
                fechaFin = hoy;
            } else {
                // Semana (últimos 7 días)
                const weekAgo = new Date(now);
                weekAgo.setDate(now.getDate() - 7);
                fechaInicio = weekAgo.toISOString().split('T')[0];
                fechaFin = now.toISOString().split('T')[0];
            }

            const [ventasRes, negocioRes] = await Promise.all([
                getVentas({ fechaInicio, fechaFin, limite: 500 }),
                getNegocioActual()
            ]);

            setVentas(Array.isArray(ventasRes.data) ? ventasRes.data : (ventasRes.data.ventas || []));
            setNegocioInfo(negocioRes.data);
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar los datos del resumen.' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // Procesar datos para agrupar por especialista
    const resumenEspecialistas = useMemo(() => {
        if (!ventas.length || !negocioInfo) return [];

        const especialistasMap: any = {};
        const config = negocioInfo.comisionConfig || {};
        const configReventa = negocioInfo.comisionReventa || { porcentajeGlobal: 10 };

        ventas.forEach(venta => {
            let espId = 'CAJA';
            let espNombre = 'Ventas de Caja';

            if (venta.especialista) {
                espId = typeof venta.especialista === 'object' ? venta.especialista._id : venta.especialista;
                espNombre = venta.especialista.nombre || 'Desconocido';
            }

            if (!especialistasMap[espId]) {
                especialistasMap[espId] = {
                    id: espId,
                    nombre: espNombre,
                    serviciosItems: [],
                    productosItems: [],
                    totalRecaudado: 0,
                    totalComision: 0,
                    conteoServicios: 0
                };
            }

            const espData = especialistasMap[espId];

            venta.items.forEach((item: any) => {
                const subtotal = item.subtotal || (item.precioUnitario * item.cantidad);
                const esProducto = item.producto?.categoria === 'PRODUCTO' || item.producto?.categoria === 'otro'; 
                // Nota: categoria 'servicio' o 'belleza' son servicios
                const esServicio = item.producto?.categoria === 'servicio' || item.producto?.categoria === 'belleza' || item.producto?.categoria === 'comida';

                let porcentaje = 0;
                let comisionCalculada = 0;

                if (espId !== 'CAJA') {
                    if (esServicio) {
                        espData.conteoServicios += item.cantidad;
                        // Lógica de comisión para servicios
                        if (config.tipo === 'fijo') {
                            porcentaje = config.fijo?.porcentajeBarbero || 50;
                        } else if (config.tipo === 'escalonado') {
                            const escalon = config.escalonado?.find((e: any) => 
                                espData.conteoServicios >= e.desde && espData.conteoServicios <= e.hasta
                            ) || config.escalonado?.[config.escalonado.length - 1]; // Último escalón si no encuentra
                            porcentaje = escalon?.porcentajeBarbero || 50;
                        }
                        comisionCalculada = (subtotal * porcentaje) / 100;
                    } else {
                        // Reventa de productos
                        porcentaje = configReventa.porcentajeGlobal || 10;
                        comisionCalculada = (subtotal * porcentaje) / 100;
                    }
                }

                if (esServicio) {
                    espData.serviciosItems.push({
                        nombre: item.nombreProducto,
                        precio: item.precioUnitario,
                        cantidad: item.cantidad,
                        subtotal,
                        porcentaje,
                        comision: comisionCalculada,
                        fecha: venta.createdAt
                    });
                } else {
                    espData.productosItems.push({
                        nombre: item.nombreProducto,
                        precio: item.precioUnitario,
                        cantidad: item.cantidad,
                        subtotal,
                        porcentaje,
                        comision: comisionCalculada,
                        fecha: venta.createdAt
                    });
                }

                espData.totalRecaudado += subtotal;
                espData.totalComision += comisionCalculada;
            });
        });

        return Object.values(especialistasMap).sort((a: any, b: any) => b.totalRecaudado - a.totalRecaudado);
    }, [ventas, negocioInfo]);

    const toggleAccordion = (id: string) => {
        setExpandedEspecialista(expandedEspecialista === id ? null : id);
    };

    const renderItemRow = (item: any, idx: number) => (
        <View key={idx} style={styles.itemRow}>
            <View style={{ flex: 2 }}>
                <Text style={[styles.itemName, { color: colors.textPrimary }]}>{item.nombre}</Text>
                <Text style={styles.itemDate}>{new Date(item.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={[styles.itemLabel, { color: colors.textMuted }]}>Precio</Text>
                <Text style={[styles.itemValue, { color: colors.textPrimary }]}>${item.precio.toFixed(2)}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={[styles.itemLabel, { color: colors.textMuted }]}>Com. ({item.porcentaje}%)</Text>
                <Text style={[styles.itemValue, { color: colors.primary, fontWeight: '800' }]}>${item.comision.toFixed(2)}</Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <KitchyToolbar 
                title="Resumen de Belleza" 
                onBack={() => navigation.goBack()}
                showNotifications={false}
            />

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    onPress={() => setActiveTab('diario')}
                    style={[styles.tab, activeTab === 'diario' && { backgroundColor: `${colors.primary}20`, borderColor: colors.primary }]}
                >
                    <Ionicons name="calendar-outline" size={18} color={activeTab === 'diario' ? colors.primary : colors.textMuted} />
                    <Text style={[styles.tabText, { color: activeTab === 'diario' ? colors.primary : colors.textMuted }]}>Hoy</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => setActiveTab('semanal')}
                    style={[styles.tab, activeTab === 'semanal' && { backgroundColor: `${colors.primary}20`, borderColor: colors.primary }]}
                >
                    <Ionicons name="stats-chart-outline" size={18} color={activeTab === 'semanal' ? colors.primary : colors.textMuted} />
                    <Text style={[styles.tabText, { color: activeTab === 'semanal' ? colors.primary : colors.textMuted }]}>Semanal</Text>
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ color: colors.textMuted, marginTop: 12 }}>Generando reporte...</Text>
                </View>
            ) : (
                <ScrollView 
                    style={styles.scroll}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                >
                    {resumenEspecialistas.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="document-text-outline" size={64} color={colors.border} />
                            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sin actividad</Text>
                            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>No hay ventas registradas en este periodo.</Text>
                        </View>
                    ) : (
                        <View style={styles.content}>
                            {resumenEspecialistas.map((esp: any, idx) => (
                                <Animated.View 
                                    key={esp.id} 
                                    entering={FadeInDown.delay(idx * 100)}
                                    layout={Layout.springify()}
                                    style={[styles.espCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                >
                                    <TouchableOpacity 
                                        style={styles.espHeader}
                                        onPress={() => toggleAccordion(esp.id)}
                                    >
                                        <View style={styles.espInfo}>
                                            <View style={[styles.avatar, { backgroundColor: `${colors.primary}15` }]}>
                                                <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 18 }}>{esp.nombre.charAt(0)}</Text>
                                            </View>
                                            <View>
                                                <Text style={[styles.espName, { color: colors.textPrimary }]}>{esp.nombre}</Text>
                                                <Text style={styles.espMeta}>{esp.serviciosItems.length} servicios · {esp.productosItems.length} productos</Text>
                                            </View>
                                        </View>
                                        <View style={styles.espTotals}>
                                            <Text style={styles.totalLabel}>Ganado</Text>
                                            <Text style={[styles.totalAmount, { color: colors.primary }]}>${esp.totalComision.toFixed(2)}</Text>
                                        </View>
                                        <Ionicons 
                                            name={expandedEspecialista === esp.id ? "chevron-up" : "chevron-down"} 
                                            size={20} 
                                            color={colors.textMuted} 
                                            style={{ marginLeft: 8 }}
                                        />
                                    </TouchableOpacity>

                                    {expandedEspecialista === esp.id && (
                                        <Animated.View entering={FadeInUp} style={styles.espDetail}>
                                            {/* Tabla de Servicios */}
                                            {esp.serviciosItems.length > 0 && (
                                                <>
                                                    <Text style={styles.detailSectionTitle}>Servicios Realizados</Text>
                                                    {esp.serviciosItems.map(renderItemRow)}
                                                </>
                                            )}

                                            {/* Tabla de Productos */}
                                            {esp.productosItems.length > 0 && (
                                                <>
                                                    <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 12 }]} />
                                                    <Text style={styles.detailSectionTitle}>Venta de Productos</Text>
                                                    {esp.productosItems.map(renderItemRow)}
                                                </>
                                            )}

                                            <View style={[styles.summaryFooter, { backgroundColor: `${colors.primary}08` }]}>
                                                <View style={styles.footerRow}>
                                                    <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>Recaudado Total:</Text>
                                                    <Text style={[styles.footerValue, { color: colors.textPrimary }]}>${esp.totalRecaudado.toFixed(2)}</Text>
                                                </View>
                                                <View style={styles.footerRow}>
                                                    <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>Tu Comisión Total:</Text>
                                                    <Text style={[styles.footerValue, { color: colors.primary, fontWeight: '900', fontSize: 18 }]}>${esp.totalComision.toFixed(2)}</Text>
                                                </View>
                                                <TouchableOpacity style={[styles.generateBtn, { backgroundColor: colors.primary }]}>
                                                    <Text style={styles.generateBtnText}>Generar Pago</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </Animated.View>
                                    )}
                                </Animated.View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    tabText: {
        fontWeight: '800',
        fontSize: 14,
        marginLeft: 8,
    },
    scroll: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    espCard: {
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 16,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            }
        })
    },
    espHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    espInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    espName: {
        fontSize: 16,
        fontWeight: '800',
    },
    espMeta: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    espTotals: {
        alignItems: 'flex-end',
    },
    totalLabel: {
        fontSize: 10,
        color: '#888',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: '900',
    },
    espDetail: {
        padding: 16,
        paddingTop: 0,
    },
    detailSectionTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#666',
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    itemRow: {
        flexDirection: 'row',
        marginBottom: 14,
        alignItems: 'center',
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
    },
    itemDate: {
        fontSize: 10,
        color: '#999',
    },
    itemLabel: {
        fontSize: 9,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    itemValue: {
        fontSize: 13,
        fontWeight: '600',
    },
    summaryFooter: {
        borderRadius: 16,
        padding: 16,
        marginTop: 8,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    footerLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    footerValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    generateBtn: {
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    generateBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '900',
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
    divider: {
        height: 1,
        width: '100%',
    }
});
