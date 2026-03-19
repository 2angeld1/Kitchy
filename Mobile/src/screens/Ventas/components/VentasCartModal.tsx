import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Producto } from '../../../hooks/useVentas';

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

                    <ScrollView contentContainerStyle={styles.carritoList}>
                        {carrito.length === 0 ? (
                            <View style={[styles.emptyContainer, { paddingTop: 100 }]}>
                                <Ionicons name="cart-outline" size={64} color={colors.border} />
                                <Text style={[styles.emptyText, { color: colors.textMuted }]}>El carrito está vacío</Text>
                            </View>
                        ) : (
                            carrito.map(item => (
                                <View key={item.producto._id} style={[styles.cartItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                    <View style={[styles.cartItemImage, { backgroundColor: colors.surface, overflow: 'hidden' }]}>
                                        {item.producto.imagen ? (
                                            <Image
                                                source={{ uri: item.producto.imagen }}
                                                style={{ width: '100%', height: '100%' }}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <Ionicons
                                                name={item.producto.categoria === 'comida' ? 'fast-food' : item.producto.categoria === 'bebida' ? 'water' : item.producto.categoria === 'postre' ? 'ice-cream' : 'cube'}
                                                size={20}
                                                color={colors.primary}
                                            />
                                        )}
                                    </View>
                                    <View style={styles.cartItemInfo}>
                                        <Text style={[styles.cartItemName, { color: colors.textPrimary }]} numberOfLines={1}>{item.producto.nombre}</Text>
                                        <Text style={[styles.cartItemPrice, { color: colors.primary }]}>${item.producto.precio.toFixed(2)}</Text>
                                    </View>
                                    <View style={[styles.quantityControls, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                        <TouchableOpacity
                                            style={styles.qtyBtn}
                                            onPress={() => quitarDelCarrito(item.producto._id)}
                                        >
                                            <Ionicons name="remove" size={18} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                        <Text style={[styles.qtyText, { color: colors.textPrimary }]}>{item.cantidad}</Text>
                                        <TouchableOpacity
                                            style={styles.qtyBtn}
                                            onPress={() => agregarAlCarrito(item.producto)}
                                        >
                                            <Ionicons name="add" size={18} color={colors.primary} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    {carrito.length > 0 && (
                        <View style={[styles.checkoutFooter, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                            <View style={styles.formRow}>
                                <TextInput
                                    style={[styles.inputSmall, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                                    placeholder="Cliente (Opcional)"
                                    placeholderTextColor={colors.textMuted}
                                    value={cliente}
                                    onChangeText={setCliente}
                                />
                                <TouchableOpacity
                                    onPress={() => setMetodoPago(metodoPago === 'efectivo' ? 'yappy' : 'efectivo')}
                                    style={[styles.selectSmall, { backgroundColor: colors.background, borderColor: colors.border }]}
                                >
                                    <Text style={[styles.selectText, { color: colors.textPrimary }]}>
                                        {metodoPago === 'efectivo' ? '💵 Efectivo' : '💸 Yappy'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.totalRow}>
                                <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Total a pagar</Text>
                                <Text style={[styles.totalValue, { color: colors.textPrimary }]}>${calcularTotal().toFixed(2)}</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.confirmBtn}
                                onPress={procesarVenta}
                                disabled={loading}
                            >
                                <Ionicons name="checkmark-circle" size={24} color={colors.white} />
                                <Text style={styles.confirmBtnText}>
                                    {loading ? 'Procesando...' : 'Confirmar Pedido'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};
