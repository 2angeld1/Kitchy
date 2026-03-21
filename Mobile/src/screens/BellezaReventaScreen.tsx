import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
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


export default function BellezaReventaScreen() {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const colors = isDark ? darkTheme : lightTheme;
    const styles = useMemo(() => createStyles(colors), [colors]);

    const negocio = user?.negocioActivo as Negocio;
    const BILLETES = negocio?.config?.denominaciones || [1, 5, 10, 20, 50, 100];

    const {
        productosVenta,
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
            style={{ flex: 1, backgroundColor: colors.background }}
        >
            <KitchyToolbar
                title="Ventas de Productos"
                extraButtons={
                    lastVentaId && (
                        <TouchableOpacity
                            onPress={anularUltimaVenta}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 12,
                                gap: 6
                            }}
                        >
                            <Ionicons name="trash-outline" size={16} color="#ef4444" />
                            <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 12 }}>ANULAR</Text>
                        </TouchableOpacity>
                    )
                }
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* 1. ¿QUIEN VENDIÓ? - TOP PRIORITY GRID */}
                <View style={styles.especialistaSection}>
                    <Text style={styles.especialistaTitle}>¿Quién realizó la venta?</Text>
                    <View style={styles.especialistaGrid}>
                        {especialistas.map((esp, idx) => {
                            const isSelected = especialistaSeleccionado === esp._id;
                            return (
                                <Animated.View key={esp._id} entering={FadeInDown.delay(idx * 50)}>
                                    <TouchableOpacity
                                        style={[
                                            styles.especialistaCard,
                                            { backgroundColor: isSelected ? `${colors.primary}10` : colors.card, borderColor: isSelected ? colors.primary : colors.border }
                                        ]}
                                        onPress={() => setEspecialistaSeleccionado(esp._id)}
                                    >
                                        {(esp.conteoDia || 0) > 0 && (
                                            <View style={styles.badgeContainer}>
                                                <Text style={styles.badgeText}>{esp.conteoDia}</Text>
                                            </View>
                                        )}
                                        <Ionicons name="person" size={24} color={isSelected ? colors.primary : colors.textMuted} />
                                        <View>
                                            <Text style={[styles.especialistaText, { color: colors.textPrimary }]}>{esp.nombre.split(' ')[0]}</Text>
                                            <Text style={[styles.especialistaRole, { color: colors.textMuted }]}>{esp.rol}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>
                </View>

                {/* 2. SELECCIONAR PRODUCTOS - 3x3 GRID */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Catálogo de Productos</Text>
                    <View style={styles.grid}>
                        {productosVenta.length === 0 ? (
                            <View style={{ flex: 1, padding: 40, alignItems: 'center' }}>
                                <Ionicons name="sparkles-outline" size={48} color={colors.border} />
                                <Text style={{ color: colors.textMuted, marginTop: 10, textAlign: 'center' }}>No hay productos de reventa configurados.</Text>
                            </View>
                        ) : (
                            productosVenta.map((prod, idx) => {
                                const isSelected = serviciosSeleccionados.some(s => s._id === prod._id);
                                return (
                                    <Animated.View key={prod._id} entering={FadeInDown.delay(idx * 50)}>
                                        <TouchableOpacity
                                            onPress={() => toggleServicio(prod)}
                                            style={[
                                                styles.serviceCard,
                                                { 
                                                    backgroundColor: isSelected ? `rgba(16, 185, 129, 0.15)` : colors.card, 
                                                    borderColor: isSelected ? '#10b981' : colors.border
                                                }
                                            ]}
                                        >
                                            <View style={styles.cardHeader}>
                                                <View style={[styles.iconContainer, { backgroundColor: isSelected ? '#10b981' : 'rgba(16, 185, 129, 0.08)' }]}>
                                                    <Ionicons name={getBeautyIcon(prod.nombre)} size={22} color={isSelected ? '#fff' : '#10b981'} />
                                                </View>
                                                {isSelected && <Ionicons name="checkmark-circle" size={24} color="#10b981" />}
                                            </View>
                                            <View style={styles.serviceInfo}>
                                                <Text style={styles.serviceName} numberOfLines={1}>{prod.nombre}</Text>
                                                <Text style={[styles.servicePrice, { color: '#10b981' }]}>{formatMoney(prod.precio)}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </Animated.View>
                                );
                            })
                        )}
                    </View>
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
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: colors.card,
                        padding: 20,
                        borderTopLeftRadius: 32,
                        borderTopRightRadius: 32,
                        borderWidth: 1,
                        borderColor: colors.border,
                        shadowColor: '#000',
                        shadowOpacity: 0.1,
                        shadowRadius: 20,
                        elevation: 25
                    }}
                >
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 15 }}>
                        {['efectivo', 'yappy', 'tarjeta'].map((m) => {
                            const isSelected = metodoPago === m;
                            return (
                                <TouchableOpacity
                                    key={m}
                                    onPress={() => setMetodoPago(m as any)}
                                    style={{
                                        flex: 1,
                                        height: 40,
                                        borderRadius: 12,
                                        borderWidth: 1.5,
                                        borderColor: isSelected ? colors.primary : colors.border,
                                        backgroundColor: isSelected ? `${colors.primary}10` : colors.surface,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Text style={{ color: isSelected ? colors.primary : colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>{m}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {metodoPago === 'efectivo' && (
                        <Animated.View entering={FadeInDown} style={{ marginBottom: 15 }}>
                            <View style={{ flexDirection: 'row', gap: 6 }}>
                                {BILLETES.map(b => (
                                    <TouchableOpacity
                                        key={b}
                                        onPress={() => setMontoRecibido(b.toString())}
                                        style={{
                                            flex: 1,
                                            backgroundColor: montoRecibido === b.toString() ? colors.primary : colors.surface,
                                            paddingVertical: 8,
                                            borderRadius: 8,
                                            alignItems: 'center',
                                            borderWidth: 1,
                                            borderColor: colors.border
                                        }}
                                    >
                                        <Text style={{ color: montoRecibido === b.toString() ? '#fff' : colors.textPrimary, fontWeight: 'bold' }}>${b}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Animated.View>
                    )}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 15 }}>
                        <View>
                            <Text style={{ fontSize: 11, color: colors.textMuted }}>{serviciosSeleccionados.length} productos</Text>
                            <Text style={{ fontSize: 32, fontWeight: '900', color: colors.textPrimary }}>{formatMoney(total)}</Text>
                        </View>
                        {cambio > 0 && <Text style={{ fontSize: 14, color: '#10b981', fontWeight: '900', marginBottom: 5 }}>CAMBIO: {formatMoney(cambio)}</Text>}
                    </View>

                    <TouchableOpacity
                        style={{
                            backgroundColor: colors.primary,
                            height: 60,
                            borderRadius: 18,
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'row'
                        }}
                        onPress={handleCobrar}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : (
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>COBRAR PRODUCTOS</Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            )}

            {showSuccess && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 100, pointerEvents: 'none' }}>
                    <Animated.View style={[
                        { backgroundColor: '#10b981', width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
                        successStyle
                    ]}>
                        <Ionicons name="checkmark" size={60} color="#fff" />
                    </Animated.View>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}
