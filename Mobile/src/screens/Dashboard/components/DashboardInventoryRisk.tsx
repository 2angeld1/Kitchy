import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Props {
    data: any;
    colors: any;
    styles: any;
}

export const DashboardInventoryRisk: React.FC<Props> = ({ data, colors, styles }) => {
    return (
        <Animated.View entering={FadeInDown.springify().damping(15).delay(450)} style={styles.glassSection}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="cube-outline" size={20} color="#f59e0b" />
                    <Text style={[styles.sectionTitle, { marginLeft: 0, fontSize: 16 }]}>Control de Inventario</Text>
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{data.inventario.totalItems} insumos</Text>
            </View>

            {data.inventario.productosEnRiesgo.length > 0 ? (
                <View style={{ marginBottom: 10 }}>
                    <Text style={{ color: colors.primary, fontSize: 11, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' }}>⚠️ Recetas con ingredientes escasos</Text>
                    {data.inventario.productosEnRiesgo.map((prod: any, idx: number) => (
                        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, opacity: 0.9 }}>
                            <Text style={{ color: colors.textPrimary, fontSize: 14 }}>{prod.nombre}</Text>
                            <View style={{ flexDirection: 'row', gap: 4 }}>
                                {prod.ingredientesFaltantes.map((ing: string, iIdx: number) => (
                                    <View key={iIdx} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                        <Text style={{ color: '#ef4444', fontSize: 10 }}>{ing}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </View>
            ) : (
                <View style={{ padding: 10, alignItems: 'center' }}>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>Todas tus recetas tienen insumos completos ✅</Text>
                </View>
            )}
        </Animated.View>
    );
};
