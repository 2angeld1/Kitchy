import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Producto } from '../../../hooks/useVentas';

interface Props {
    producto: Producto;
    index: number;
    cantidadEnCarrito: number;
    onPress: (producto: Producto) => void;
    colors: any;
    styles: any;
}

export const VentasProductCard: React.FC<Props> = ({ producto, index, cantidadEnCarrito, onPress, colors, styles }) => {
    return (
        <Animated.View
            entering={FadeInDown.delay(index * 50)}
            key={producto._id}
        >
            <TouchableOpacity
                style={[
                    styles.productCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    producto.insuficiente && { opacity: 0.7, borderColor: '#ef4444' }
                ]}
                onPress={() => onPress(producto)}
                activeOpacity={0.7}
            >
                {producto.insuficiente && (
                    <View style={styles.stockBadge}>
                        <Text style={styles.stockBadgeText}>SIN STOCK</Text>
                    </View>
                )}

                {cantidadEnCarrito > 0 && (
                    <View style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: colors.primary,
                        minWidth: 26,
                        height: 26,
                        borderRadius: 13,
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10,
                        borderWidth: 2,
                        borderColor: colors.card,
                        elevation: 4,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                    }}>
                        <Text style={{ color: 'white', fontSize: 13, fontWeight: '900' }}>
                            {cantidadEnCarrito}
                        </Text>
                    </View>
                )}
                
                <View style={[styles.imagePlaceholder, { backgroundColor: colors.background, overflow: 'hidden' }]}>
                    {producto.imagen ? (
                        <Image
                            source={{ uri: producto.imagen }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                        />
                    ) : (
                        <Ionicons
                            name={producto.categoria === 'comida' ? 'fast-food' : producto.categoria === 'bebida' ? 'water' : producto.categoria === 'postre' ? 'ice-cream' : 'cube'}
                            size={48}
                            color={colors.textMuted}
                            style={{ opacity: 0.5 }}
                        />
                    )}
                </View>

                <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>
                        {producto.nombre}
                    </Text>

                    {producto.insuficiente && producto.faltantes && (
                        <Text style={styles.faltantesText} numberOfLines={1}>
                            Falta: {producto.faltantes.join(', ')}
                        </Text>
                    )}

                    <Text style={[styles.productPrice, { color: colors.primary }]}>
                        ${(Number(producto.precio) || 0).toFixed(2)}
                    </Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};
