import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Props {
    data: any;
    colors: any;
    styles: any;
}

export const DashboardBestSellers: React.FC<Props> = ({ data, colors, styles }) => {
    return (
        <Animated.View entering={FadeInDown.springify().damping(15).delay(550)} style={styles.glassSection}>
            <View style={styles.sectionHeader}>
                <View style={[styles.glassIconSmall, { backgroundColor: colors.background }]}>
                    <Ionicons name="trophy-outline" size={18} color={colors.textPrimary} />
                </View>
                <Text style={styles.sectionTitle}>Más Vendidos</Text>
            </View>

            <View style={styles.listContainer}>
                {data.productosMasVendidos && data.productosMasVendidos.length > 0 ? (
                    data.productosMasVendidos.map((prod: any, idx: number) => {
                        // Colores de ranking dinámicos (Oro, Plata, Bronce)
                        const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
                        const isTop3 = idx < 3;
                        const rankColor = isTop3 ? rankColors[idx] : colors.textPrimary;

                        return (
                            <Animated.View
                                key={idx}
                                entering={FadeInDown.duration(300).delay(600 + (idx * 100))}
                                style={[styles.glassListItem, { borderBottomColor: idx === data.productosMasVendidos.length - 1 ? 'transparent' : colors.border }]}
                            >
                                <View style={[styles.listItemRank, isTop3 && { borderColor: rankColor, backgroundColor: rankColor + '10' }]}>
                                    <Text style={[styles.listItemRankText, isTop3 && { color: rankColor }]}>{idx + 1}</Text>
                                </View>

                                <View style={styles.listItemInfo}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Text style={styles.listItemTitle} numberOfLines={1}>{prod.nombre}</Text>
                                        {idx === 0 && <Ionicons name="sparkles" size={14} color="#FFD700" />}
                                    </View>
                                    <Text style={styles.listItemSubtitle}>{prod.cantidad} unidades vendidas</Text>
                                </View>

                                <View style={[styles.listItemRightBadge, { backgroundColor: isTop3 ? rankColor + '15' : colors.surface }]}>
                                    <Text style={[styles.listItemRightBadgeText, isTop3 && { color: rankColor }]}>
                                        ${Number(prod.total).toFixed(0)}
                                    </Text>
                                </View>
                            </Animated.View>
                        );
                    })
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cart-outline" size={32} color={colors.border} />
                        <Text style={styles.emptyText}>Aún no hay ventas suficientes para el ranking.</Text>
                    </View>
                )}
            </View>
        </Animated.View>
    );
};
