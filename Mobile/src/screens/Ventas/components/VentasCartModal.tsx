import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Image, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Producto } from '../../../hooks/useVentas';
import { KitchyInput } from '../../../components/KitchyInput';
import { KitchySelect } from '../../../components/KitchySelect';
import { useAppDimensions } from '../../../context/DimensionsContext';

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
    const { width, height } = useAppDimensions();
    const isLandscape = width > height;

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

                    <ScrollView 
                        style={{ flex: 1 }} 
                        contentContainerStyle={[
                            styles.carritoList,
                            isLandscape && { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16 }
                        ]} 
                        showsVerticalScrollIndicator={false}
                    >
                        {carrito.length === 0 ? (
                            <View style={[styles.emptyContainer, { paddingTop: isLandscape ? 40 : 100 }]}>
                                <Ionicons name="cart-outline" size={isLandscape ? 40 : 64} color={colors.border} />
                                <Text style={[styles.emptyText, { color: colors.textMuted }]}>El carrito está vacío</Text>
                            </View>
                        ) : (
                            carrito.map(item => (
                                <View 
                                    key={item.producto._id} 
                                    style={[
                                        styles.cartItem, 
                                        isLandscape && { width: (width - 64) / 2, marginBottom: 8, paddingVertical: 8 }
                                    ]}
                                >
                                    {!isLandscape && (
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
                                    )}
                                    <View style={styles.cartItemInfo}>
                                        <Text style={[styles.cartItemName, isLandscape && { fontSize: 13 }]} numberOfLines={1}>{item.producto.nombre}</Text>
                                        <Text style={[styles.cartItemPrice, isLandscape && { fontSize: 11 }]}>${(Number(item.producto.precio) || 0).toFixed(2)}</Text>
                                    </View>
                                    <View style={[styles.quantityControls, isLandscape && { transform: [{ scale: 0.9 }] }]}>
                                        <TouchableOpacity
                                            style={styles.qtyBtn}
                                            onPress={() => quitarDelCarrito(item.producto._id)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="remove" size={14} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                        <Text style={[styles.qtyText, isLandscape && { fontSize: 14 }]}>{item.cantidad}</Text>
                                        <TouchableOpacity
                                            style={styles.qtyBtn}
                                            onPress={() => agregarAlCarrito(item.producto)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="add" size={14} color={colors.primary} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    {carrito.length > 0 && (
                            <View style={[
                                styles.checkoutFooter, 
                                isLandscape && { paddingBottom: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }
                            ]}>
                                {/* Inputs en Fila si es Landscape */}
                                <View style={{ flexDirection: 'row', gap: 12, marginBottom: isLandscape ? 4 : 0 }}>
                                    <View style={{ flex: 1.5 }}>
                                        <KitchyInput
                                            label="Nombre del Cliente"
                                            placeholder="..."
                                            value={cliente}
                                            onChangeText={setCliente}
                                            containerStyle={isLandscape && { marginBottom: 0 }}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
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
                                            containerStyle={isLandscape && { marginBottom: 0 }}
                                        />
                                    </View>
                                    {metodoPago === 'efectivo' && isLandscape && (
                                        <View style={{ flex: 1 }}>
                                            <KitchyInput
                                                label="RECIBIDO"
                                                placeholder="0.00"
                                                keyboardType="numeric"
                                                value={montoRecibido}
                                                onChangeText={setMontoRecibido}
                                                containerStyle={{ marginBottom: 0 }}
                                            />
                                        </View>
                                    )}
                                </View>

                                {/* Cambio y Total en la misma fila en Landscape */}
                                <View style={{ 
                                    flexDirection: 'row', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    marginVertical: isLandscape ? 4 : 8 
                                }}>
                                    {metodoPago === 'efectivo' && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                             <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: '900' }}>CAMBIO:</Text>
                                             <Text style={{ fontSize: isLandscape ? 18 : 22, fontWeight: '900', color: colors.primary }}>
                                                ${(Number(cambio) || 0).toFixed(2)}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                                        <Text style={[styles.totalLabel, { fontSize: 12, marginBottom: 0 }]}>TOTAL:</Text>
                                        <Text style={[styles.totalValue, { fontSize: isLandscape ? 22 : 24 }]}>${(Number(calcularTotal()) || 0).toFixed(2)}</Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <TouchableOpacity
                                        style={[styles.confirmBtn, { flex: 0.6, height: isLandscape ? 40 : 46, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border }]}
                                        onPress={onClose}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="time-outline" size={isLandscape ? 18 : 18} color={colors.textSecondary} />
                                        <Text style={[styles.confirmBtnText, { color: colors.textSecondary, fontSize: isLandscape ? 11 : 12, fontWeight: '800' }]}>DEJAR PENDIENTE</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.confirmBtn, { flex: 1, height: isLandscape ? 40 : 46 }]}
                                        onPress={procesarVenta}
                                        disabled={loading}
                                        activeOpacity={0.9}
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color="#FFF" />
                                        ) : (
                                            <>
                                                <Ionicons name="wallet-outline" size={isLandscape ? 20 : 20} color={colors.white} />
                                                <Text style={[styles.confirmBtnText, { fontSize: isLandscape ? 13 : 13, fontWeight: '900' }]}>PAGADO</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                    )}
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};
