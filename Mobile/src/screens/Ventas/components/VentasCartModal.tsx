import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Image, Platform, ActivityIndicator } from 'react-native';
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

                    <ScrollView contentContainerStyle={styles.carritoList} showsVerticalScrollIndicator={false}>
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
                                        <Text style={styles.cartItemPrice}>${item.producto.precio.toFixed(2)}</Text>
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
                            <View style={styles.formRow}>
                                <TextInput
                                    style={styles.inputSmall}
                                    placeholder="Nombre del Cliente"
                                    placeholderTextColor={colors.textMuted}
                                    value={cliente}
                                    onChangeText={setCliente}
                                />
                                <TouchableOpacity
                                    onPress={() => setMetodoPago(metodoPago === 'efectivo' ? 'yappy' : 'efectivo')}
                                    style={styles.selectSmall}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.selectText}>
                                        {metodoPago === 'efectivo' ? '💵 Efectivo' : '💸 Yappy'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total a pagar</Text>
                                <Text style={styles.totalValue}>${calcularTotal().toFixed(2)}</Text>
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
