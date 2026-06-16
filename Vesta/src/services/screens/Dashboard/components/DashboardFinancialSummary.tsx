import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Props {
    data: any;
    colors: any;
    styles: any;
}

export const DashboardFinancialSummary: React.FC<Props> = ({ data, colors, styles }) => {
    const ganancia = Number(data.finanzas.gananciaMes);
    const isNegative = ganancia < 0;

    return (
        <Animated.View entering={FadeInDown.springify().damping(15).delay(480)} style={styles.glassSection}>
            <View style={styles.sectionHeader}>
                <View style={[styles.glassIconSmall, { backgroundColor: colors.background }]}>
                    <Ionicons name="bar-chart-outline" size={18} color="#10b981" />
                </View>
                <Text style={styles.sectionTitle}>Análisis de Rentabilidad</Text>
            </View>

            <View style={{ paddingVertical: 24, paddingHorizontal: 16 }}>
                <View style={[styles.financialRow, { justifyContent: 'space-around' }]}>
                    <View style={[styles.financialIndicator, { flex: 1.5 }]}>
                        <Text style={styles.indicatorLabel}>Utilidad Neta</Text>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 4 }}>
                            <Text style={[styles.indicatorValuePositive, { fontSize: 18, color: isNegative ? '#ef4444' : '#10b981' }]}>
                                ${ganancia.toLocaleString()}
                            </Text>
                            <View style={[styles.growthBadge, { marginTop: 4, backgroundColor: Number(data.finanzas.crecimientoGanancia) >= 0 ? '#10b981' : '#ef4444' }]}>
                                <Text style={styles.growthText}>{Number(data.finanzas.crecimientoGanancia) >= 0 ? '↑' : '↓'}{Math.abs(data.finanzas.crecimientoGanancia)}%</Text>
                            </View>
                        </View>
                    </View>
                    
                    <View style={styles.divider} />
                    
                    <View style={styles.financialIndicator}>
                        <Text style={styles.indicatorLabel}>Costos</Text>
                        <Text style={[styles.indicatorValue, { marginTop: 4 }]}>${Number(data.finanzas.costosMes).toLocaleString()}</Text>
                    </View>

                    <View style={styles.divider} />
                    
                    <View style={styles.financialIndicator}>
                        <Text style={styles.indicatorLabel}>Gastos</Text>
                        <Text style={[styles.indicatorValue, { marginTop: 4 }]}>${Number(data.finanzas.gastosMes).toLocaleString()}</Text>
                    </View>

                    <View style={styles.divider} />
                    
                    <View style={styles.financialIndicator}>
                        <Text style={styles.indicatorLabel}>Merma</Text>
                        <Text style={[styles.indicatorValuePrimary, { color: '#ef4444', marginTop: 4 }]}>${Number(data.finanzas.mermaMes).toLocaleString()}</Text>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
};
