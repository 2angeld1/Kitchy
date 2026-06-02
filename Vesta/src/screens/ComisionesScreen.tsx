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
import { getComisiones, getVentas, updateComisionReventaConfig } from '../services/api';
import { getPeriodRanges } from '../utils/date-helpers';
import Toast from 'react-native-toast-message';
import { ComisionResumenTab } from './Comisiones/components/ComisionResumenTab';
import { ComisionReventaTab } from './Comisiones/components/ComisionReventaTab';
import { ComisionAjustesTab } from './Comisiones/components/ComisionAjustesTab';

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
    const [activeTab, setActiveTab] = React.useState<'resumen' | 'reventa' | 'ajustes'>('resumen');
    
    // Reventa config form
    const [reventaPct, setReventaPct] = React.useState('10');
    const [isSavingReventa, setIsSavingReventa] = React.useState(false);

    // Sync reventa pct from server data
    React.useEffect(() => {
        if (data?.comisionReventaConfig?.porcentajeGlobal != null) {
            setReventaPct(data.comisionReventaConfig.porcentajeGlobal.toString());
        }
    }, [data?.comisionReventaConfig]);

    const handleSaveReventa = async () => {
        setIsSavingReventa(true);
        try {
            await updateComisionReventaConfig({ porcentajeGlobal: parseInt(reventaPct) || 10 });
            Toast.show({ type: 'success', text1: 'Éxito', text2: 'Comisión de reventa actualizada' });
            cargarComisiones();
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar' });
        } finally {
            setIsSavingReventa(false);
        }
    };
    
    // Export States
    const [showExportModal, setShowExportModal] = React.useState(false);
    const [exportFormat, setExportFormat] = React.useState<'csv' | 'pdf'>('pdf');
    const [exportPeriodo, setExportPeriodo] = React.useState<'hoy' | 'semana' | 'quincena' | 'mes'>(periodo);
    const [isExporting, setIsExporting] = React.useState(false);

    const handleGenerateExport = async () => {
        setIsExporting(true);
        try {
            let exportData = data;
            const { inicio, fin } = getPeriodRanges(exportPeriodo as any);
            
            // Si el periodo de exportación es diferente al actual, cargamos los datos específicos
            if (exportPeriodo !== periodo) {
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

            // Para el PDF detallado, necesitamos el historial de ventas del periodo
            let ventasDetalle: any[] = [];
            if (exportFormat === 'pdf') {
                const vRes = await getVentas({
                    fechaInicio: inicio.toISOString(),
                    fechaFin: fin.toISOString(),
                    limit: 1000 // Asegurar traer todas las del periodo
                });
                ventasDetalle = vRes.data.ventas || vRes.data;
            }

            if (exportFormat === 'csv') {
                await exportComisionesCsv(exportData, exportPeriodo);
            } else {
                await exportComisionesPdf(exportData, exportPeriodo, 'Kitchy Beauty', ventasDetalle);
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
                {['resumen', 'reventa', 'ajustes'].map((tab) => (
                    <TouchableOpacity 
                        key={tab}
                        style={[styles.mainTab, activeTab === tab && styles.mainTabActive]}
                        onPress={() => setActiveTab(tab as any)}
                    >
                        <Text style={[styles.mainTabText, activeTab === tab && styles.mainTabTextActive]}>
                            {tab === 'reventa' ? '💰 reventa' : tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                refreshControl={<RefreshControl refreshing={loading} onRefresh={cargarComisiones} tintColor={colors.primary} />}
            >
                {activeTab === 'resumen' ? (
                    <ComisionResumenTab 
                        data={data}
                        periodo={periodo}
                        setPeriodo={setPeriodo}
                        colors={colors}
                        styles={styles}
                    />
                ) : activeTab === 'reventa' ? (
                    <ComisionReventaTab 
                        data={data}
                        periodo={periodo}
                        setPeriodo={setPeriodo}
                        reventaPct={reventaPct}
                        setReventaPct={setReventaPct}
                        handleSaveReventa={handleSaveReventa}
                        isSavingReventa={isSavingReventa}
                        colors={colors}
                        styles={styles}
                    />
                ) : (
                    <ComisionAjustesTab 
                        form={form}
                        setForm={setForm}
                        handleSaveConfig={handleUpdateConfig}
                        isSaving={isSaving}
                        colors={colors}
                        styles={styles}
                    />
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
