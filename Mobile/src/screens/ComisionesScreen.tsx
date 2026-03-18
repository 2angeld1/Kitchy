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
}

export default function ComisionesScreen() {
    const navigation = useNavigation();
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const styles = useMemo(() => createStyles(colors), [colors]);

    const { loading, data, showConfigModal, setShowConfigModal, isSaving, form, setForm, cargarComisiones, handleUpdateConfig } = useComisiones();

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
                        onPress={() => setShowConfigModal(true)}
                        style={styles.settingsBtn}
                    >
                        <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
                    </TouchableOpacity>
                }
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={cargarComisiones} tintColor={colors.primary} />}
            >
                {/* Resumen General */}
                {data?.resumen && (
                    <Animated.View entering={FadeInDown.delay(100)} style={styles.resumenCard}>
                        <Text style={styles.labelResumen}>Ingreso Total del Mes</Text>
                        <Text style={styles.montoGeneral}>{formatMoney(data.resumen.totalGeneral)}</Text>
                        <Text style={styles.descResumen}>{data.resumen.totalServicios} servicios realizados</Text>

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
                                <Ionicons name="settings-outline" size={14} color={colors.textMuted} />
                                <Text style={styles.metaText}>
                                    Configuración: {data.config.porcentajeBarbero}% / {data.config.porcentajeDueno}% — Meta: {data.config.cortesPorCiclo} servicios
                                </Text>
                            </View>
                        )}
                    </Animated.View>
                )}

                {/* Lista de Barberos/Estilistas */}
                <Text style={styles.sectionTitle}>Desglose por Especialista</Text>

                {data?.especialistas?.map((esp: EspecialistaComision, idx: number) => (
                    <Animated.View
                        key={esp.id}
                        entering={FadeInDown.delay(200 + idx * 80)}
                        style={styles.especialistaCard}
                    >
                        <View style={styles.especialistaRow}>
                            <View style={styles.espInfoRow}>
                                <View style={styles.avatarPlaceholder}>
                                    <Ionicons name="person" size={22} color="#8b5cf6" />
                                </View>
                                <View>
                                    <Text style={styles.espName}>{esp.nombre}</Text>
                                    <Text style={styles.espSubtitle}>{esp.totalServicios} servicios • {esp.ciclosCompletos} ciclos</Text>
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
            </ScrollView>

            {/* Modal de Configuración */}
            <Modal visible={showConfigModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        <Animated.View entering={SlideInDown} style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Ajustes de Comisión</Text>
                                <TouchableOpacity onPress={() => setShowConfigModal(false)}>
                                    <Ionicons name="close-circle" size={32} color={colors.textMuted} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.modalDesc}>
                                Define cómo se reparte el ingreso por cada servicio realizado en tu negocio.
                            </Text>

                            <View style={styles.inputRow}>
                                <View style={styles.inputCol}>
                                    <KitchyInput
                                        label="% Especialista"
                                        value={form.porcentajeBarbero}
                                        onChangeText={(t) => setForm({ ...form, porcentajeBarbero: t })}
                                        keyboardType="numeric"
                                        placeholder="50"
                                    />
                                </View>
                                <View style={styles.inputCol}>
                                    <KitchyInput
                                        label="% Local"
                                        value={form.porcentajeDueno}
                                        onChangeText={(t) => setForm({ ...form, porcentajeDueno: t })}
                                        keyboardType="numeric"
                                        placeholder="50"
                                    />
                                </View>
                            </View>

                            <KitchyInput
                                label="Servicios por Ciclo"
                                value={form.cortesPorCiclo}
                                onChangeText={(t) => setForm({ ...form, cortesPorCiclo: t })}
                                keyboardType="numeric"
                                placeholder="5"
                            />

                            <View style={styles.infoBento}>
                                <Text style={styles.infoText}>
                                    ℹ️ Los ciclos ayudan a los barberos a llevar la cuenta de su meta diaria o semanal.
                                </Text>
                            </View>

                            <KitchyButton
                                title="Guardar Cambios"
                                onPress={handleUpdateConfig}
                                loading={isSaving}
                            />
                        </Animated.View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}
