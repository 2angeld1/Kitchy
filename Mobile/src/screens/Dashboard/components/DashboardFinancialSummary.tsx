import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Props {
    data: any;
    colors: any;
    styles: any;
}

export const DashboardFinancialSummary: React.FC<Props> = ({ data, colors, styles }) => {
    return (
        <Animated.View entering={FadeInDown.springify().damping(15).delay(480)} style={styles.glassSection}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={styles.cardLabel}>Finanzas del Mes</Text>
            </View>
            <View style={styles.financialRow}>
                <View style={styles.financialIndicator}>
                    <Text style={styles.indicatorLabel}>Ganancia</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                        <Text style={styles.indicatorValuePositive}>${Number(data.finanzas.gananciaMes).toFixed(0)}</Text>
                        <View style={[styles.growthBadge, { backgroundColor: Number(data.finanzas.crecimientoGanancia) >= 0 ? '#10b981' : '#ef4444' }]}>
                            <Text style={styles.growthText}>{Number(data.finanzas.crecimientoGanancia) >= 0 ? '+' : ''}{data.finanzas.crecimientoGanancia}%</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.financialIndicator}>
                    <Text style={styles.indicatorLabel}>Insumos</Text>
                    <Text style={styles.indicatorValue}>${Number(data.finanzas.costosMes).toFixed(0)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.financialIndicator}>
                    <Text style={styles.indicatorLabel}>Gastos</Text>
                    <Text style={styles.indicatorValue}>${Number(data.finanzas.gastosMes).toFixed(0)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.financialIndicator}>
                    <Text style={styles.indicatorLabel}>Merma</Text>
                    <Text style={styles.indicatorValuePrimary}>${Number(data.finanzas.mermaMes).toFixed(0)}</Text>
                </View>
            </View>
        </Animated.View>
    );
};
