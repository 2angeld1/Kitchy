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
    return (
        <View style={{ backgroundColor: colors.card, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                {ordenes.map(o => (
                    <TouchableOpacity
                        key={o.id}
                        onPress={() => seleccionarOrden(o.id)}
                        onLongPress={() => eliminarOrden(o.id)}
                        style={{
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            borderRadius: 12,
                            backgroundColor: activeOrderId === o.id ? colors.primary : colors.surface,
                            borderWidth: 1.5,
                            borderColor: activeOrderId === o.id ? colors.primary : colors.border,
                            minWidth: 80,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Text style={{
                            color: activeOrderId === o.id ? colors.white : colors.textPrimary,
                            fontWeight: '800',
                            fontSize: 13
                        }}>
                            {o.nombre}
                        </Text>
                        {o.items.length > 0 && (
                            <Text style={{
                                color: activeOrderId === o.id ? 'rgba(255,255,255,0.8)' : colors.textMuted,
                                fontSize: 10,
                                fontWeight: '600',
                                marginTop: 2
                            }}>
                                {o.items.length} items
                            </Text>
                        )}
                    </TouchableOpacity>
                ))}
                <TouchableOpacity
                    onPress={() => nuevaOrden()}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: colors.surface,
                        borderWidth: 1.5,
                        borderColor: colors.border,
                        borderStyle: 'dashed',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Ionicons name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};
