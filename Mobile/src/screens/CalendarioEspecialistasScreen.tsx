import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useAuth, Negocio } from '../context/AuthContext';
import { getEspecialistas, updateEspecialista, getNegocioActual } from '../services/api';
import Toast from 'react-native-toast-message';

const DIAS = [
    { key: 'lunes', label: 'Lunes', short: 'L' },
    { key: 'martes', label: 'Martes', short: 'M' },
    { key: 'miercoles', label: 'Miércoles', short: 'X' },
    { key: 'jueves', label: 'Jueves', short: 'J' },
    { key: 'viernes', label: 'Viernes', short: 'V' },
    { key: 'sabado', label: 'Sábado', short: 'S' },
    { key: 'domingo', label: 'Domingo', short: 'D' },
];

export default function CalendarioEspecialistasScreen() {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const { user } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [especialistas, setEspecialistas] = useState<any[]>([]);
    const [negocioInfo, setNegocioInfo] = useState<any>(null);
    const [selectedDia, setSelectedDia] = useState('lunes');
    const [isSaving, setIsSaving] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [espRes, negRes] = await Promise.all([
                getEspecialistas(),
                getNegocioActual()
            ]);
            setEspecialistas(espRes.data);
            setNegocioInfo(negRes.data);
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cargar la información' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const businessHours = useMemo(() => {
        if (!negocioInfo?.horarios || !negocioInfo.horarios[selectedDia]) {
            return { inicio: '08:00', fin: '20:00', abierto: true };
        }
        return negocioInfo.horarios[selectedDia];
    }, [negocioInfo, selectedDia]);

    const hoursRange = useMemo(() => {
        const start = parseInt(businessHours.inicio.split(':')[0]);
        const end = parseInt(businessHours.fin.split(':')[0]) + 1;
        const hours = [];
        for (let i = start; i < end; i++) {
            hours.push(`${i.toString().padStart(2, '0')}:00`);
        }
        return hours;
    }, [businessHours]);

    const handleToggleShift = async (espId: string, hora: string) => {
        const esp = especialistas.find(e => e._id === espId);
        if (!esp) return;

        let currentSchedule = esp.horarioSemanal || {};
        let dayShifts = currentSchedule[selectedDia] || [];

        // Check if this hour is already part of a shift
        const hourInt = parseInt(hora.split(':')[0]);
        const existingIndex = dayShifts.findIndex((s: any) => {
            const sStart = parseInt(s.inicio.split(':')[0]);
            const sEnd = parseInt(s.fin.split(':')[0]);
            return hourInt >= sStart && hourInt < sEnd;
        });

        if (existingIndex > -1) {
            // Remove shift
            dayShifts.splice(existingIndex, 1);
        } else {
            // Add shift (1 hour block for now)
            dayShifts.push({
                inicio: hora,
                fin: `${(hourInt + 1).toString().padStart(2, '0')}:00`
            });
        }

        // Optimistic update
        const updatedEsp = { ...esp, horarioSemanal: { ...currentSchedule, [selectedDia]: dayShifts } };
        setEspecialistas(prev => prev.map(e => e._id === espId ? updatedEsp : e));

        try {
            await updateEspecialista(espId, { horarioSemanal: updatedEsp.horarioSemanal });
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar el turno' });
            loadData(); // Revert
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <KitchyToolbar title="Turnos de Equipo" />

            {/* Selector de Día */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {DIAS.map(dia => (
                        <TouchableOpacity
                            key={dia.key}
                            onPress={() => setSelectedDia(dia.key)}
                            style={{
                                width: 50, height: 65, borderRadius: 16,
                                backgroundColor: selectedDia === dia.key ? colors.primary : colors.surface,
                                justifyContent: 'center', alignItems: 'center', marginRight: 8,
                                borderWidth: 1, borderColor: selectedDia === dia.key ? colors.primary : colors.border
                            }}
                        >
                            <Text style={{ fontSize: 10, fontWeight: '900', color: selectedDia === dia.key ? '#fff' : colors.textMuted, textTransform: 'uppercase' }}>{dia.short}</Text>
                            <Text style={{ fontSize: 18, fontWeight: '900', color: selectedDia === dia.key ? '#fff' : colors.textPrimary, marginTop: 4 }}>{DIAS.indexOf(dia) + 1}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {!businessHours.abierto ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                    <Ionicons name="moon-outline" size={60} color={colors.textMuted} />
                    <Text style={{ fontSize: 18, fontWeight: '900', color: colors.textPrimary, marginTop: 16 }}>Local Cerrado</Text>
                    <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>El negocio no tiene horario operativo registrado para los {selectedDia}s.</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{ padding: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                            <View style={{ width: 80 }} />
                            {especialistas.map((esp, idx) => (
                                <View key={esp._id} style={{ flex: 1, alignItems: 'center' }}>
                                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 14, fontWeight: '900', color: colors.primary }}>{esp.nombre.charAt(0)}</Text>
                                    </View>
                                    <Text style={{ fontSize: 10, fontWeight: '800', color: colors.textPrimary, marginTop: 4 }} numberOfLines={1}>{esp.nombre.split(' ')[0]}</Text>
                                </View>
                            ))}
                        </View>

                        {hoursRange.map((hora) => (
                            <View key={hora} style={{ flexDirection: 'row', height: 60, alignItems: 'center' }}>
                                <View style={{ width: 80, justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 13, fontWeight: '900', color: colors.textMuted }}>{hora}</Text>
                                </View>
                                {especialistas.map((esp) => {
                                    const hourInt = parseInt(hora.split(':')[0]);
                                    const isAssigned = esp.horarioSemanal?.[selectedDia]?.some((s: any) => {
                                        const sStart = parseInt(s.inicio.split(':')[0]);
                                        const sEnd = parseInt(s.fin.split(':')[0]);
                                        return hourInt >= sStart && hourInt < sEnd;
                                    });

                                    return (
                                        <TouchableOpacity
                                            key={esp._id}
                                            activeOpacity={0.7}
                                            onPress={() => handleToggleShift(esp._id, hora)}
                                            style={{
                                                flex: 1, height: 50, margin: 2, borderRadius: 12,
                                                backgroundColor: isAssigned ? colors.primary : colors.surface,
                                                borderWidth: 1, borderColor: isAssigned ? colors.primary : colors.border,
                                                justifyContent: 'center', alignItems: 'center'
                                            }}
                                        >
                                            {isAssigned && <Ionicons name="checkmark" size={18} color="#fff" />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}

            <View style={{ padding: 16, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>
                    Toca un bloque para asignar o quitar al especialista de esa hora.
                </Text>
            </View>
        </View>
    );
}
