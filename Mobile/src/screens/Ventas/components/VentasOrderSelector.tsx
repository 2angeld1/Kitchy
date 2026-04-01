import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Props {
    ordenes: any[];
    activeOrderId: string;
    seleccionarOrden: (id: string) => void;
    eliminarOrden: (id: string) => void;
    nuevaOrden: () => void;
    colors: any;
    styles: any;
}

export const VentasOrderSelector: React.FC<Props> = ({
    ordenes,
    activeOrderId,
    seleccionarOrden,
    eliminarOrden,
    nuevaOrden,
    colors,
}) => {
    const [showSelector, setShowSelector] = useState(false);

    const calcularSubtotal = (items: any[]) => {
        return items.reduce((sum, item) => sum + (Number(item.producto?.precio || 0) * item.cantidad), 0);
    };

    const ordenActiva = ordenes.find(o => o.id === activeOrderId);
    const ordenesActivas = ordenes.filter(o => !o.completada);
    const ordenesCompletadas = ordenes.filter(o => o.completada);
    const subtotalActivo = ordenActiva ? calcularSubtotal(ordenActiva.items) : 0;

    const handleSeleccionar = (id: string) => {
        seleccionarOrden(id);
        setShowSelector(false);
    };

    const handleNuevaOrden = () => {
        nuevaOrden();
        setShowSelector(false);
    };

    return (
        <View style={{ backgroundColor: colors.background, paddingHorizontal: 20, paddingVertical: 10 }}>
            {/* Barra Compacta: [✅ N] [Pedido Activo ▼] [+] */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>

                {/* Badge de Completados */}
                {ordenesCompletadas.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setShowSelector(true)}
                        activeOpacity={0.7}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 5,
                            paddingHorizontal: 12,
                            height: 54,
                            borderRadius: 16,
                            backgroundColor: 'rgba(16, 185, 129, 0.08)',
                            borderWidth: 1.5,
                            borderColor: 'rgba(16, 185, 129, 0.2)',
                        }}
                    >
                        <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                        <Text style={{ color: '#10b981', fontWeight: '900', fontSize: 14 }}>
                            {ordenesCompletadas.length}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Botón Selector del Pedido Activo */}
                <TouchableOpacity
                    onPress={() => setShowSelector(true)}
                    activeOpacity={0.8}
                    style={{
                        flex: 1,
                        height: 54,
                        borderRadius: 16,
                        backgroundColor: colors.primary,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 16,
                        shadowColor: colors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6,
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            color: '#fff',
                            fontWeight: '900',
                            fontSize: 15,
                            letterSpacing: -0.3,
                        }} numberOfLines={1}>
                            {ordenActiva?.nombre || 'Pedido 1'}
                        </Text>
                        <Text style={{
                            color: 'rgba(255,255,255,0.65)',
                            fontSize: 11,
                            fontWeight: '700',
                            marginTop: 1,
                        }}>
                            ${subtotalActivo.toFixed(2)} · {ordenesActivas.length} {ordenesActivas.length === 1 ? 'pedido' : 'pedidos'}
                        </Text>
                    </View>
                    <View style={{
                        width: 28, height: 28, borderRadius: 14,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        justifyContent: 'center', alignItems: 'center',
                    }}>
                        <Ionicons name="chevron-down" size={16} color="#fff" />
                    </View>
                </TouchableOpacity>

                {/* Botón Nueva Orden */}
                <TouchableOpacity
                    onPress={handleNuevaOrden}
                    activeOpacity={0.7}
                    style={{
                        width: 54,
                        height: 54,
                        borderRadius: 16,
                        backgroundColor: colors.surface,
                        borderWidth: 1.5,
                        borderColor: colors.primary + '44',
                        borderStyle: 'dashed',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Ionicons name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Modal Selector de Pedidos */}
            <Modal visible={showSelector} transparent animationType="fade">
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setShowSelector(false)}
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'flex-start',
                        paddingTop: 120,
                    }}
                >
                    <Animated.View
                        entering={FadeInDown.springify().damping(18)}
                        style={{
                            marginHorizontal: 16,
                            backgroundColor: colors.card,
                            borderRadius: 28,
                            padding: 20,
                            maxHeight: 500,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 12 },
                            shadowOpacity: 0.25,
                            shadowRadius: 24,
                            elevation: 20,
                        }}
                    >
                        {/* Header */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={{ fontSize: 20, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 }}>
                                Mis Pedidos
                            </Text>
                            <TouchableOpacity onPress={() => setShowSelector(false)}>
                                <Ionicons name="close-circle" size={30} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Pedidos Activos */}
                            {ordenesActivas.length > 0 && (
                                <View style={{ marginBottom: 16 }}>
                                    <Text style={{
                                        fontSize: 10, fontWeight: '900', color: colors.textMuted,
                                        textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10,
                                    }}>
                                        Activos ({ordenesActivas.length})
                                    </Text>

                                    {ordenesActivas.map((o, idx) => {
                                        const isActive = activeOrderId === o.id;
                                        const subtotal = calcularSubtotal(o.items);

                                        return (
                                            <TouchableOpacity
                                                key={o.id}
                                                onPress={() => handleSeleccionar(o.id)}
                                                activeOpacity={0.7}
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    paddingVertical: 14,
                                                    paddingHorizontal: 14,
                                                    borderRadius: 16,
                                                    backgroundColor: isActive ? colors.primary + '10' : 'transparent',
                                                    borderWidth: isActive ? 1.5 : 0,
                                                    borderColor: isActive ? colors.primary + '40' : 'transparent',
                                                    marginBottom: 6,
                                                }}
                                            >
                                                <View style={{
                                                    width: 40, height: 40, borderRadius: 14,
                                                    backgroundColor: isActive ? colors.primary : colors.surface,
                                                    justifyContent: 'center', alignItems: 'center', marginRight: 14,
                                                }}>
                                                    <Ionicons
                                                        name="receipt-outline"
                                                        size={18}
                                                        color={isActive ? '#fff' : colors.textMuted}
                                                    />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{
                                                        fontSize: 15, fontWeight: '800',
                                                        color: colors.textPrimary,
                                                    }} numberOfLines={1}>
                                                        {o.nombre}
                                                    </Text>
                                                    <Text style={{
                                                        fontSize: 11, color: colors.textMuted,
                                                        fontWeight: '600', marginTop: 2,
                                                    }}>
                                                        {o.items.length} {o.items.length === 1 ? 'producto' : 'productos'}
                                                    </Text>
                                                </View>
                                                <Text style={{
                                                    fontSize: 16, fontWeight: '900',
                                                    color: isActive ? colors.primary : colors.textPrimary,
                                                }}>
                                                    ${subtotal.toFixed(2)}
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={() => eliminarOrden(o.id)}
                                                    style={{
                                                        width: 28, height: 28, borderRadius: 14,
                                                        backgroundColor: 'rgba(239,68,68,0.06)',
                                                        justifyContent: 'center', alignItems: 'center',
                                                        marginLeft: 10,
                                                    }}
                                                >
                                                    <Ionicons name="trash-outline" size={14} color="#ef4444" />
                                                </TouchableOpacity>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}

                            {/* Pedidos Completados */}
                            {ordenesCompletadas.length > 0 && (
                                <View>
                                    <Text style={{
                                        fontSize: 10, fontWeight: '900', color: '#10b981',
                                        textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10,
                                    }}>
                                        ✓ Completados ({ordenesCompletadas.length})
                                    </Text>

                                    {ordenesCompletadas.map((o) => (
                                        <View
                                            key={o.id}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                paddingVertical: 12,
                                                paddingHorizontal: 14,
                                                borderRadius: 14,
                                                backgroundColor: 'rgba(16,185,129,0.04)',
                                                marginBottom: 6,
                                            }}
                                        >
                                            <View style={{
                                                width: 36, height: 36, borderRadius: 12,
                                                backgroundColor: 'rgba(16,185,129,0.1)',
                                                justifyContent: 'center', alignItems: 'center', marginRight: 12,
                                            }}>
                                                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{
                                                    fontSize: 13, fontWeight: '700',
                                                    color: colors.textSecondary,
                                                }} numberOfLines={1}>
                                                    {o.nombre}
                                                </Text>
                                                {o.completadoEn && (
                                                    <Text style={{
                                                        fontSize: 10, color: colors.textMuted,
                                                        fontWeight: '600', marginTop: 2,
                                                    }}>
                                                        {new Date(o.completadoEn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Text>
                                                )}
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => eliminarOrden(o.id)}
                                                style={{
                                                    width: 28, height: 28, borderRadius: 14,
                                                    backgroundColor: 'rgba(239,68,68,0.06)',
                                                    justifyContent: 'center', alignItems: 'center',
                                                }}
                                            >
                                                <Ionicons name="trash-outline" size={14} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}

                                    <Text style={{
                                        fontSize: 10, color: colors.textMuted, marginTop: 6,
                                        fontStyle: 'italic', textAlign: 'center',
                                    }}>
                                        Se eliminan automáticamente después de 24 horas
                                    </Text>
                                </View>
                            )}

                            {/* Botón Nueva Orden dentro del modal */}
                            <TouchableOpacity
                                onPress={handleNuevaOrden}
                                activeOpacity={0.7}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    height: 50,
                                    borderRadius: 16,
                                    backgroundColor: colors.surface,
                                    borderWidth: 1.5,
                                    borderColor: colors.primary + '33',
                                    borderStyle: 'dashed',
                                    marginTop: 16,
                                }}
                            >
                                <Ionicons name="add-circle" size={20} color={colors.primary} />
                                <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 14 }}>
                                    Nuevo Pedido
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};
