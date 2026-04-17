import React from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { KitchyInput } from '../../../components/KitchyInput';
import { KitchyButton } from '../../../components/KitchyButton';

interface Props {
    form: any;
    setForm: (f: any) => void;
    handleSaveConfig: () => void;
    isSaving: boolean;
    colors: any;
    styles: any;
}

export const ComisionAjustesTab: React.FC<Props> = ({
    form, setForm, handleSaveConfig, isSaving, colors, styles
}) => {
    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.settingsSection}
        >
            <Animated.View entering={FadeInDown}>
                <Text style={styles.settingsTitle}>Ajustes del Negocio</Text>
                <Text style={styles.settingsDesc}>
                    Elige cómo se calculan las comisiones de tus especialistas.
                </Text>

                {/* TOGGLE FIJA vs VARIABLE */}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
                    {[
                        { key: 'fijo', label: 'Comisión Fija', icon: 'lock-closed', desc: 'Mismo % siempre' },
                        { key: 'escalonado', label: 'Variable', icon: 'trending-up', desc: 'Sube por volumen' },
                    ].map((opt) => {
                        const isActive = form.tipo === opt.key;
                        return (
                            <TouchableOpacity
                                key={opt.key}
                                onPress={() => setForm({ ...form, tipo: opt.key })}
                                activeOpacity={0.7}
                                style={{
                                    flex: 1,
                                    paddingVertical: 16,
                                    paddingHorizontal: 14,
                                    borderRadius: 16,
                                    backgroundColor: isActive ? colors.primary + '12' : colors.surface,
                                    borderWidth: 2,
                                    borderColor: isActive ? colors.primary : colors.border,
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                <View style={{
                                    width: 40, height: 40, borderRadius: 14,
                                    backgroundColor: isActive ? colors.primary : colors.border + '50',
                                    justifyContent: 'center', alignItems: 'center',
                                }}>
                                    <Ionicons name={opt.icon as any} size={20} color={isActive ? '#fff' : colors.textMuted} />
                                </View>
                                <Text style={{
                                    fontSize: 13, fontWeight: '900',
                                    color: isActive ? colors.primary : colors.textPrimary,
                                }}>
                                    {opt.label}
                                </Text>
                                <Text style={{
                                    fontSize: 10, color: colors.textMuted, fontWeight: '600',
                                }}>
                                    {opt.desc}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* FORMULARIO SEGÚN TIPO */}
                {form.tipo === 'fijo' ? (
                    <View>
                        <Text style={[styles.sectionTitle, { fontSize: 14, marginBottom: 12 }]}>
                            Porcentaje Fijo para Especialistas
                        </Text>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 12,
                            backgroundColor: colors.surface,
                            borderRadius: 16,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: colors.border,
                            marginBottom: 16,
                        }}>
                            <View style={{ flex: 1, alignItems: 'center' }}>
                                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMuted, marginBottom: 10, textTransform: 'uppercase' }}>
                                    Especialista recibe
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <KitchyInput
                                        value={form.porcentajeBarbero}
                                        onChangeText={(t) => {
                                            const p = parseInt(t) || 0;
                                            setForm({ ...form, porcentajeBarbero: t, porcentajeDueno: (100 - p).toString() });
                                        }}
                                        keyboardType="numeric"
                                        placeholder="50"
                                        style={{ 
                                            height: 54, 
                                            width: 80, 
                                            marginBottom: 0, 
                                            textAlign: 'center', 
                                            fontSize: 28, 
                                            fontWeight: '900',
                                            color: colors.primary
                                        }}
                                        containerStyle={{ marginBottom: 0 }}
                                    />
                                    <Text style={{ fontSize: 24, fontWeight: '900', color: colors.textMuted }}>%</Text>
                                </View>
                            </View>
                            <View style={{ width: 1, height: 60, backgroundColor: colors.border }} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMuted, marginBottom: 6, textTransform: 'uppercase' }}>
                                    Local recibe
                                </Text>
                                <Text style={{ fontSize: 36, fontWeight: '900', color: '#10b981', textAlign: 'center' }}>
                                    {form.porcentajeDueno}%
                                </Text>
                            </View>
                        </View>
                        <View style={styles.infoBento}>
                            <Text style={styles.infoText}>
                                ℹ️ Con comisión fija, todos los especialistas recibirán el mismo porcentaje sin importar la cantidad de servicios que realicen. Puedes personalizar el % individualmente desde la pantalla de "Tu Equipo".
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View>
                        <Text style={[styles.sectionTitle, { fontSize: 14, marginBottom: 12 }]}>
                            Tramos de Comisión por Volumen
                        </Text>
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
                                            const newEsc = [...form.escalonado];
                                            newEsc[index] = { ...tier, porcentajeBarbero: parseInt(t) || 0 };
                                            setForm({ ...form, escalonado: newEsc });
                                        }}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <TouchableOpacity 
                                    style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }} 
                                    onPress={() => {
                                        const newEsc = form.escalonado.filter((_: any, i: number) => i !== index);
                                        setForm({ ...form, escalonado: newEsc });
                                    }}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        <TouchableOpacity 
                            style={{ 
                                backgroundColor: colors.surface, 
                                paddingVertical: 12, borderRadius: 12, 
                                borderStyle: 'dashed', borderWidth: 1.5, borderColor: colors.border,
                                alignItems: 'center', marginTop: 8
                            }}
                            onPress={() => setForm({ 
                                ...form, 
                                escalonado: [...form.escalonado, { desde: 0, hasta: 0, porcentajeBarbero: 50, porcentajeDueno: 50 }] 
                            })}
                        >
                            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary }}>+ Añadir Tramo</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* TAREAS DE MANTENIMIENTO */}
                <View style={{ marginTop: 32 }}>
                    <Text style={[styles.sectionTitle, { fontSize: 16, marginBottom: 4 }]}>Tareas Extra (Deberes)</Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16 }}>
                        Define tareas que los especialistas pueden hacer para ganar un % extra de comisión. (Ej: Barrer, Limpiar sillas).
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 16 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>Bono por tarea</Text>
                            <Text style={{ fontSize: 12, color: colors.textMuted }}>% que se suma a su comisión al completar una tarea.</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <KitchyInput
                                value={form.bonoPorTarea?.toString() || '0'}
                                onChangeText={(t) => setForm({ ...form, bonoPorTarea: t.replace(/[^0-9]/g, '') })}
                                keyboardType="numeric"
                                style={{ width: 60, height: 44, textAlign: 'center', fontSize: 18, fontWeight: '900', color: '#10b981', marginBottom: 0 }}
                                containerStyle={{ marginBottom: 0 }}
                            />
                            <Text style={{ fontSize: 18, fontWeight: '900', color: colors.textMuted, marginLeft: 4 }}>%</Text>
                        </View>
                    </View>

                    {form.tareas && form.tareas.map((tarea: any, index: number) => (
                        <View key={index} style={{ flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                            <View style={{ flex: 1.5 }}>
                                <KitchyInput
                                    placeholder="Nombre de la tarea (Ej: Barrer)"
                                    value={tarea.nombre}
                                    onChangeText={(t) => {
                                        const nt = [...form.tareas];
                                        nt[index].nombre = t;
                                        setForm({ ...form, tareas: nt });
                                    }}
                                    style={{ height: 48, marginBottom: 0 }}
                                    containerStyle={{ marginBottom: 0 }}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                {/* Selector Básico de Turno */}
                                <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
                                    {['mañana', 'tarde', 'ambos'].map(t => (
                                        <TouchableOpacity 
                                            key={t}
                                            style={{ flex: 1, height: 46, justifyContent: 'center', alignItems: 'center', backgroundColor: tarea.turno === t ? colors.primary : 'transparent' }}
                                            onPress={() => {
                                                const nt = [...form.tareas];
                                                nt[index].turno = t;
                                                setForm({ ...form, tareas: nt });
                                            }}
                                        >
                                            <Text style={{ fontSize: 10, fontWeight: '800', color: tarea.turno === t ? '#fff' : colors.textMuted, textTransform: 'uppercase' }}>
                                                {t === 'ambos' ? 'Todos' : t.substring(0, 3)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            <TouchableOpacity 
                                style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}
                                onPress={() => {
                                    const nt = form.tareas.filter((_: any, i: number) => i !== index);
                                    setForm({ ...form, tareas: nt });
                                }}
                            >
                                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ))}

                    <TouchableOpacity 
                        style={{ backgroundColor: colors.surface, paddingVertical: 12, borderRadius: 12, borderStyle: 'dashed', borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', marginTop: 8 }}
                        onPress={() => setForm({ 
                            ...form, 
                            tareas: [...(form.tareas || []), { id: Date.now().toString(), nombre: '', turno: 'ambos' }] 
                        })}
                    >
                        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary }}>+ Añadir Tarea de Mantenimiento</Text>
                    </TouchableOpacity>
                </View>

                <KitchyButton
                    title="Guardar Configuración"
                    onPress={handleSaveConfig}
                    loading={isSaving}
                    style={{ marginTop: 20 }}
                />
            </Animated.View>
        </KeyboardAvoidingView>
    );
};
