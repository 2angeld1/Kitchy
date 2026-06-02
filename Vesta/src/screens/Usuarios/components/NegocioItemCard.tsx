import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface Props {
    negocio: any;
    index: number;
    isSelected: boolean;
    colors: any;
    styles: any;
    onEdit: (n: any) => void;
    onDelete: (id: string) => void;
    onSelect: (id: string) => void;
}

export const NegocioItemCard: React.FC<Props> = ({ 
    negocio, index, isSelected, colors, styles, onEdit, onDelete, onSelect 
}) => {
    return (
        <Animated.View entering={FadeInRight.delay(index * 100)}>
            <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => onSelect(negocio._id)}
                style={{
                    backgroundColor: colors.surface,
                    borderRadius: 20,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.primary : colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    elevation: 3
                }}
            >
                <View style={{ 
                    width: 48, height: 48, borderRadius: 16, 
                    backgroundColor: isSelected ? colors.primary : colors.border + '50',
                    justifyContent: 'center', alignItems: 'center',
                    marginRight: 16
                }}>
                    <Ionicons 
                        name="storefront" 
                        size={24} 
                        color={isSelected ? "#fff" : colors.textSecondary} 
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '900', color: colors.textPrimary }}>
                        {negocio.nombre}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                        <Text style={{ fontSize: 11, color: colors.textSecondary, marginLeft: 4 }} numberOfLines={1}>
                            {negocio.direccion || 'Sin dirección registrada'}
                        </Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity 
                        onPress={() => onEdit(negocio)}
                        style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center' }}
                    >
                        <Ionicons name="pencil" size={16} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => onDelete(negocio._id)}
                        style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#ef444415', justifyContent: 'center', alignItems: 'center' }}
                    >
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};
