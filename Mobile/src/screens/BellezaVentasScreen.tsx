import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInDown, ZoomIn, useSharedValue, useAnimatedStyle, withSpring, withSequence, withDelay } from 'react-native-reanimated';
import { useBellezaVentas } from '../hooks/useBellezaVentas';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useAuth, Negocio } from '../context/AuthContext';
import { createStyles } from '../styles/BellezaVentasScreen.styles';
import { getBeautyIcon, formatMoney } from '../utils/beauty-helpers';

export default function BellezaVentasScreen() {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const colors = isDark ? darkTheme : lightTheme;
    const styles = useMemo(() => createStyles(colors), [colors]);

    const negocio = user?.negocioActivo as Negocio;
    const BILLETES = negocio?.config?.denominaciones || [1, 5, 10, 20, 50, 100];

    const {
        servicios,
        especialistas,
        serviciosSeleccionados,
        especialistaSeleccionado,
        metodoPago,
        loading,
        clienteNombre, setClienteNombre,
        montoRecibido, setMontoRecibido,
        lastVentaId, anularUltimaVenta,
        toggleServicio,
        setEspecialistaSeleccionado,
        setMetodoPago,
        procesarCobro,
        total,
        cambio,
        onRefresh
    } = useBellezaVentas();

    useFocusEffect(
        useCallback(() => {
            onRefresh();
        }, [onRefresh])
    );

    const [showSuccess, setShowSuccess] = useState(false);
    const successScale = useSharedValue(0);

    const handleCobrar = async () => {
        await procesarCobro(() => {
            setShowSuccess(true);
            successScale.value = withSequence(
                withSpring(1),
                withDelay(1500, withSpring(0))
            );
            setTimeout(() => setShowSuccess(false), 2000);
        });
    };

    const successStyle = useAnimatedStyle(() => ({
        transform: [{ scale: successScale.value }],
        opacity: successScale.value
    }));

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <KitchyToolbar
                title="POS Belleza"
                extraButtons={
                    lastVentaId && (
                        <TouchableOpacity
                            onPress={anularUltimaVenta}
                            style={styles.undoBtn}
                        >
                            <Ionicons name="trash-outline" size={16} color="#ef4444" />
                            <Text style={styles.undoText}>ANULAR</Text>
                        </TouchableOpacity>
                    )
                }
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* 1. SELECCIONAR SERVICIO - MULTISELECT */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Servicios (Selección Múltiple)</Text>
                    <View style={styles.grid}>
                        {servicios.map((ser, idx) => {
                            const isSelected = serviciosSeleccionados.some(s => s._id === ser._id);
                            return (
                                <Animated.View key={ser._id} entering={FadeInDown.delay(idx * 50)}>
                                    <TouchableOpacity
                                        onPress={() => toggleServicio(ser)}
                                        style={[
                                            styles.serviceCard,
                                            { backgroundColor: isSelected ? `${colors.primary}10` : colors.card, borderColor: isSelected ? colors.primary : colors.border }
                                        ]}
                                    >
                                        <View style={styles.cardHeader}>
                                            <View style={[styles.iconContainer, { backgroundColor: isSelected ? colors.primary : colors.surface }]}>
                                                <Ionicons name={getBeautyIcon(ser.nombre)} size={18} color={isSelected ? '#fff' : colors.primary} />
                                            </View>
                                            {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                                        </View>
                                        <View style={styles.serviceInfo}>
                                            <Text style={[styles.serviceName, { color: colors.textPrimary }]} numberOfLines={1}>{ser.nombre}</Text>
                                            <Text style={[styles.servicePrice, { color: colors.primary }]}>{formatMoney(ser.precio)}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>
                </View>

                {/* 2. ¿QUIEN ATENDIO? (BARBERO) - HORIZONTAL SCROLL */}
                <View style={styles.especialistaSection}>
                    <Text style={styles.especialistaTitle}>¿Quién atendió?</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.especialistaScroll}>
                        {especialistas.map((esp) => {
                            const isSelected = especialistaSeleccionado === esp._id;
                            return (
                                <TouchableOpacity
                                    key={esp._id}
                                    style={[
                                        styles.especialistaChip,
                                        { backgroundColor: isSelected ? colors.primary : colors.card, borderColor: isSelected ? colors.primary : colors.border }
                                    ]}
                                    onPress={() => setEspecialistaSeleccionado(esp._id)}
                                >
                                    <View style={{ position: 'relative' }}>
                                        <Ionicons name="person" size={14} color={isSelected ? '#fff' : colors.primary} />
                                        {(esp.conteoDia || 0) > 0 && (
                                            <View style={{
                                                position: 'absolute',
                                                top: -12,
                                                right: -12,
                                                backgroundColor: isSelected ? '#fff' : colors.primary,
                                                borderRadius: 10,
                                                paddingHorizontal: 4,
                                                minWidth: 18,
                                                height: 18,
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}>
                                                <Text style={{ fontSize: 9, fontWeight: '900', color: isSelected ? colors.primary : '#fff' }}>{esp.conteoDia}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={[styles.especialistaText, { color: isSelected ? '#fff' : colors.textPrimary }]}>{esp.nombre.split(' ')[0]}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* 3. NOMBRE DEL CLIENTE */}
                <View style={styles.clienteSection}>
                    <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <TextInput
                            style={[styles.textInput, { backgroundColor: colors.surface, color: colors.textPrimary }]}
                            placeholder="Nombre del Cliente (Opcional)"
                            placeholderTextColor={colors.textMuted}
                            value={clienteNombre}
                            onChangeText={setClienteNombre}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* TICKET FLOTANTE */}
            {serviciosSeleccionados.length > 0 && especialistaSeleccionado && (
                <Animated.View
                    entering={SlideInDown.duration(400)}
                    style={[styles.ticketContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <View style={styles.paymentMethods}>
                        {['efectivo', 'yappy', 'tarjeta'].map((m) => {
                            const isSelected = metodoPago === m;
                            return (
                                <TouchableOpacity
                                    key={m}
                                    onPress={() => setMetodoPago(m as any)}
                                    style={[
                                        styles.paymentBtn,
                                        { borderColor: isSelected ? colors.primary : colors.border, backgroundColor: isSelected ? `${colors.primary}10` : colors.surface }
                                    ]}
                                >
                                    <Text style={[styles.paymentText, { color: isSelected ? colors.primary : colors.textMuted }]}>{m}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {metodoPago === 'efectivo' && (
                        <Animated.View entering={FadeInDown} style={styles.billetesContainer}>
                            {BILLETES.map(b => (
                                <TouchableOpacity
                                    key={b}
                                    onPress={() => setMontoRecibido(b.toString())}
                                    style={[
                                        styles.billeteBtn,
                                        { backgroundColor: montoRecibido === b.toString() ? colors.primary : colors.surface, borderColor: colors.border }
                                    ]}
                                >
                                    <Text style={[styles.billeteText, { color: montoRecibido === b.toString() ? '#fff' : colors.textPrimary }]}>${b}</Text>
                                </TouchableOpacity>
                            ))}
                        </Animated.View>
                    )}

                    <View style={styles.totalRow}>
                        <View>
                            <Text style={[styles.totalLabel, { color: colors.textMuted }]}>{serviciosSeleccionados.length} servicios</Text>
                            <Text style={[styles.totalValue, { color: colors.textPrimary }]}>{formatMoney(total)}</Text>
                        </View>
                        {cambio > 0 && <Text style={styles.cambioText}>CAMBIO: {formatMoney(cambio)}</Text>}
                    </View>

                    <TouchableOpacity
                        style={[styles.cobrarBtn, { backgroundColor: colors.primary }]}
                        onPress={handleCobrar}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : (
                            <Text style={styles.cobrarText}>COBRAR SERVICIOS</Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            )}

            {showSuccess && (
                <View style={styles.successOverlay}>
                    <Animated.View style={[styles.successCircle, successStyle]}>
                        <Ionicons name="checkmark" size={60} color="#fff" />
                    </Animated.View>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}
