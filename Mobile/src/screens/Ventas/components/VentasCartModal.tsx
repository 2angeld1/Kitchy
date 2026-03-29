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
                            <View style={styles.formRow}>
                                <TextInput
                                    style={styles.inputSmall}
                                    placeholder="Nombre del Cliente"
                                    placeholderTextColor={colors.textMuted}
                                    value={cliente}
                                    onChangeText={setCliente}
                                />
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                                    {[
                                        { id: 'efectivo', label: 'Efectivo', icon: 'cash-outline' },
                                        { id: 'yappy', label: 'Yappy', icon: 'qr-code-outline' },
                                        { id: 'ach', label: 'ACH', icon: 'business-outline' },
                                        { id: 'tarjeta', label: 'Tarjeta', icon: 'card-outline' }
                                    ].map((metodo) => (
                                        <TouchableOpacity
                                            key={metodo.id}
                                            onPress={() => setMetodoPago(metodo.id)}
                                            activeOpacity={0.7}
                                            style={[
                                                styles.metodoTag, 
                                                { flex: 1, minWidth: '45%', paddingVertical: 12, alignItems: 'center', justifyContent: 'center', opacity: metodoPago === metodo.id ? 1 : 0.6 },
                                                metodoPago === metodo.id && { backgroundColor: `${colors.primary}20`, borderColor: colors.primary, borderWidth: 2 }
                                            ]}
                                        >
                                            <Ionicons 
                                                name={metodo.icon as any} 
                                                size={20} 
                                                color={metodoPago === metodo.id ? colors.primary : colors.textMuted} 
                                            />
                                            <Text style={[
                                                styles.metodoTagText, 
                                                { fontSize: 10, marginTop: 4 },
                                                metodoPago === metodo.id && { color: colors.primary, fontWeight: '900' }
                                            ]}>
                                                {metodo.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {metodoPago === 'efectivo' && (
                                <View style={[styles.formRow, { marginTop: 8 }]}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>RECIBIDO</Text>
                                        <TextInput
                                            style={styles.inputSmall}
                                            placeholder="0.00"
                                            keyboardType="numeric"
                                            value={montoRecibido}
                                            onChangeText={setMontoRecibido}
                                        />
                                    </View>
                                    <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>CAMBIO</Text>
                                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary }}>
                                            ${cambio.toFixed(2)}
                                        </Text>
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
