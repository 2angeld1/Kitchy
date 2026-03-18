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
import { createStyles } from '../styles/BellezaReventaScreen.styles';
import { getBeautyIcon, formatMoney } from '../utils/beauty-helpers';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

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

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 380 }}>
                {/* 1. SELECCIONAR PRODUCTOS - GRID 2x2 */}
                <View style={{ padding: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: 15 }}>Catálogo de Productos</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                        {productosVenta.length === 0 ? (
                            <View style={{ flex: 1, padding: 40, alignItems: 'center' }}>
                                <Ionicons name="sparkles-outline" size={48} color={colors.border} />
                                <Text style={{ color: colors.textMuted, marginTop: 10, textAlign: 'center' }}>No hay productos de reventa configurados en el inventario.</Text>
                            </View>
                        ) : (
                            productosVenta.map((prod, idx) => {
                                const isSelected = serviciosSeleccionados.some(s => s._id === prod._id);
                                return (
                                    <Animated.View key={prod._id} entering={FadeInDown.delay(idx * 50)} style={{ width: CARD_WIDTH }}>
                                        <TouchableOpacity
                                            onPress={() => toggleServicio(prod)}
                                            style={{
                                                backgroundColor: isSelected ? `rgba(16, 185, 129, 0.1)` : colors.card,
                                                borderRadius: 24,
                                                padding: 16,
                                                borderWidth: 2,
                                                borderColor: isSelected ? '#10b981' : colors.border,
                                                height: 140,
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <View style={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 12,
                                                    backgroundColor: isSelected ? '#10b981' : colors.surface,
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}>
                                                    <Ionicons name={getBeautyIcon(prod.nombre)} size={20} color={isSelected ? '#fff' : '#10b981'} />
                                                </View>
                                                {isSelected && <Ionicons name="checkmark-circle" size={24} color="#10b981" />}
                                            </View>
                                            <View>
                                                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }} numberOfLines={1}>{prod.nombre}</Text>
                                                <Text style={{ fontSize: 18, fontWeight: '900', color: '#10b981', marginTop: 2 }}>{formatMoney(prod.precio)}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </Animated.View>
                                );
                            })
                        )}
                    </View>
                </View>

                {/* 2. ¿QUIEN VENDIÓ? (BARBERO) - HORIZONTAL SCROLL */}
                <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 12 }}>Atendido por:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                        {especialistas.map((esp) => {
                            const isSelected = especialistaSeleccionado === esp._id;
                            return (
                                <TouchableOpacity
                                    key={esp._id}
                                    style={{
                                        paddingHorizontal: 20,
                                        paddingVertical: 10,
                                        borderRadius: 15,
                                        backgroundColor: isSelected ? colors.primary : colors.card,
                                        borderWidth: 1.5,
                                        borderColor: isSelected ? colors.primary : colors.border,
                                        alignItems: 'center',
                                        flexDirection: 'row',
                                        gap: 8
                                    }}
                                    onPress={() => setEspecialistaSeleccionado(esp._id)}
                                >
                                    <Ionicons name="person" size={14} color={isSelected ? '#fff' : colors.primary} />
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: isSelected ? '#fff' : colors.textPrimary }}>{esp.nombre.split(' ')[0]}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* 3. NOMBRE DEL CLIENTE */}
                <View style={{ padding: 20 }}>
                    <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border }}>
                        <TextInput
                            style={{
                                backgroundColor: colors.surface,
                                borderRadius: 12,
                                padding: 12,
                                color: colors.textPrimary,
                                fontSize: 15,
                                fontWeight: '600'
                            }}
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
