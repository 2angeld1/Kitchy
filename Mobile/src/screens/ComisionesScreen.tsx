import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { KitchyInput } from '../components/KitchyInput';
import { KitchyButton } from '../components/KitchyButton';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';
import { getComisiones, updateComisionConfig } from '../services/api';
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
}

export default function ComisionesScreen() {
    const navigation = useNavigation();
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState({
        porcentajeBarbero: '50',
        porcentajeDueno: '50',
        cortesPorCiclo: '5'
    });

    const cargarComisiones = async () => {
        setLoading(true);
        try {
            const res = await getComisiones();
            setData(res.data);
            if (res.data.config) {
                setForm({
                    porcentajeBarbero: res.data.config.porcentajeBarbero.toString(),
                    porcentajeDueno: res.data.config.porcentajeDueno.toString(),
                    cortesPorCiclo: res.data.config.cortesPorCiclo.toString(),
                });
            }
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateConfig = async () => {
        const pb = parseInt(form.porcentajeBarbero);
        const pd = parseInt(form.porcentajeDueno);
        const cc = parseInt(form.cortesPorCiclo);

        if (isNaN(pb) || isNaN(pd) || isNaN(cc)) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Ingresa valores numéricos válidos' });
            return;
        }

        if (pb + pd !== 100) {
            Toast.show({ type: 'error', text1: 'Atención', text2: 'La suma de porcentajes debe ser 100%' });
            return;
        }

        setIsSaving(true);
        try {
            await updateComisionConfig({
                porcentajeBarbero: pb,
                porcentajeDueno: pd,
                cortesPorCiclo: cc
            });
            Toast.show({ type: 'success', text1: 'Éxito', text2: 'Configuración actualizada' });
            setShowConfigModal(false);
            cargarComisiones();
        } catch (err: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo actualizar la configuración' });
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        cargarComisiones();
    }, []);

    if (loading && !data) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <KitchyToolbar 
                title="Comisiones" 
                onBack={() => navigation.goBack()} 
                extraButtons={
                    <TouchableOpacity 
                        onPress={() => setShowConfigModal(true)}
                        style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }}
                    >
                        <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
                    </TouchableOpacity>
                }
            />

            <ScrollView
                contentContainerStyle={{ padding: 20 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={cargarComisiones} tintColor={colors.primary} />}
            >
                {/* Resumen General */}
                {data?.resumen && (
                    <Animated.View entering={FadeInDown.delay(100)} style={{ backgroundColor: colors.card, borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>Ingreso Total del Mes</Text>
                        <Text style={{ color: colors.textPrimary, fontSize: 32, fontWeight: '900' }}>${data.resumen.totalGeneral}</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>{data.resumen.totalServicios} servicios realizados</Text>

                        <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
                            <View style={{ flex: 1, backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: 12, borderRadius: 14 }}>
                                <Text style={{ color: '#8b5cf6', fontSize: 10, fontWeight: '700' }}>ESPECIALISTAS</Text>
                                <Text style={{ color: '#8b5cf6', fontSize: 20, fontWeight: '800' }}>${data.resumen.totalEspecialistas}</Text>
                            </View>
                            <View style={{ flex: 1, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 12, borderRadius: 14 }}>
                                <Text style={{ color: '#10b981', fontSize: 10, fontWeight: '700' }}>TU PARTE</Text>
                                <Text style={{ color: '#10b981', fontSize: 20, fontWeight: '800' }}>${data.resumen.totalDueno}</Text>
                            </View>
                        </View>

                        {data.config && (
                            <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Ionicons name="settings-outline" size={14} color={colors.textMuted} />
                                <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                                    Reparto: {data.config.porcentajeBarbero}% especialista / {data.config.porcentajeDueno}% local — Cada {data.config.cortesPorCiclo} servicios
                                </Text>
                            </View>
                        )}
                    </Animated.View>
                )}

                {/* Lista de Barberos/Estilistas */}
                <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Desglose por Especialista</Text>

                {data?.especialistas?.map((esp: EspecialistaComision, idx: number) => (
                    <Animated.View
                        key={esp.id}
                        entering={FadeInDown.delay(200 + idx * 80)}
                        style={{
                            backgroundColor: colors.card,
                            borderRadius: 20,
                            padding: 16,
                            marginBottom: 14,
                            borderWidth: 1,
                            borderColor: colors.border
                        }}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(139, 92, 246, 0.15)', justifyContent: 'center', alignItems: 'center' }}>
                                    <Ionicons name="person" size={22} color="#8b5cf6" />
                                </View>
                                <View>
                                    <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 15 }}>{esp.nombre}</Text>
                                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>{esp.totalServicios} servicios • {esp.ciclosCompletos} ciclos</Text>
                                </View>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ color: '#8b5cf6', fontWeight: '800', fontSize: 16 }}>${esp.montoEspecialista.toFixed(2)}</Text>
                                <Text style={{ color: colors.textMuted, fontSize: 10 }}>de ${esp.totalIngreso.toFixed(2)}</Text>
                            </View>
                        </View>
                    </Animated.View>
                ))}

                {(!data?.especialistas || data.especialistas.length === 0) && (
                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                        <Ionicons name="cut-outline" size={64} color={colors.textMuted} />
                        <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: 'bold', marginTop: 16 }}>Sin servicios este mes</Text>
                        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
                            Registra ventas asignando un especialista para ver las comisiones aquí.
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Modal de Configuración */}
            <Modal visible={showConfigModal} transparent animationType="fade">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        <Animated.View entering={SlideInDown} style={{ backgroundColor: colors.card, borderRadius: 28, padding: 24, borderWidth: 1, borderColor: colors.border }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <Text style={{ fontSize: 20, fontWeight: '900', color: colors.textPrimary }}>Ajustes de Comisión</Text>
                                <TouchableOpacity onPress={() => setShowConfigModal(false)}>
                                    <Ionicons name="close-circle" size={32} color={colors.textMuted} />
                                </TouchableOpacity>
                            </View>

                            <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 20 }}>
                                Define cómo se reparte el ingreso por cada servicio realizado en tu negocio.
                            </Text>

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={{ flex: 1 }}>
                                    <KitchyInput 
                                        label="% Especialista" 
                                        value={form.porcentajeBarbero} 
                                        onChangeText={(t) => setForm({ ...form, porcentajeBarbero: t })}
                                        keyboardType="numeric"
                                        placeholder="50"
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
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
                            
                            <View style={{ backgroundColor: 'rgba(139, 92, 246, 0.05)', padding: 12, borderRadius: 12, marginBottom: 20 }}>
                                <Text style={{ fontSize: 11, color: colors.textSecondary }}>
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
