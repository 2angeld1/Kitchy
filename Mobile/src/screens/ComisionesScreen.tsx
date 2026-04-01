import React, { useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { KitchyInput } from '../components/KitchyInput';
import { KitchyButton } from '../components/KitchyButton';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';
import { useComisiones } from '../hooks/useComisiones';
import { createStyles } from '../styles/ComisionesScreen.styles';
import { formatMoney } from '../utils/beauty-helpers';
import { exportComisionesCsv, exportComisionesPdf } from '../utils/export-helpers';
import { getComisiones } from '../services/api';
import { getPeriodRanges } from '../utils/date-helpers';
import Toast from 'react-native-toast-message';

interface EspecialistaComision {
    id: string;
    nombre: string;
    imagen?: string;
    totalServicios: number;
    totalIngreso: number;
    ciclosCompletos: number;
    montoEspecialista: number;
    montoDueno: number;
    porcentajeActual: number;
}

export default function ComisionesScreen() {
    const navigation = useNavigation();
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const styles = useMemo(() => createStyles(colors), [colors]);

    const { 
        loading, 
        data, 
        periodo, 
        setPeriodo, 
        isSaving, 
        form, 
        setForm, 
        cargarComisiones, 
        handleUpdateConfig 
    } = useComisiones();
    const [activeTab, setActiveTab] = React.useState<'resumen' | 'ajustes'>('resumen');
    
    // Export States
    const [showExportModal, setShowExportModal] = React.useState(false);
    const [exportFormat, setExportFormat] = React.useState<'csv' | 'pdf'>('pdf');
    const [exportPeriodo, setExportPeriodo] = React.useState<'hoy' | 'semana' | 'quincena' | 'mes'>(periodo);
    const [isExporting, setIsExporting] = React.useState(false);

    const handleGenerateExport = async () => {
        setIsExporting(true);
        try {
            let exportData = data;
            
            // Si el periodo de exportación es diferente al actual, cargamos los datos específicos
            if (exportPeriodo !== periodo) {
                const { inicio, fin } = getPeriodRanges(exportPeriodo as any);
                const res = await getComisiones({ 
                    periodo: exportPeriodo,
                    fechaInicio: inicio.toISOString(),
                    fechaFin: fin.toISOString()
                });
                exportData = res.data;
            }

            if (!exportData || !exportData.resumen) {
                Toast.show({ type: 'error', text1: 'Error', text2: 'No hay datos para exportar en este periodo.' });
                return;
            }

            if (exportFormat === 'csv') {
                await exportComisionesCsv(exportData, exportPeriodo);
            } else {
                await exportComisionesPdf(exportData, exportPeriodo);
            }
            
            setShowExportModal(false);
            Toast.show({ type: 'success', text1: 'Éxito', text2: `Reporte ${exportFormat.toUpperCase()} generado.` });
        } catch (err) {
            console.error(err);
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo generar el reporte.' });
        } finally {
            setIsExporting(false);
        }
    };

    if (loading && !data) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <KitchyToolbar
                title="Comisiones"
                onBack={() => navigation.goBack()}
                extraButtons={
                    <TouchableOpacity 
                        style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }}
                        onPress={() => {
                            setExportPeriodo(periodo); // Sincronizar con el actual por defecto
                            setShowExportModal(true);
                        }}
                    >
                        <Ionicons name="cloud-download-outline" size={22} color={colors.primary} />
                    </TouchableOpacity>
                }
            />

            {/* TAB SELECTOR */}
            <View style={styles.mainHeaderTabs}>
                {['resumen', 'ajustes'].map((tab) => (
                    <TouchableOpacity 
                        key={tab}
                        style={[styles.mainTab, activeTab === tab && styles.mainTabActive]}
                        onPress={() => setActiveTab(tab as any)}
                    >
                        <Text style={[styles.mainTabText, activeTab === tab && styles.mainTabTextActive]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                refreshControl={<RefreshControl refreshing={loading} onRefresh={cargarComisiones} tintColor={colors.primary} />}
            >
                {activeTab === 'resumen' ? (
                    <View style={styles.scrollContent}>
                        {/* Period Selector */}
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                            {['hoy', 'semana', 'quincena', 'mes'].map((p) => (
                                <TouchableOpacity 
                                    key={p} 
                                    onPress={() => setPeriodo(p as any)}
                                    style={{ 
                                        paddingHorizontal: 12, 
                                        paddingVertical: 6, 
                                        borderRadius: 20, 
                                        backgroundColor: periodo === p ? colors.primary : colors.surface,
                                        borderWidth: 1,
                                        borderColor: periodo === p ? colors.primary : colors.border
                                    }}
                                >
                                    <Text style={{ 
                                        fontSize: 10, 
                                        fontWeight: '800', 
                                        textTransform: 'uppercase',
                                        color: periodo === p ? '#fff' : colors.textSecondary 
                                    }}>{p}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Resumen General */}
                        {data?.resumen && (
                            <Animated.View entering={FadeInDown.delay(100)} style={styles.resumenCard}>
                                <Text style={styles.labelResumen}>
                                    Ingreso {periodo === 'hoy' ? 'de Hoy' : periodo === 'semana' ? 'de la Semana' : periodo === 'quincena' ? 'de la Quincena' : 'del Mes'}
                                </Text>
                                <Text style={styles.montoGeneral}>{formatMoney(data.resumen.totalGeneral)}</Text>
                                <Text style={styles.descResumen}>{data.resumen.totalServicios} servicios realizados en este {periodo}</Text>

                                <View style={styles.rowMonto}>
                                    <View style={[styles.cardMonto, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                                        <Text style={[styles.especialistaLabel, { color: '#8b5cf6' }]}>ESPECIALISTAS</Text>
                                        <Text style={[styles.especialistaMonto, { color: '#8b5cf6' }]}>{formatMoney(data.resumen.totalEspecialistas)}</Text>
                                    </View>
                                    <View style={[styles.cardMonto, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                        <Text style={[styles.especialistaLabel, { color: '#10b981' }]}>GANANCIA LOCAL</Text>
                                        <Text style={[styles.especialistaMonto, { color: '#10b981' }]}>{formatMoney(data.resumen.totalDueno)}</Text>
                                    </View>
                                </View>

                                {data.config && (
                                    <View style={styles.configMeta}>
                                        <Ionicons name="flash-outline" size={14} color={colors.primary} />
                                        <Text style={[styles.metaText, { color: colors.primary, fontWeight: '800' }]}>
                                            MODO ESCALONADO ACTIVO
                                        </Text>
                                    </View>
                                )}
                            </Animated.View>
                        )}

                        {/* Reglas Activas (Mini Leyenda) */}
                        {data.config?.escalonado && data.config.escalonado.length > 0 && (
                            <Animated.View entering={FadeInDown.delay(200)} style={styles.infoBento}>
                                <Text style={[styles.sectionTitle, { fontSize: 13, marginBottom: 8 }]}>Reglas de Comisionado</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                    {data.config.escalonado.map((t: any, i: number) => (
                                        <View key={i} style={{ backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
                                            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textPrimary }}>
                                                {t.desde}-{t.hasta} serv: <Text style={{ color: colors.primary }}>{t.porcentajeBarbero}%</Text>
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </Animated.View>
                        )}

                        <Text style={styles.sectionTitle}>Desglose por Especialista</Text>

                        {data?.especialistas?.map((esp: EspecialistaComision, idx: number) => (
                            <Animated.View
                                key={esp.id}
                                entering={FadeInDown.delay(300 + idx * 80)}
                                style={styles.especialistaCard}
                            >
                                <View style={styles.especialistaRow}>
                                    <View style={styles.espInfoRow}>
                                        <View style={styles.avatarPlaceholder}>
                                            <Ionicons name="person" size={22} color="#8b5cf6" />
                                        </View>
                                        <View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <Text style={styles.espName}>{esp.nombre}</Text>
                                                <View style={{ backgroundColor: `${colors.primary}15`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                                                    <Text style={{ fontSize: 10, fontWeight: '900', color: colors.primary }}>{esp.porcentajeActual}%</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.espSubtitle}>{esp.totalServicios} servicios realizados en este {periodo}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.montoCol}>
                                        <Text style={styles.montoEsp}>{formatMoney(esp.montoEspecialista)}</Text>
                                        <Text style={styles.montoTotalEsp}>de {formatMoney(esp.totalIngreso)}</Text>
                                    </View>
                                </View>
                            </Animated.View>
                        ))}

                        {(!data?.especialistas || data.especialistas.length === 0) && (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="cut-outline" size={64} color={colors.textMuted} />
                                <Text style={styles.emptyTitle}>Sin servicios este mes</Text>
                                <Text style={styles.emptySubtitle}>
                                    Registra ventas asignando un especialista para ver las comisiones aquí.
                                </Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.settingsSection}
                    >
                        <Animated.View entering={FadeInDown}>
                            <Text style={styles.settingsTitle}>Ajustes del Negocio</Text>
                            <Text style={styles.settingsDesc}>
                                Define los tramos de comisión para tus barbero/estilistas según su volumen diario.
                            </Text>

                            <View>
                                <View style={styles.columnHeader}>
                                    <Text style={[styles.headerLabel, { flex: 0.8 }]}>Desde</Text>
                                    <Text style={[styles.headerLabel, { flex: 0.8 }]}>Hasta</Text>
                                    <Text style={[styles.headerLabel, { flex: 1.2 }]}>% Barbero</Text>
                                    <View style={{ width: 44 }} />
                                </View>
                                {form.escalonado.map((tier: any, index: number) => (
                                    <View key={index} style={styles.tierItem}>
                                        <View style={{ flex: 0.8 }}>
                                            <KitchyInput
                                                style={{ height: 48, marginBottom: 0 }}
                                                containerStyle={{ marginBottom: 0 }}
                                                value={tier.desde.toString()}
                                                onChangeText={(t) => {
                                                    const newEsc = [...form.escalonado];
                                                    newEsc[index] = { ...tier, desde: parseInt(t) || 0 };
                                                    setForm({ ...form, escalonado: newEsc });
                                                }}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <View style={{ flex: 0.8 }}>
                                            <KitchyInput
                                                style={{ height: 48, marginBottom: 0 }}
                                                containerStyle={{ marginBottom: 0 }}
                                                value={tier.hasta.toString()}
                                                onChangeText={(t) => {
                                                    const newEsc = [...form.escalonado];
                                                    newEsc[index] = { ...tier, hasta: parseInt(t) || 0 };
                                                    setForm({ ...form, escalonado: newEsc });
                                                }}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <View style={{ flex: 1.2 }}>
                                            <KitchyInput
                                                style={{ height: 48, marginBottom: 0 }}
                                                containerStyle={{ marginBottom: 0 }}
                                                value={tier.porcentajeBarbero.toString()}
                                                onChangeText={(t) => {
                                                    const p = parseInt(t) || 0;
                                                    const newEsc = [...form.escalonado];
                                                    newEsc[index] = { ...tier, porcentajeBarbero: p, porcentajeDueno: 100 - p };
                                                    setForm({ ...form, escalonado: newEsc });
                                                }}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <TouchableOpacity 
                                            style={styles.removeTierBtn}
                                            onPress={() => {
                                                const newEsc = form.escalonado.filter((_: any, i: number) => i !== index);
                                                setForm({ ...form, escalonado: newEsc });
                                            }}
                                        >
                                            <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                <TouchableOpacity 
                                    style={styles.addTierBtn}
                                    onPress={() => {
                                        const lastHasta = form.escalonado.length > 0 ? form.escalonado[form.escalonado.length - 1].hasta : 0;
                                        setForm({
                                            ...form,
                                            escalonado: [...form.escalonado, { desde: lastHasta + 1, hasta: lastHasta + 4, porcentajeBarbero: 50, porcentajeDueno: 50 }]
                                        });
                                    }}
                                >
                                    <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                                    <Text style={styles.addTierText}>Añadir Tramo de Servicios</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.infoBento}>
                                <Text style={styles.infoText}>
                                    ℹ️ El sistema calculará automáticamente el mejor porcentaje para el barbero según el tramo de volumen alcancado hoy. Los tramos definen la meta diaria.
                                </Text>
                            </View>

                            <KitchyButton
                                title="Guardar Nuevos Ajustes"
                                onPress={handleUpdateConfig}
                                loading={isSaving}
                            />
                        </Animated.View>
                    </KeyboardAvoidingView>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* MODAL DE EXPORTACIÓN */}
            <Modal visible={showExportModal} transparent animationType="fade">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Animated.View entering={FadeInDown} style={{ width: '100%', backgroundColor: colors.card, borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 20, fontWeight: '900', color: colors.textPrimary }}>Exportar Reporte</Text>
                            <TouchableOpacity onPress={() => setShowExportModal(false)}>
                                <Ionicons name="close-circle" size={32} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 12, textTransform: 'uppercase' }}>1. Formato de Archivo</Text>
                        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                            {['pdf', 'csv'].map((f) => (
                                <TouchableOpacity 
                                    key={f}
                                    style={{ flex: 1, height: 50, borderRadius: 12, backgroundColor: exportFormat === f ? colors.primary : colors.surface, borderWidth: 1, borderColor: exportFormat === f ? colors.primary : colors.border, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8 }}
                                    onPress={() => setExportFormat(f as any)}
                                >
                                    <Ionicons name={f === 'pdf' ? 'document-text' : 'list-circle'} size={18} color={exportFormat === f ? '#fff' : colors.textPrimary} />
                                    <Text style={{ fontWeight: '800', color: exportFormat === f ? '#fff' : colors.textPrimary }}>{f.toUpperCase()}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 12, textTransform: 'uppercase' }}>2. Periodo del Reporte</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 30 }}>
                            {['hoy', 'semana', 'quincena', 'mes'].map((p) => (
                                <TouchableOpacity 
                                    key={p}
                                    style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: exportPeriodo === p ? `${colors.primary}15` : colors.surface, borderWidth: 1, borderColor: exportPeriodo === p ? colors.primary : colors.border }}
                                    onPress={() => setExportPeriodo(p as any)}
                                >
                                    <Text style={{ fontSize: 11, fontWeight: '900', color: exportPeriodo === p ? colors.primary : colors.textSecondary, textTransform: 'uppercase' }}>{p}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <KitchyButton 
                            title={isExporting ? "Generando..." : `Generar ${exportFormat.toUpperCase()}`} 
                            loading={isExporting} 
                            onPress={handleGenerateExport} 
                        />
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}
