import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InventarioItemCard } from './InventarioItemCard';

interface Props {
    items: any[];
    categoriaNegocio: string;
    filtro: string;
    colors: any;
    styles: any;
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
    onMovimiento: (item: any, tipo: 'entrada' | 'salida' | 'merma') => void;
}

export const InventarioFruteriaView: React.FC<Props> = ({
    items, categoriaNegocio, filtro, colors, styles, onEdit, onDelete, onMovimiento
}) => {
    // Si hay un filtro específico (ej: stock bajo), mostramos lista plana
    if (filtro !== 'todos') {
        return (
            <>
                {items.map((item, i) => (
                    <InventarioItemCard
                        key={item._id}
                        item={item} index={i}
                        categoriaNegocio={categoriaNegocio}
                        colors={colors} styles={styles}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onMovimiento={onMovimiento}
                    />
                ))}
            </>
        );
    }

    // Clasificación para Frutería: Frutas/Vegetales (reventa) vs Suministros (insumo)
    const productosVenta = items.filter(i => i.categoria === 'reventa');
    const suministros = items.filter(i => i.categoria !== 'reventa');

    return (
        <>
            {productosVenta.length > 0 && (
                <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 4 }}>
                        <Ionicons name="leaf" size={16} color="#10b981" />
                        <Text style={{ fontSize: 13, fontWeight: '900', color: "#10b981", letterSpacing: 1, textTransform: 'uppercase' }}>
                            Frutas y Vegetales ({productosVenta.length})
                        </Text>
                    </View>
                    {productosVenta.map((item, i) => (
                        <InventarioItemCard
                            key={item._id}
                            item={item} index={i}
                            categoriaNegocio={categoriaNegocio}
                            colors={colors} styles={styles}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onMovimiento={onMovimiento}
                        />
                    ))}
                </>
            )}
            
            {suministros.length > 0 && (
                <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: productosVenta.length > 0 ? 20 : 4 }}>
                        <Ionicons name="basket" size={16} color={colors.textMuted} />
                        <Text style={{ fontSize: 13, fontWeight: '900', color: colors.textMuted, letterSpacing: 1, textTransform: 'uppercase' }}>
                            Suministros y Empaques ({suministros.length})
                        </Text>
                    </View>
                    {suministros.map((item, i) => (
                        <InventarioItemCard
                            key={item._id}
                            item={item} index={i}
                            categoriaNegocio={categoriaNegocio}
                            colors={colors} styles={styles}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onMovimiento={onMovimiento}
                        />
                    ))}
                </>
            )}
        </>
    );
};
