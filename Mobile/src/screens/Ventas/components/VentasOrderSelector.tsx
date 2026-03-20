import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
    styles
}) => {
    const calcularSubtotal = (items: any[]) => {
        return items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    };

    return (
        <View style={{ backgroundColor: colors.background, paddingVertical: 14 }}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={{ paddingHorizontal: 20, gap: 12, alignItems: 'center' }}
            >
                {ordenes.map(o => {
                    const isActive = activeOrderId === o.id;
                    const subtotal = calcularSubtotal(o.items);
                    
                    return (
                        <TouchableOpacity
                            key={o.id}
                            onPress={() => seleccionarOrden(o.id)}
                            activeOpacity={0.8}
                            style={{
                                paddingLeft: 16,
                                paddingRight: 10,
                                paddingVertical: 12,
                                borderRadius: 18,
                                backgroundColor: isActive ? colors.primary : colors.surface,
                                borderWidth: 1.5,
                                borderColor: isActive ? colors.primary : colors.border,
                                minWidth: 100,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 10,
                                shadowColor: isActive ? colors.primary : '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: isActive ? 0.3 : 0.05,
                                shadowRadius: 8,
                                elevation: isActive ? 6 : 2
                            }}
                        >
                            <View>
                                <Text style={{
                                    color: isActive ? colors.white : colors.textPrimary,
                                    fontWeight: '900',
                                    fontSize: 14,
                                    letterSpacing: -0.2
                                }}>
                                    {o.nombre}
                                </Text>
                                <Text style={{
                                    color: isActive ? 'rgba(255,255,255,0.7)' : colors.textMuted,
                                    fontSize: 11,
                                    fontWeight: '700',
                                    marginTop: 1
                                }}>
                                    ${subtotal.toFixed(2)}
                                </Text>
                            </View>

                            <TouchableOpacity 
                                onPress={() => eliminarOrden(o.id)}
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : colors.border + '44',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <Ionicons name="close" size={14} color={isActive ? colors.white : colors.textMuted} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    );
                })}

                <TouchableOpacity
                    onPress={() => nuevaOrden()}
                    activeOpacity={0.7}
                    style={{
                        paddingHorizontal: 16,
                        height: 54,
                        borderRadius: 18,
                        backgroundColor: colors.surface,
                        borderWidth: 1.5,
                        borderColor: colors.primary + '44',
                        borderStyle: 'dashed',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                        gap: 8
                    }}
                >
                    <Ionicons name="add-circle" size={20} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 13 }}>Nueva</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};
