import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Image, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Producto } from '../../../hooks/useVentas';
import { KitchyInput } from '../../../components/KitchyInput';
import { KitchySelect } from '../../../components/KitchySelect';

interface Props {
    visible: boolean;
    onClose: () => void;
    activeOrder: any;
    carrito: any[];
    colors: any;
    styles: any;
    agregarAlCarrito: (producto: Producto) => void;
    quitarDelCarrito: (id: string) => void;
    calcularTotal: () => number;
    cliente: string;
    setCliente: (c: string) => void;
    metodoPago: string;
    setMetodoPago: (m: string) => void;
    montoRecibido: string;
    setMontoRecibido: (m: string) => void;
    cambio: number;
    procesarVenta: () => void;
    loading: boolean;
}

export const VentasCartModal: React.FC<Props> = ({
    visible,
    onClose,
    activeOrder,
    carrito,
    colors,
    styles,
    agregarAlCarrito,
    quitarDelCarrito,
    calcularTotal,
    cliente,
    setCliente,
    metodoPago,
    setMetodoPago,
    montoRecibido,
    setMontoRecibido,
    cambio,
    procesarVenta,
    loading
}) => {
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <Animated.View
                entering={FadeIn.duration(300)}
                style={styles.modalOverlay}
            >
                <Animated.View
                    entering={SlideInDown.springify().damping(15)}
                    style={[styles.modalContent, { backgroundColor: colors.card }]}
                >
                    <View style={styles.modalHeader}>
                        <View>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{activeOrder.nombre}</Text>
                            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>{carrito.length} Items seleccionados</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={32} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.carritoList} showsVerticalScrollIndicator={false}>
                        {carrito.length === 0 ? (
                            <View style={[styles.emptyContainer, { paddingTop: 100 }]}>
                                <Ionicons name="cart-outline" size={64} color={colors.border} />
                                <Text style={[styles.emptyText, { color: colors.textMuted }]}>El carrito está vacío</Text>
                            </View>
                        ) : (
                            carrito.map(item => (
                                <View key={item.producto._id} style={styles.cartItem}>
                                    <View style={styles.cartItemImage}>
                                        {item.producto.imagen ? (
                                            <Image
                                                source={{ uri: item.producto.imagen }}
                                                style={{ width: '100%', height: '100%', borderRadius: 12 }}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <Ionicons
                                                name={item.producto.categoria === 'comida' ? 'fast-food-outline' : item.producto.categoria === 'bebida' ? 'water-outline' : item.producto.categoria === 'postre' ? 'ice-cream-outline' : 'cube-outline'}
                                                size={24}
                                                color={colors.primary}
                                            />
                                        )}
                                    </View>
                                    <View style={styles.cartItemInfo}>
                                        <Text style={styles.cartItemName} numberOfLines={1}>{item.producto.nombre}</Text>
                                        <Text style={styles.cartItemPrice}>${(Number(item.producto.precio) || 0).toFixed(2)}</Text>
                                    </View>
                                    <View style={styles.quantityControls}>
                                        <TouchableOpacity
                                            style={styles.qtyBtn}
                                            onPress={() => quitarDelCarrito(item.producto._id)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="remove" size={16} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                        <Text style={styles.qtyText}>{item.cantidad}</Text>
                                        <TouchableOpacity
                                            style={styles.qtyBtn}
                                            onPress={() => agregarAlCarrito(item.producto)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="add" size={16} color={colors.primary} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    {carrito.length > 0 && (
                        <View style={styles.checkoutFooter}>
                            {/* Nombre del Cliente */}
                            <KitchyInput
                                label="Nombre del Cliente"
                                placeholder="..."
                                value={cliente}
                                onChangeText={setCliente}
                            />

                            {/* Metodo de Pago - Cambiado a Select para mejor UX en móvil */}
                            <KitchySelect
                                label="Método de Pago"
                                value={metodoPago}
                                options={[
                                    { label: '💵 Efectivo', value: 'efectivo' },
                                    { label: '💸 Yappy', value: 'yappy' },
                                    { label: '🏦 ACH / Transferencia', value: 'ach' },
                                    { label: '💳 Tarjeta', value: 'tarjeta' }
                                ]}
                                onSelect={setMetodoPago}
                            />

                            {/* Detalle Efectivo */}
                            {metodoPago === 'efectivo' && (
                                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20, alignItems: 'flex-start' }}>
                                    <View style={{ flex: 1.2 }}>
                                        <KitchyInput
                                            label="RECIBIDO"
                                            placeholder="0.00"
                                            keyboardType="numeric"
                                            value={montoRecibido}
                                            onChangeText={setMontoRecibido}
                                        />
                                    </View>
                                    <View style={{ flex: 1, paddingTop: 32 }}>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }}>CAMBIO</Text>
                                            <Text style={{ fontSize: 26, fontWeight: '900', color: colors.primary }}>
                                                ${(Number(cambio) || 0).toFixed(2)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total a pagar</Text>
                                <Text style={styles.totalValue}>${(Number(calcularTotal()) || 0).toFixed(2)}</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.confirmBtn}
                                onPress={procesarVenta}
                                disabled={loading}
                                activeOpacity={0.9}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle" size={24} color={colors.white} />
                                        <Text style={styles.confirmBtnText}>Confirmar Pedido</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};
