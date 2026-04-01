import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { KitchyButton } from '../components/KitchyButton';
import { KitchyInput } from '../components/KitchyInput';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { useEspecialistas } from '../hooks/useEspecialistas';
import { createStyles } from '../styles/EspecialistasScreen.styles';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';

export default function EspecialistasScreen() {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const navigation = useNavigation();
    const styles = useMemo(() => createStyles(colors), [colors]);
    
    const {
        especialistas,
        loading,
        showModal,
        setShowModal,
        isEditing,
        form,
        setForm,
        handleAbrirCrear,
        handleAbrirEditar,
        handleGuardar,
        handleEliminar,
        cargar
    } = useEspecialistas();

    const renderRightActions = (id: string, esp: any) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%', paddingRight: 8 }}>
            <TouchableOpacity 
                onPress={() => handleAbrirEditar(esp)}
                activeOpacity={0.7}
                style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    justifyContent: 'center', alignItems: 'center',
                    width: 54, height: 44, // Altura ultra-slim
                    borderRadius: 10,
                    marginRight: 6
                }}
            >
                <Ionicons name="pencil" size={18} color="#3b82f6" />
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={() => handleEliminar(id)}
                activeOpacity={0.7}
                style={{
                    backgroundColor: 'rgba(225, 29, 72, 0.1)',
                    justifyContent: 'center', alignItems: 'center',
                    width: 54, height: 44,
                    borderRadius: 10
                }}
            >
                <Ionicons name="trash" size={18} color="#e11d48" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <KitchyToolbar title="Tu Equipo" onBack={() => navigation.goBack()} />

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={cargar} tintColor={colors.primary} />}
            >
                <Text style={styles.title}>Especialistas</Text>
                <Text style={styles.subtitle}>Gestiona tus barberos/estilistas y sus reglas de comisión individual.</Text>

                {especialistas.map((b, idx) => (
                    <Animated.View 
                        key={b._id} 
                        entering={FadeInDown.delay(idx * 80)}
                        style={{ marginBottom: 8 }}
                    >
                        <Swipeable 
                            renderRightActions={() => renderRightActions(b._id, b)}
                            containerStyle={{ overflow: 'hidden', borderRadius: 16 }}
                        >
                            <RectButton 
                                style={[styles.card, { marginBottom: 0, backgroundColor: colors.surface }]}
                                onPress={() => handleAbrirEditar(b)}
                                underlayColor={colors.border + '50'}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', padding: 8 }}>
                                    <View style={[styles.avatarPlaceholder, { width: 32, height: 32, borderRadius: 8 }]}>
                                        <Ionicons name="cut" size={18} color={colors.primary} />
                                    </View>
                                    <View style={styles.infoContainer}>
                                        <Text style={[styles.name, { fontSize: 12 }]}>{b.nombre}</Text>
                                        <View style={styles.badgeRow}>
                                            <View style={[
                                                styles.badge, 
                                                { backgroundColor: b.tipoComision === 'fijo' ? '#8b5cf615' : colors.primary + '15', paddingVertical: 1, paddingHorizontal: 6 }
                                            ]}>
                                                <Text style={[
                                                    styles.badgeText,
                                                    { color: b.tipoComision === 'fijo' ? '#8b5cf6' : colors.primary, fontSize: 8 }
                                                ]}>
                                                    {b.tipoComision === 'fijo' ? `FIJA ${b.comision}%` : b.tipoComision === 'escalonado' ? 'VARIABLE' : 'HEREDA LOG LOCAL'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-back" size={14} color={colors.textMuted} style={{ opacity: 0.5 }} />
                                </View>
                            </RectButton>
                        </Swipeable>
                    </Animated.View>
                ))}

                <TouchableOpacity 
                    style={styles.addBtn}
                    onPress={handleAbrirCrear}
                >
                    <Ionicons name="add-circle-outline" size={24} color={colors.primary} style={{ marginRight: 8 }} />
                    <Text style={styles.addBtnText}>Nuevo Especialista</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={showModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        <View style={styles.modalContent}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <Text style={styles.modalTitle}>{isEditing ? 'Editar' : 'Nuevo'} Especialista</Text>
                                <TouchableOpacity onPress={() => setShowModal(false)}>
                                    <Ionicons name="close-circle" size={32} color={colors.textMuted} />
                                </TouchableOpacity>
                            </View>

                            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 8 }}>Nombre del Especialista</Text>
                            <KitchyInput 
                                placeholder="Nombre completo"
                                value={form.nombre}
                                onChangeText={(t) => setForm({ ...form, nombre: t })}
                            />

                            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 12, marginTop: 10 }}>Regla de Comisión</Text>
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                                {[
                                    { id: null, label: 'Heredar', icon: 'business-outline' },
                                    { id: 'fijo', label: 'Fija', icon: 'lock-closed-outline' },
                                    { id: 'escalonado', label: 'Variable', icon: 'trending-up-outline' }
                                ].map((opt) => {
                                    const isActive = form.tipoComision === opt.id;
                                    return (
                                        <TouchableOpacity 
                                            key={String(opt.id)}
                                            onPress={() => setForm({ ...form, tipoComision: opt.id as any })}
                                            style={{
                                                flex: 1, paddingVertical: 10, borderRadius: 12,
                                                backgroundColor: isActive ? colors.primary + '15' : colors.surface,
                                                borderWidth: 1.5, borderColor: isActive ? colors.primary : colors.border,
                                                alignItems: 'center', gap: 4
                                            }}
                                        >
                                            <Ionicons name={opt.icon as any} size={18} color={isActive ? colors.primary : colors.textMuted} />
                                            <Text style={{ fontSize: 11, fontWeight: '900', color: isActive ? colors.primary : colors.textSecondary }}>{opt.label}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {form.tipoComision === 'fijo' && (
                                <Animated.View entering={FadeInDown} style={{ marginBottom: 20 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMuted, marginBottom: 4 }}>PORCENTAJE (%)</Text>
                                            <TextInput 
                                                value={form.comision}
                                                onChangeText={(t) => setForm({ ...form, comision: t })}
                                                keyboardType="numeric"
                                                style={{ fontSize: 24, fontWeight: '900', color: colors.primary }}
                                            />
                                        </View>
                                        <Text style={{ fontSize: 24, fontWeight: '900', color: colors.textMuted }}>%</Text>
                                    </View>
                                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 8, fontStyle: 'italic' }}>Este especialista recibirá siempre este % sin importar el volumen.</Text>
                                </Animated.View>
                            )}

                            {form.tipoComision === null && (
                                <View style={{ padding: 12, backgroundColor: colors.primary + '08', borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: colors.primary + '20' }}>
                                    <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>
                                        ℹ️ Usará la regla global que tengas configurada en "Ajustes del Negocio".
                                    </Text>
                                </View>
                            )}
                            
                            <View style={{ marginTop: 10 }}>
                                <KitchyButton 
                                    title={isEditing ? "Actualizar Especialista" : "Guardar Especialista"} 
                                    onPress={handleGuardar} 
                                    loading={loading} 
                                />
                                <TouchableOpacity onPress={() => setShowModal(false)} style={styles.cancelBtn}>
                                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}
