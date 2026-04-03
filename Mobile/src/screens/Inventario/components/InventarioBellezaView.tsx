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

export const InventarioBellezaView: React.FC<Props> = ({
    items, categoriaNegocio, filtro, colors, styles, onEdit, onDelete, onMovimiento
}) => {
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

    const reventaItems = items.filter(i => i.categoria === 'reventa');
    const insumoItems = items.filter(i => i.categoria !== 'reventa');

    return (
        <>
            {reventaItems.length > 0 && (
                <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 4 }}>
                        <Ionicons name="pricetag" size={16} color={colors.primary} />
                        <Text style={{ fontSize: 13, fontWeight: '900', color: colors.primary, letterSpacing: 1, textTransform: 'uppercase' }}>Productos de Reventa ({reventaItems.length})</Text>
                    </View>
                    {reventaItems.map((item, i) => (
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
            {insumoItems.length > 0 && (
                <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: reventaItems.length > 0 ? 20 : 4 }}>
                        <Ionicons name="flask" size={16} color={colors.textMuted} />
                        <Text style={{ fontSize: 13, fontWeight: '900', color: colors.textMuted, letterSpacing: 1, textTransform: 'uppercase' }}>Insumos Profesionales ({insumoItems.length})</Text>
                    </View>
                    {insumoItems.map((item, i) => (
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
