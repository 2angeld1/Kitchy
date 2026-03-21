import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { TouchableOpacity as GHTouchableOpacity } from 'react-native-gesture-handler';
import { Producto } from '../../../types/producto.types';

interface Props {
    item: Producto;
    index: number;
    colors: any;
    styles: any;
    onEdit: (item: Producto) => void;
    onDelete: (id: string) => void;
    onToggleDisponible: (id: string, currentState: boolean) => void;
    onSwipeableOpen: (swipeable: Swipeable) => void;
}

export const ProductoItemCard: React.FC<Props> = ({ 
    item, index, colors, styles, onEdit, onDelete, onToggleDisponible, onSwipeableOpen
}) => {
    const swipeableRef = React.useRef<Swipeable>(null);
    const iconName = item.categoria === 'comida' ? 'restaurant-outline' : item.categoria === 'bebida' ? 'cafe-outline' : item.categoria === 'postre' ? 'ice-cream-outline' : 'cube-outline';

    const renderRightActions = () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%' }}>
            <TouchableOpacity
                style={{ backgroundColor: item.disponible ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', width: 60, height: '100%', justifyContent: 'center', alignItems: 'center' }}
                onPress={() => onToggleDisponible(item._id, item.disponible)}
            >
                <Ionicons name={item.disponible ? 'eye-off' : 'eye'} size={22} color={item.disponible ? '#f59e0b' : '#10b981'} />
            </TouchableOpacity>
            <TouchableOpacity
                style={{ backgroundColor: colors.surface, width: 60, height: '100%', justifyContent: 'center', alignItems: 'center' }}
                onPress={() => onEdit(item)}
            >
                <Ionicons name="pencil" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
                style={{ backgroundColor: 'rgba(225, 29, 72, 0.1)', width: 60, height: '100%', justifyContent: 'center', alignItems: 'center' }}
                onPress={() => onDelete(item._id)}
            >
                <Ionicons name="trash" size={22} color="#e11d48" />
            </TouchableOpacity>
        </View>
    );

    return (
        <Animated.View entering={FadeInDown.delay(index * 50)}>
            <Swipeable 
                ref={swipeableRef}
                renderRightActions={renderRightActions}
                onSwipeableOpen={() => swipeableRef.current && onSwipeableOpen(swipeableRef.current)}
            >
                <GHTouchableOpacity
                    style={[styles.itemCard, { opacity: item.disponible ? 1 : 0.5 }]}
                    onPress={() => onEdit(item)}
                    activeOpacity={0.8}
                >
                    <View style={styles.itemIconBox}>
                        {item.imagen ? (
                            <Image source={{ uri: item.imagen }} style={styles.productImage} />
                        ) : (
                            <Ionicons name={iconName} size={24} color={colors.primary} />
                        )}
                    </View>

                    <View style={styles.itemInfo}>
                        <View style={styles.itemTitleRow}>
                            <Text style={[styles.itemTitle, { color: colors.textPrimary, textDecorationLine: item.disponible ? 'none' : 'line-through' }]} numberOfLines={1}>{item.nombre}</Text>
                            <Text style={[styles.itemPrice, { color: colors.primary }]}>${(item.precio || 0).toFixed(2)}</Text>
                        </View>
                        <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                            {item.categoria} {item.descripcion ? `• ${item.descripcion}` : ''}
                        </Text>
                        <View style={[styles.itemStatus, { backgroundColor: item.disponible ? 'rgba(16, 185, 129, 0.1)' : 'rgba(161, 161, 170, 0.2)' }]}>
                            <Text style={[styles.itemStatusText, { color: item.disponible ? '#10b981' : '#71717a' }]}>
                                {item.disponible ? 'Activo' : 'Oculto'}
                            </Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-back" size={18} color={colors.textMuted} style={{ opacity: 0.8 }} />
                </GHTouchableOpacity>
            </Swipeable>
        </Animated.View>
    );
};
