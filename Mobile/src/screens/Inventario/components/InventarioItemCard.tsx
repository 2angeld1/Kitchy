import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { TouchableOpacity as GHTouchableOpacity } from 'react-native-gesture-handler';
import { InventarioItem } from '../../../hooks/useInventario';
import { formatMoney, getInventoryIcon } from '../../../utils/beauty-helpers';

interface Props {
    item: InventarioItem;
    index: number;
    categoriaNegocio: string;
    colors: any;
    styles: any;
    onEdit: (item: InventarioItem) => void;
    onDelete: (id: string) => void;
    onMovimiento: (item: InventarioItem, tipo: 'entrada' | 'salida' | 'merma') => void;
}

export const InventarioItemCard: React.FC<Props> = ({ 
    item, index, categoriaNegocio, colors, styles, onEdit, onDelete, onMovimiento 
}) => {
    const isBajoStock = item.cantidad <= item.cantidadMinima;
    const hoy = new Date();
    const tresDias = new Date();
    tresDias.setDate(hoy.getDate() + 3);
    const estaPorVencer = item.fechaVencimiento && new Date(item.fechaVencimiento) <= tresDias;

    const icon = getInventoryIcon(item.categoria, categoriaNegocio);

    const renderRightActions = () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={[styles.rightAction, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]} onPress={() => onMovimiento(item, 'entrada')}>
                <Ionicons name="arrow-up" size={22} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rightAction, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]} onPress={() => onMovimiento(item, 'salida')}>
                <Ionicons name="cart-outline" size={22} color="#f59e0b" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rightAction, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]} onPress={() => onMovimiento(item, 'merma')}>
                <Ionicons name="flask-outline" size={22} color="#10b981" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rightAction, { backgroundColor: 'rgba(225, 29, 72, 0.1)' }]} onPress={() => onDelete(item._id)}>
                <Ionicons name="trash" size={22} color="#e11d48" />
            </TouchableOpacity>
        </View>
    );

    return (
        <Animated.View entering={FadeInDown.delay(index * 50)}>
            <Swipeable renderRightActions={renderRightActions}>
                <GHTouchableOpacity
                    style={[styles.itemCard, estaPorVencer && { borderLeftWidth: 4, borderLeftColor: colors.primary }]}
                    onPress={() => onEdit(item)}
                    activeOpacity={0.8}
                >
                    <View style={styles.itemIconBox}>
                        <Ionicons name={icon} size={24} color={colors.primary} />
                        {estaPorVencer && (
                            <View style={{ position: 'absolute', top: -4, right: -4 }}>
                                <Ionicons name="alert-circle" size={16} color={colors.primary} />
                            </View>
                        )}
                    </View>
                    <View style={styles.itemInfo}>
                        <View style={styles.itemHeader}>
                            <Text style={styles.itemTitle} numberOfLines={1}>{item.nombre}</Text>
                            <Text style={styles.itemDot}>•</Text>
                            <Text style={styles.itemQty} numberOfLines={1}>{item.cantidad} {item.unidad}</Text>
                        </View>
                        <Text style={styles.itemSub}>{formatMoney(item.costoUnitario || 0)} / ud</Text>
                        {isBajoStock && <Text style={styles.stockWarning}>Bajo Stock (Min: {item.cantidadMinima})</Text>}
                        {item.fechaVencimiento && (
                            <Text style={[styles.vencimientoText, { color: estaPorVencer ? colors.primary : colors.textMuted, fontWeight: estaPorVencer ? 'bold' : 'normal' }]}>
                                Vence: {new Date(item.fechaVencimiento).toLocaleDateString()}
                            </Text>
                        )}
                    </View>
                    <Ionicons name="chevron-back" size={18} color={colors.textMuted} style={{ opacity: 0.8 }} />
                </GHTouchableOpacity>
            </Swipeable>
        </Animated.View>
    );
};
