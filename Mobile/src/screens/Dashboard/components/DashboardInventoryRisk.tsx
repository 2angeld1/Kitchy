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
            <View style={styles.sectionHeader}>
                <View style={[styles.glassIconSmall, { backgroundColor: colors.background }]}>
                    <Ionicons name="cube-outline" size={18} color="#f59e0b" />
                </View>
                <Text style={styles.sectionTitle}>Control de Inventario</Text>
                <View style={{ flex: 1 }} />
                <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700' }}>{data.inventario.totalItems} Items</Text>
            </View>

            <View style={{ padding: 20 }}>
                {data.inventario.productosEnRiesgo.length > 0 ? (
                    <View>
                        <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            🚨 Productos en Riesgo (Faltan insumos)
                        </Text>
                        {data.inventario.productosEnRiesgo.map((prod: any, idx: number) => (
                            <View key={idx} style={{ 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                justifyContent: 'space-between', 
                                marginBottom: 10,
                                paddingBottom: 10,
                                borderBottomWidth: idx === data.inventario.productosEnRiesgo.length - 1 ? 0 : 1,
                                borderBottomColor: colors.border,
                                opacity: 0.9 
                            }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '600' }}>{prod.nombre}</Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                                        {prod.ingredientesFaltantes.map((ing: string, iIdx: number) => (
                                            <View key={iIdx} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                                                <Text style={{ color: '#ef4444', fontSize: 9, fontWeight: '700' }}>{ing}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                                <Ionicons name="warning" size={18} color="#ef4444" style={{ marginLeft: 8 }} />
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                        </View>
                        <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>Todos tus productos tienen stock suficiente ✅</Text>
                    </View>
                )}
            </View>
        </Animated.View>
    );
};
