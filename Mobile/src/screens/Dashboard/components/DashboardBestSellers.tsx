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
                <Text style={styles.sectionTitle}>M\u00e1s Vendidos</Text>
            </View>

            <View style={styles.listContainer}>
                {data.productosMasVendidos && data.productosMasVendidos.length > 0 ? (
                    data.productosMasVendidos.map((prod: any, idx: number) => (
                        <Animated.View
                            key={idx}
                            entering={FadeInDown.duration(300).delay(600 + (idx * 100))}
                            style={[styles.glassListItem, { borderBottomColor: idx === data.productosMasVendidos.length - 1 ? 'transparent' : colors.border }]}
                        >
                            <View style={styles.listItemRank}>
                                <Text style={styles.listItemRankText}>{idx + 1}</Text>
                            </View>
                            <View style={styles.listItemInfo}>
                                <Text style={styles.listItemTitle} numberOfLines={1}>{prod.nombre}</Text>
                                <Text style={styles.listItemSubtitle}>{prod.cantidad} unid.</Text>
                            </View>
                            <View style={styles.listItemRightBadge}>
                                <Text style={styles.listItemRightBadgeText}>${Number(prod.total).toFixed(0)}</Text>
                            </View>
                        </Animated.View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>A\u00fan no hay ventas registradas.</Text>
                )}
            </View>
        </Animated.View>
    );
};
