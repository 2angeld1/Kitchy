import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InventarioItem } from '../../../hooks/useInventario';
import { formatMoney, getInventoryIcon } from '../../../utils/beauty-helpers';

interface Props {
    item: InventarioItem;
    colors: any;
    styles: any;
    estaPorVencer: boolean | null;
    isBajoStock: boolean;
}

export const InventarioBellezaCard: React.FC<Props> = ({
    item, colors, styles, estaPorVencer, isBajoStock
}) => {
    const icon = getInventoryIcon(item.categoria, 'BELLEZA');
    const isReventa = item.categoria === 'reventa';

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.itemIconBox, isReventa && { backgroundColor: colors.primary + '15' }]}>
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
                    {isReventa && (
                        <View style={{ backgroundColor: colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 6 }}>
                            <Text style={{ fontSize: 8, fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>REVENTA</Text>
                        </View>
                    )}
                </View>
                <View style={styles.itemDetailsRow}>
                    <Text style={styles.itemQty}>{item.cantidad} {item.unidad}</Text>
                    <Text style={styles.itemDot}>•</Text>
                    <Text style={styles.itemSub}>{formatMoney(item.costoUnitario || 0)} / ud</Text>
                </View>

                {item.precioVenta && item.precioVenta > 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <Ionicons name="pricetag-outline" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '800' }}>
                            PVP: {formatMoney(item.precioVenta)}
                        </Text>
                        {item.comisionEspecialista && (
                            <Text style={{ fontSize: 11, color: colors.textMuted, marginLeft: 8 }}>
                                (Comisión: {item.comisionEspecialista}%)
                            </Text>
                        )}
                    </View>
                )}

                {isBajoStock && <Text style={styles.stockWarning}>Bajo Stock (Min: {item.cantidadMinima})</Text>}
                {item.fechaVencimiento && (
                    <Text style={[styles.vencimientoText, { color: estaPorVencer ? colors.primary : colors.textMuted, fontWeight: estaPorVencer ? 'bold' : 'normal' }]}>
                        Vence: {new Date(item.fechaVencimiento).toLocaleDateString()}
                    </Text>
                )}
            </View>
        </View>
    );
};
