import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, Image, Platform, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Producto } from '../../../hooks/useVentas';
import { KitchyInput } from '../../../components/KitchyInput';
import { useAppDimensions } from '../../../context/DimensionsContext';
import { PagoCombinadoModal } from './PagoCombinadoModal';

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
    telefono: string;
    setTelefono: (t: string) => void;
    metodoPago: string;
    setMetodoPago: (m: string) => void;
    pagoCombinado?: { metodo: string; monto: number }[];
    setPagoCombinado?: (combo: { metodo: string; monto: number }[]) => void;
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
    telefono,
    setTelefono,
    metodoPago,
    setMetodoPago,
    pagoCombinado = [],
    setPagoCombinado,
    montoRecibido,
    setMontoRecibido,
    cambio,
    procesarVenta,
    loading
}) => {
    const { width, height } = useAppDimensions();
    const isLandscape = width > height;
    const [showCombinadoModal, setShowCombinadoModal] = React.useState(false);

    const handleBeeper = () => {
        if (!telefono) return;
        const msg = cliente 
            ? `¡Hola ${cliente}! 👋🍔 Tu pedido está listo para retirar en mostrador.`
            : `¡Hola! 👋🍔 Tu pedido está listo para retirar en mostrador.`;
        const url = `https://wa.me/507${telefono}?text=${encodeURIComponent(msg)}`;
        Linking.openURL(url).catch(() => {});
    };

    const total = calcularTotal();

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
                            carrito.map((item, index) => (
                                <View 
                                    key={`${item.producto?._id || 'unknown'}-${index}`} 
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
                            isLandscape && { paddingVertical: 10, paddingBottom: Platform.OS === 'ios' ? 20 : 10 }
                        ]}>
                            
                            {/* FILA 1: DATOS Y PAGOS (Compacta en Landscape) */}
                            <View style={{ flexDirection: 'row', gap: 12, marginBottom: isLandscape ? 8 : 12, alignItems: 'flex-end' }}>
                                <View style={{ flex: isLandscape ? 1.2 : 1 }}>
                                    <KitchyInput
                                        label="Cliente"
                                        placeholder="..."
                                        value={cliente}
                                        onChangeText={setCliente}
                                        containerStyle={{ marginBottom: 0 }}
                                        style={{ height: 38, paddingVertical: 4, fontSize: 13 }}
                                    />
                                </View>
                                <View style={{ flex: isLandscape ? 1 : 1 }}>
                                    <KitchyInput
                                        label="Beeper"
                                        placeholder="6123..."
                                        keyboardType="phone-pad"
                                        value={telefono}
                                        onChangeText={setTelefono}
                                        containerStyle={{ marginBottom: 0 }}
                                        style={{ height: 38, paddingVertical: 4, fontSize: 13 }}
                                    />
                                </View>
                                
                                {isLandscape && (
                                    <View style={{ flex: 2.5, flexDirection: 'row', gap: 6 }}>
                                        {[
                                            { id: 'efectivo', icon: 'cash-outline', label: 'Efe' },
                                            { id: 'yappy', icon: 'qr-code-outline', label: 'Yap' },
                                            { id: 'tarjeta', icon: 'card-outline', label: 'Tar' },
                                            { id: 'combinado', icon: 'options-outline', label: 'Comb' }
                                        ].map((m) => (
                                            <TouchableOpacity
                                                key={m.id}
                                                onPress={() => {
                                                    if (m.id === 'combinado') setShowCombinadoModal(true);
                                                    else setMetodoPago(m.id);
                                                }}
                                                style={{
                                                    flex: 1,
                                                    height: 38,
                                                    backgroundColor: metodoPago === m.id ? colors.primary : colors.surface,
                                                    borderRadius: 8,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    borderWidth: 1.5,
                                                    borderColor: metodoPago === m.id ? colors.primary : colors.border
                                                }}
                                            >
                                                <Ionicons name={m.icon as any} size={16} color={metodoPago === m.id ? '#fff' : colors.textSecondary} />
                                                <Text style={{ fontSize: 8, fontWeight: '800', color: metodoPago === m.id ? '#fff' : colors.textMuted }}>{m.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* MÉTODO DE PAGO (Solo Mobile Portrait) */}
                            {!isLandscape && (
                                <View style={{ marginBottom: 15 }}>
                                    <Text style={{ fontSize: 10, fontWeight: '900', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Método de Pago</Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        {[
                                            { id: 'efectivo', icon: 'cash-outline', label: 'Efectivo' },
                                            { id: 'yappy', icon: 'qr-code-outline', label: 'Yappy' },
                                            { id: 'tarjeta', icon: 'card-outline', label: 'Tarjeta' },
                                            { id: 'combinado', icon: 'options-outline', label: 'Combo' }
                                        ].map((m) => (
                                            <TouchableOpacity
                                                key={m.id}
                                                onPress={() => {
                                                    if (m.id === 'combinado') setShowCombinadoModal(true);
                                                    else setMetodoPago(m.id);
                                                }}
                                                style={{
                                                    flex: 1,
                                                    height: 54,
                                                    backgroundColor: metodoPago === m.id ? colors.primary : colors.surface,
                                                    borderRadius: 12,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    marginHorizontal: 3,
                                                    borderWidth: 1.5,
                                                    borderColor: metodoPago === m.id ? colors.primary : colors.border
                                                }}
                                            >
                                                <Ionicons name={m.icon as any} size={20} color={metodoPago === m.id ? '#fff' : colors.textSecondary} />
                                                <Text style={{ fontSize: 9, fontWeight: '800', color: metodoPago === m.id ? '#fff' : colors.textMuted, marginTop: 2 }}>{m.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* FILA 2: RESUMEN Y BOTONES */}
                            <View style={{ flexDirection: isLandscape ? 'row' : 'column', gap: 12, alignItems: 'center' }}>
                                
                                {/* CAJA DE TOTAL */}
                                <View style={{ 
                                    flex: isLandscape ? 1.5 : undefined,
                                    backgroundColor: colors.surface,
                                    paddingHorizontal: 12,
                                    paddingVertical: isLandscape ? 6 : 12,
                                    borderRadius: 12,
                                    borderStyle: 'dashed',
                                    borderWidth: 1.5,
                                    borderColor: colors.border,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: isLandscape ? 'auto' : '100%'
                                }}>
                                    <View>
                                        <Text style={{ fontSize: 8, color: colors.textSecondary, fontWeight: '900' }}>{metodoPago === 'efectivo' ? 'CAMBIO' : 'VÍA'}</Text>
                                        <Text style={{ fontSize: isLandscape ? 16 : 20, fontWeight: '900', color: colors.primary }}>
                                            {metodoPago === 'efectivo' ? `$${(Number(cambio) || 0).toFixed(2)}` : metodoPago.toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ fontSize: 8, color: colors.textSecondary, fontWeight: '900' }}>TOTAL</Text>
                                        <Text style={{ fontSize: isLandscape ? 22 : 28, fontWeight: '900', color: colors.textPrimary }}>${total.toFixed(2)}</Text>
                                    </View>
                                </View>

                                {metodoPago === 'efectivo' && (
                                    <View style={{ flex: isLandscape ? 1 : undefined, width: isLandscape ? 'auto' : '100%' }}>
                                        <TextInput 
                                            placeholder="Recibido..."
                                            placeholderTextColor={colors.textMuted}
                                            keyboardType="numeric"
                                            value={montoRecibido}
                                            onChangeText={setMontoRecibido}
                                            style={{ 
                                                backgroundColor: colors.card, 
                                                height: 38, 
                                                borderRadius: 8, 
                                                paddingHorizontal: 10, 
                                                fontSize: 13,
                                                fontWeight: '700',
                                                color: colors.textPrimary,
                                                borderWidth: 1,
                                                borderColor: colors.border
                                            }}
                                        />
                                    </View>
                                )}

                                {/* BOTONES DE ACCIÓN */}
                                <View style={{ flex: isLandscape ? 2.5 : undefined, width: isLandscape ? 'auto' : '100%', gap: 8 }}>
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        <TouchableOpacity
                                            style={{ flex: 1, height: 38, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' }}
                                            onPress={onClose}
                                        >
                                            <Text style={{ fontSize: 10, fontWeight: '800', color: colors.textSecondary }}>PENDIENTE</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={{ flex: 1, height: 38, borderRadius: 10, backgroundColor: telefono ? '#25D366' + '15' : colors.surface, borderWidth: 1.5, borderColor: telefono ? '#25D366' : colors.border, justifyContent: 'center', alignItems: 'center' }}
                                            onPress={handleBeeper}
                                            disabled={!telefono}
                                        >
                                            <Text style={{ fontSize: 10, fontWeight: '800', color: telefono ? '#25D366' : colors.textMuted }}>AVISAR</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity
                                        style={{ height: 42, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8 }}
                                        onPress={procesarVenta}
                                        disabled={loading}
                                    >
                                        {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={{ fontSize: 15, fontWeight: '900', color: '#fff' }}>COBRAR Y PAGAR</Text>}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                </Animated.View>
            </Animated.View>

            <PagoCombinadoModal
                visible={showCombinadoModal}
                total={total}
                colors={colors}
                onClose={() => {
                    setShowCombinadoModal(false);
                    if (metodoPago !== 'combinado' && pagoCombinado.length === 0) {
                        setMetodoPago('efectivo');
                    }
                }}
                onConfirm={(combinacion) => {
                    setMetodoPago('combinado');
                    if (setPagoCombinado) setPagoCombinado(combinacion);
                    setShowCombinadoModal(false);
                }}
            />
        </Modal>
    );
};
