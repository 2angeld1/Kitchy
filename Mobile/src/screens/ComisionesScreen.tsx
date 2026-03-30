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
        </View>
    );
}
