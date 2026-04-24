import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme, darkTheme } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useCalendarioEspecialistas, DIAS } from '../hooks/useCalendarioEspecialistas';

export default function CalendarioEspecialistasScreen() {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    const { loading, especialistas, negocioInfo, selectedDia, setSelectedDia, isSaving, selectedEspForTemplate, setSelectedEspForTemplate, showTemplateModal, setShowTemplateModal, businessHours, hoursRange, handleToggleShift, handleApplyTemplate, handleClearDay, handleCopyYesterday } = useCalendarioEspecialistas();

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

            {/* Acciones Globales */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.surface }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textSecondary }}>
                    Cambios en {selectedDia.endsWith('s') ? selectedDia : selectedDia + 's'}
                </Text>
                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '15', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 }}
                    onPress={handleCopyYesterday}
                    disabled={isSaving}
                >
                    <Ionicons name="copy-outline" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 12, fontWeight: '900', color: colors.primary }}>Copiar de ayer</Text>
                    {isSaving && <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 6 }} />}
                </TouchableOpacity>
            </View>

            {!businessHours.abierto ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                    <Ionicons name="moon-outline" size={60} color={colors.textMuted} />
                    <Text style={{ fontSize: 18, fontWeight: '900', color: colors.textPrimary, marginTop: 16 }}>Local Cerrado</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{ padding: 16 }}>
                        {/* Cabecera Especialistas */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                            <View style={{ width: 80 }} />
                            {especialistas.map((esp) => (
                                <TouchableOpacity
                                    key={esp._id}
                                    style={{ flex: 1, alignItems: 'center' }}
                                    onPress={() => {
                                        setSelectedEspForTemplate(esp);
                                        setShowTemplateModal(true);
                                    }}
                                >
                                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.primary + '40' }}>
                                        <Text style={{ fontSize: 14, fontWeight: '900', color: colors.primary }}>{esp.nombre.charAt(0)}</Text>
                                    </View>
                                    <Text style={{ fontSize: 10, fontWeight: '800', color: colors.textPrimary, marginTop: 4 }} numberOfLines={1}>{esp.nombre.split(' ')[0]}</Text>
                                    <Ionicons name="chevron-down" size={10} color={colors.primary} />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Cuadrícula de Turnos */}
                        {hoursRange.map((hora) => {
                            const nextHora = `${(parseInt(hora.split(':')[0]) + 1).toString().padStart(2, '0')}:00`;
                            return (
                                <View key={hora} style={{ flexDirection: 'row', height: 65, alignItems: 'center' }}>
                                    <View style={{ width: 80, justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 13, fontWeight: '900', color: colors.textPrimary }}>{hora}</Text>
                                        <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textMuted }}>a {nextHora}</Text>
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
                                                    flex: 1, height: 55, margin: 2, borderRadius: 12,
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
                            );
                        })}
                    </View>
                </ScrollView>
            )}

            <View style={{ padding: 16, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>
                    Toca un nombre para aplicar plantillas rápidas o una celda para ajuste fino.
                </Text>
            </View>

            {/* Modal de Plantillas */}
            <Modal visible={showTemplateModal} transparent animationType="fade">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 18, fontWeight: '900', color: colors.textPrimary }}>Acciones para {selectedEspForTemplate?.nombre.split(' ')[0]}</Text>
                            <TouchableOpacity onPress={() => setShowTemplateModal(false)}><Ionicons name="close" size={24} color={colors.textPrimary} /></TouchableOpacity>
                        </View>
                        <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 15, fontWeight: '700', textTransform: 'uppercase' }}>Plantillas de Turno</Text>
                        <View style={{ gap: 10, marginBottom: 20 }}>
                            {(negocioInfo?.shiftPresets || [
                                { nombre: 'Jornada Completa', inicio: '08:00', fin: '18:00', color: '#10b981' },
                                { nombre: 'Mañana', inicio: '08:00', fin: '14:00', color: '#3b82f6' },
                                { nombre: 'Tarde', inicio: '14:00', fin: '20:00', color: '#f59e0b' }
                            ]).map((preset: any) => (
                                <TouchableOpacity
                                    key={preset.nombre}
                                    style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.surface, borderRadius: 15, borderLeftWidth: 5, borderLeftColor: preset.color }}
                                    onPress={() => handleApplyTemplate(preset)}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontWeight: '800', color: colors.textPrimary }}>{preset.nombre}</Text>
                                        <Text style={{ fontSize: 12, color: colors.textMuted }}>{preset.inicio} - {preset.fin}</Text>
                                    </View>
                                    <Ionicons name="flash" size={20} color={preset.color} />
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.surface, borderRadius: 15 }} onPress={handleClearDay}>
                                <Ionicons name="trash-outline" size={20} color="#f87171" style={{ marginRight: 12 }} />
                                <Text style={{ fontWeight: '700', color: '#f87171' }}>Limpiar Todo el Día</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
