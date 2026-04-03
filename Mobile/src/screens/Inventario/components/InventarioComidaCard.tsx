import React from 'react';
import { View, Text } from 'react-native';
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

export const InventarioComidaCard: React.FC<Props> = ({
    item, colors, styles, estaPorVencer, isBajoStock
}) => {
    const icon = getInventoryIcon(item.categoria, 'COMIDA');

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.itemSub}>{formatMoney(item.costoUnitario || 0)} / ud</Text>
                    <Text style={[styles.itemSub, { marginHorizontal: 4 }]}>•</Text>
                    <Text style={[styles.itemSub, { color: colors.textSecondary }]}>Costo Total: {formatMoney(item.cantidad * (item.costoUnitario || 0))}</Text>
                </View>

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
