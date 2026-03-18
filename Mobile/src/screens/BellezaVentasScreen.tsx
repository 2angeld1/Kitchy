import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInDown, ZoomIn, useSharedValue, useAnimatedStyle, withSpring, withSequence, withDelay, withTiming } from 'react-native-reanimated';
import { useBellezaVentas } from '../hooks/useBellezaVentas';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';
import { KitchyToolbar } from '../components/KitchyToolbar';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 3;

export default function BellezaVentasScreen() {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
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
        onRefresh
    } = useBellezaVentas();

    useFocusEffect(
        React.useCallback(() => {
            onRefresh();
        }, [])
    );

    const [showSuccess, setShowSuccess] = useState(false);
    const successScale = useSharedValue(0);

    const handleCobrar = async () => {
        const res = await procesarCobro();
        // El hook procesa y muestra toast. Nosotros disparamos el éxito visual.
        setShowSuccess(true);
        successScale.value = withSequence(
            withSpring(1),
            withDelay(1500, withSpring(0, {}, () => {
                // No podemos setear estado desde aquí directamente sin precaución,
                // pero Reanimated 2+ lo maneja mejor.
            }))
        );
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const successStyle = useAnimatedStyle(() => ({
        transform: [{ scale: successScale.value }],
        opacity: successScale.value
    }));

    const getServiceIcon = (nombre: string) => {
        const n = nombre.toLowerCase();
        if (n.includes('corte')) return 'cut';
        if (n.includes('barba')) return 'brush';
        if (n.includes('lavado')) return 'water';
        if (n.includes('ceja')) return 'eye';
        if (n.includes('combo') || n.includes('completo')) return 'flash';
        if (n.includes('tinte')) return 'color-palette';
        return 'star';
    };

    const BILLETES = [1, 5, 10, 20, 50];
    const cambio = parseFloat(montoRecibido) > total ? parseFloat(montoRecibido) - total : 0;

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
            style={{ flex: 1, backgroundColor: colors.background }}
        >
            <KitchyToolbar 
                title="Punto de Venta" 
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
                            <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 12 }}>ANULAR ÚLTIMA</Text>
                        </TouchableOpacity>
                    )
                }
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 350 }}>
                {/* 1. SELECCIONAR ESPECIALISTA (BARBERO) - GRID 3x3 */}
                <View style={{ padding: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: 15 }}>¿Quién Atendió?</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        {especialistas.map((esp, idx) => {
                            const isSelected = especialistaSeleccionado === esp._id;
                            return (
                                <Animated.View key={esp._id} entering={FadeInDown.delay(idx * 40)}>
                                    <TouchableOpacity 
                                        style={{
                                            width: CARD_WIDTH,
                                            height: 110,
                                            borderRadius: 20,
                                            backgroundColor: isSelected ? colors.primary : colors.card,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderWidth: 2,
                                            borderColor: isSelected ? colors.primary : colors.border,
                                            position: 'relative'
                                        }}
                                        onPress={() => setEspecialistaSeleccionado(esp._id)}
                                    >
                                        <View style={{
                                            position: 'absolute',
                                            top: -8,
                                            right: -8,
                                            backgroundColor: isSelected ? '#fff' : colors.primary,
                                            minWidth: 24,
                                            height: 24,
                                            borderRadius: 12,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderWidth: 2,
                                            borderColor: isSelected ? colors.primary : '#fff',
                                            zIndex: 10
                                        }}>
                                            <Text style={{ fontSize: 10, fontWeight: '900', color: isSelected ? colors.primary : '#fff' }}>
                                                {esp.conteoDia || 0}
                                            </Text>
                                        </View>

                                        <View style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 22,
                                            backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.surface,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 6
                                        }}>
                                            <Ionicons name="person" size={20} color={isSelected ? '#fff' : colors.primary} />
                                        </View>
                                        <Text style={{ 
                                            fontSize: 12, 
                                            fontWeight: '700', 
                                            color: isSelected ? '#fff' : colors.textPrimary,
                                            textAlign: 'center'
                                        }} numberOfLines={1}>
                                            {esp.nombre.split(' ')[0]}
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>
                </View>

                {/* NUEVO: NOMBRE DEL CLIENTE */}
                <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
                     <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: 10 }}>Nombre del Cliente (Opcional)</Text>
                        <TextInput 
                            style={{ 
                                backgroundColor: colors.surface, 
                                borderRadius: 12, 
                                padding: 12, 
                                color: colors.textPrimary,
                                fontSize: 16,
                                fontWeight: '600'
                            }}
                            placeholder="Ej. Angel"
                            placeholderTextColor={colors.textMuted}
                            value={clienteNombre}
                            onChangeText={setClienteNombre}
                        />
                     </View>
                </View>
 
                {/* 2. SELECCIONAR SERVICIO - MULTISELECT */}
                <View style={{ padding: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: 12 }}>Servicios (Selección Múltiple)</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                        {servicios.map((serv, idx) => {
                            const isSelected = serviciosSeleccionados.some(s => s._id === serv._id);
                            return (
                                <TouchableOpacity 
                                    key={serv._id}
                                    onPress={() => toggleServicio(serv)}
                                    style={{
                                        width: '47%',
                                        backgroundColor: isSelected ? `${colors.primary}15` : colors.card,
                                        borderRadius: 24,
                                        padding: 16,
                                        borderWidth: 2,
                                        borderColor: isSelected ? colors.primary : colors.border,
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <View style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 10,
                                            backgroundColor: isSelected ? colors.primary : colors.surface,
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <Ionicons name={getServiceIcon(serv.nombre) as any} size={18} color={isSelected ? '#fff' : colors.primary} />
                                        </View>
                                        {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                                    </View>
                                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }} numberOfLines={1}>{serv.nombre}</Text>
                                    <Text style={{ fontSize: 16, fontWeight: '900', color: colors.primary, marginTop: 4 }}>${serv.precio}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>

            {/* TICKET FLOTANTE ACTUALIZADO */}
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
                    {/* Método de Pago Integrado */}
                    <Text style={{ fontSize: 11, fontWeight: '900', color: colors.textMuted, marginBottom: 8, textAlign: 'center', letterSpacing: 1 }}>MÉTODO DE PAGO</Text>
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

                    {/* NUEVO: CALCULADORA DE EFECTIVO */}
                    {metodoPago === 'efectivo' && (
                        <Animated.View entering={FadeInDown} style={{ marginBottom: 15 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '700' }}>¿Con cuánto paga?</Text>
                                {cambio > 0 && (
                                    <Text style={{ fontSize: 14, color: '#10b981', fontWeight: '900' }}>CAMBIO: ${cambio.toFixed(2)}</Text>
                                )}
                            </View>
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
                                <TouchableOpacity 
                                    onPress={() => setMontoRecibido(total.toString())}
                                    style={{ 
                                        flex: 1.5, 
                                        backgroundColor: montoRecibido === total.toString() ? colors.primary : colors.surface, 
                                        paddingVertical: 8, 
                                        borderRadius: 8,
                                        alignItems: 'center',
                                        borderWidth: 1,
                                        borderColor: colors.border
                                    }}
                                >
                                    <Text style={{ color: montoRecibido === total.toString() ? '#fff' : colors.textPrimary, fontSize: 10, fontWeight: 'bold' }}>EXACTO</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    )}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 15 }}>
                        <View>
                            <Text style={{ fontSize: 11, color: colors.textMuted }}>{serviciosSeleccionados.length} servicios {clienteNombre ? `de ${clienteNombre}` : ''}</Text>
                            <Text style={{ fontSize: 32, fontWeight: '900', color: colors.textPrimary }}>${total.toFixed(2)}</Text>
                        </View>
                        <Text style={{ fontSize: 11, color: colors.textMuted }}>Barbero: <Text style={{ color: colors.primary, fontWeight: '800' }}>{especialistas.find(e => e._id === especialistaSeleccionado)?.nombre.split(' ')[0]}</Text></Text>
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
                            <>
                                <Ionicons name="cash-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
                                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>COBRAR</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* OVERLAY DE ÉXITO VISUAL */}
            {showSuccess && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 100, pointerEvents: 'none' }}>
                    <Animated.View style={[
                        { backgroundColor: '#10b981', width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', shadowColor: '#10b981', shadowOpacity: 0.5, shadowRadius: 20 },
                        successStyle
                    ]}>
                        <Ionicons name="checkmark" size={60} color="#fff" />
                    </Animated.View>
                    <Animated.Text entering={ZoomIn.delay(200)} style={{ color: '#10b981', fontSize: 24, fontWeight: '900', marginTop: 20 }}>¡COBRO EXITOSO!</Animated.Text>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}

