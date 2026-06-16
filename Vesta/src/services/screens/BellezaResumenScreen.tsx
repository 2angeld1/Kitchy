import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Platform, Modal, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../styles/BellezaResumenScreen.styles';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { VestaToolbar } from '../../shared/components/VestaToolbar';
import { useTheme } from '../../shared/context/ThemeContext';
import { lightTheme, darkTheme } from '../../shared/theme';
import { VestaInput } from '../../shared/components/VestaInput';
import { useBellezaResumen } from '../hooks/useBellezaResumen';

export default function BellezaResumenScreen() {
    const navigation = useNavigation();
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const { activeTab, setActiveTab, loading, refreshing, onRefresh, resumenEspecialistas, expandedEspecialista, toggleAccordion, isExporting, handleDescargarGlobal, handleEnviarEspecialistas } = useBellezaResumen();

    const renderItemRow = (item: any, idx: number) => {
        const dateObj = new Date(item.fecha);
        const dateStr = activeTab === 'semanal'
            ? `${dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })} - ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <View key={idx} style={styles.itemRow}>
                <View style={{ flex: 2 }}>
                    <Text style={[styles.itemName, { color: colors.textPrimary }]}>{item.nombre}</Text>
                    <Text style={styles.itemDate}>{dateStr}</Text>
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
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <VestaToolbar
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
                                                <Text style={styles.espMeta}>
                                                    {esp.serviciosItems.length > 0 ? `${esp.serviciosItems[esp.serviciosItems.length - 1].porcentaje}% | ` : ''} 
                                                    {esp.serviciosItems.length} servicios · {esp.productosItems.length} productos
                                                </Text>
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
                                                </View>
                                        </Animated.View>
                                    )}
                                </Animated.View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Botones de Acción Globales */}
            {!loading && resumenEspecialistas.length > 0 && (
                <View style={{ padding: 16, backgroundColor: colors.card, borderTopWidth: 1, borderColor: colors.border }}>
                    <TouchableOpacity
                        style={[styles.generateBtn, { backgroundColor: colors.primary, marginBottom: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }]}
                        onPress={handleEnviarEspecialistas}
                        disabled={isExporting}
                    >
                        {isExporting ? <ActivityIndicator color="#fff" /> : <Ionicons name="mail" size={20} color="#fff" />}
                        <Text style={styles.generateBtnText}>Enviar Reportes (Masivo)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.generateBtn, { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }]}
                        onPress={handleDescargarGlobal}
                        disabled={isExporting}
                    >
                        <Ionicons name="download-outline" size={20} color={colors.primary} />
                        <Text style={[styles.generateBtnText, { color: colors.primary }]}>Descargar PDF Global</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
