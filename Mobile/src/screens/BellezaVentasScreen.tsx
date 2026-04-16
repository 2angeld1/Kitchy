import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, SlideInDown, ZoomIn, useSharedValue, useAnimatedStyle, withSpring, withSequence, withDelay } from 'react-native-reanimated';
import { useBellezaVentas } from '../hooks/useBellezaVentas';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useAuth, Negocio } from '../context/AuthContext';
import { createStyles } from '../styles/BellezaVentasScreen.styles';
import { getBeautyIcon, formatMoney, getInventoryIcon } from '../utils/beauty-helpers';
import { VentasHistorialModal } from './Ventas/components/VentasHistorialModal';
import { PagoCombinadoModal } from './Ventas/components/PagoCombinadoModal';
import { BellezaCaitlynFAB } from '../components/BellezaCaitlynFAB';

export default function BellezaVentasScreen() {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation();
    const colors = isDark ? darkTheme : lightTheme;
    const styles = useMemo(() => createStyles(colors), [colors]);

    const negocio = user?.negocioActivo as Negocio;
    const BILLETES = negocio?.config?.denominaciones || [1, 5, 10, 20, 50, 100];

    const {
        servicios,
        productosVenta,
        especialistas,
        itemsSeleccionados,
        especialistaSeleccionado,
        metodoPago,
        pagoCombinado,
        loading,
        clienteNombre, setClienteNombre,
        montoRecibido, setMontoRecibido,
        lastVentaId, anularUltimaVenta,
        toggleItem,
        setEspecialistaSeleccionado,
        setMetodoPago,
        setPagoCombinado,
        procesarCobro,
        abrirHistorial,
        ventas,
        showHistorial,
        setShowHistorial,
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
    const [showCombinadoModal, setShowCombinadoModal] = useState(false);
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
                title="Punto de Venta"
                onNotificationPress={abrirHistorial}
                extraButtons={
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {lastVentaId && (
                            <TouchableOpacity
                                onPress={anularUltimaVenta}
                                style={styles.undoBtn}
                            >
                                <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                <Text style={styles.undoText}>ANULAR</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('BellezaResumen' as never)}
                            style={[styles.undoBtn, { borderColor: colors.primary, backgroundColor: `${colors.primary}10` }]}
                        >
                            <Ionicons name="file-tray-full-outline" size={18} color={colors.primary} />
                            <Text style={[styles.undoText, { color: colors.primary }]}>RESUMEN</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* 1. ¿QUIEN ATENDIO? - TOP PRIORITY GRID */}
                <View style={styles.especialistaSection}>
                    <Text style={styles.especialistaTitle}>¿Quién atendió hoy?</Text>
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
                                        onPress={() => {
                                            if (especialistaSeleccionado === esp._id) {
                                                setEspecialistaSeleccionado(null);
                                            } else {
                                                setEspecialistaSeleccionado(esp._id);
                                            }
                                        }}
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

                {/* 2. SELECCIONAR SERVICIO - GRID */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Servicios realizados</Text>
                    <View style={styles.grid}>
                        {servicios.map((ser, idx) => {
                            const isSelected = itemsSeleccionados.some(s => s._id === ser._id);
                            return (
                                <Animated.View key={ser._id} entering={FadeInDown.delay(idx * 40)}>
                                    <TouchableOpacity
                                        onPress={() => toggleItem(ser)}
                                        style={[
                                            styles.serviceCard,
                                            {
                                                backgroundColor: isSelected ? `${colors.primary}15` : colors.card,
                                                borderColor: isSelected ? colors.primary : colors.border
                                            }
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

                {/* 2.5 PRODUCTOS EN VENTA (REVENTA) */}
                <View style={[styles.section, { paddingTop: 0 }]}>
                    {productosVenta.length > 0 ? (
                        <>
                            <Text style={styles.sectionTitle}>Productos en Venta</Text>
                            <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 12, marginTop: -8, fontStyle: 'italic' }}>
                                Estos productos vienen de tu inventario (categoría Reventa)
                            </Text>
                            <View style={styles.grid}>
                                {productosVenta.map((prod, idx) => {
                                    const isSelected = itemsSeleccionados.some(s => s._id === prod._id);
                                    return (
                                        <Animated.View key={prod._id} entering={FadeInDown.delay(idx * 40)}>
                                            <TouchableOpacity
                                                onPress={() => toggleItem(prod)}
                                                style={[
                                                    styles.serviceCard,
                                                    {
                                                        backgroundColor: isSelected ? `${colors.primary}15` : colors.card,
                                                        borderColor: isSelected ? colors.primary : colors.border
                                                    }
                                                ]}
                                            >
                                                <View style={styles.cardHeader}>
                                                    <View style={[styles.iconContainer, { backgroundColor: isSelected ? colors.primary : colors.surface }]}>
                                                        <Ionicons name={getInventoryIcon('reventa', 'BELLEZA')} size={18} color={isSelected ? '#fff' : colors.primary} />
                                                    </View>
                                                    {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                                                </View>
                                                <View style={styles.serviceInfo}>
                                                    <Text style={[styles.serviceName, { color: colors.textPrimary }]} numberOfLines={1}>{prod.nombre}</Text>
                                                    <Text style={[styles.servicePrice, { color: colors.primary }]}>{formatMoney(prod.precio)}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    );
                                })}
                            </View>
                        </>
                    ) : (
                        <Animated.View entering={FadeInDown.delay(200)}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => (navigation as any).navigate('Inventario')}
                                style={{
                                    backgroundColor: colors.card,
                                    borderRadius: 20,
                                    padding: 20,
                                    borderWidth: 1.5,
                                    borderColor: colors.border,
                                    borderStyle: 'dashed',
                                    alignItems: 'center',
                                    gap: 10,
                                }}
                            >
                                <View style={{
                                    width: 48, height: 48, borderRadius: 16,
                                    backgroundColor: colors.primary + '10',
                                    justifyContent: 'center', alignItems: 'center',
                                }}>
                                    <Ionicons name="bag-add-outline" size={24} color={colors.primary} />
                                </View>
                                <Text style={{
                                    fontSize: 15, fontWeight: '800',
                                    color: colors.textPrimary, textAlign: 'center',
                                }}>
                                    ¿Vendes productos?
                                </Text>
                                <Text style={{
                                    fontSize: 12, color: colors.textMuted,
                                    textAlign: 'center', lineHeight: 18,
                                    paddingHorizontal: 10,
                                }}>
                                    Shampoos, ceras, tratamientos... Ve a{' '}
                                    <Text style={{ fontWeight: '800', color: colors.primary }}>Inventario</Text>
                                    {' '}y crea productos con categoría{' '}
                                    <Text style={{ fontWeight: '800', color: colors.primary }}>"Reventa"</Text>
                                    . Aparecerán aquí automáticamente 📲
                                </Text>
                                <View style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 6,
                                    backgroundColor: colors.primary + '10',
                                    paddingHorizontal: 14, paddingVertical: 8,
                                    borderRadius: 12, marginTop: 4,
                                }}>
                                    <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                                    <Text style={{ fontSize: 13, fontWeight: '800', color: colors.primary }}>
                                        Ir a Inventario
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
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
            {itemsSeleccionados.length > 0 && especialistaSeleccionado && (
                <Animated.View
                    entering={SlideInDown.duration(400)}
                    style={[styles.ticketContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <View style={styles.paymentMethods}>
                        {['efectivo', 'yappy', 'tarjeta', 'combinado'].map((m) => {
                            const isSelected = metodoPago === m;
                            return (
                                <TouchableOpacity
                                    key={m}
                                    onPress={() => {
                                        if (m === 'combinado') {
                                            setShowCombinadoModal(true);
                                        } else {
                                            setMetodoPago(m as any);
                                            setPagoCombinado([]);
                                        }
                                    }}
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
                            {metodoPago === 'combinado' && pagoCombinado.length > 0 ? (
                                <Text style={[styles.totalLabel, { color: colors.primary, fontWeight: '700' }]}>
                                    {pagoCombinado.map(c => `$${c.monto.toFixed(2)} ${c.metodo.toUpperCase()}`).join(' + ')}
                                </Text>
                            ) : (
                                <Text style={[styles.totalLabel, { color: colors.textMuted }]}>{itemsSeleccionados.length} items seleccionados</Text>
                            )}
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
                            <Text style={styles.cobrarText}>COBRAR TODO</Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            )}

            {showSuccess && (
                <Animated.View 
                    entering={FadeInDown.duration(400).springify()} 
                    exiting={FadeIn.duration(200)}
                    style={styles.successOverlay}
                    pointerEvents="none"
                >
                    <View style={styles.successCircle}>
                        <Ionicons name="checkmark" size={18} color="#fff" />
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>¡Venta exitosa!</Text>
                </Animated.View>
            )}

            <BellezaCaitlynFAB
                especialistas={especialistas}
                config={(negocio.comisionConfig as any) || { tipo: 'fijo' }}
            />

            <VentasHistorialModal
                visible={showHistorial}
                onClose={() => setShowHistorial(false)}
                ventas={ventas}
                colors={colors}
            />

            <PagoCombinadoModal
                visible={showCombinadoModal}
                total={total}
                colors={colors}
                onClose={() => {
                    console.log("[PagoCombinado] onClose called. Current metodoPago:", metodoPago, "pagoCombinado.length:", pagoCombinado.length);
                    setShowCombinadoModal(false);
                    // Si cerró sin confirmar, volver a efectivo si estaba en combinar
                    if (metodoPago !== 'combinado' && pagoCombinado.length === 0) {
                        console.log("[PagoCombinado] Reverting to efectivo...");
                        setMetodoPago('efectivo');
                    }
                }}
                onConfirm={(combinacion) => {
                    console.log("[PagoCombinado] onConfirm CALLED. payload:", combinacion);
                    setMetodoPago('combinado');
                    setPagoCombinado(combinacion);
                    setShowCombinadoModal(false);
                }}
            />
        </KeyboardAvoidingView>
    );
}
