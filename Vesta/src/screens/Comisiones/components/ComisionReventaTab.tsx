import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { formatMoney } from '../../../utils/beauty-helpers';
import { KitchyInput } from '../../../components/KitchyInput';
import { KitchyButton } from '../../../components/KitchyButton';

interface Props {
    data: any;
    periodo: string;
    setPeriodo: (p: any) => void;
    reventaPct: string;
    setReventaPct: (v: string) => void;
    handleSaveReventa: () => void;
    isSavingReventa: boolean;
    colors: any;
    styles: any;
}

export const ComisionReventaTab: React.FC<Props> = ({ 
    data, periodo, setPeriodo, reventaPct, setReventaPct, handleSaveReventa, isSavingReventa, colors, styles 
}) => {
    return (
        <View style={styles.scrollContent}>
            {/* Period Selector */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {['hoy', 'semana', 'quincena', 'mes'].map((p) => (
                    <TouchableOpacity 
                        key={p} 
                        onPress={() => setPeriodo(p as any)}
                        style={{ 
                            paddingHorizontal: 12, 
                            paddingVertical: 6, 
                            borderRadius: 20, 
                            backgroundColor: periodo === p ? colors.primary : colors.surface,
                            borderWidth: 1,
                            borderColor: periodo === p ? colors.primary : colors.border
                        }}
                    >
                        <Text style={{ 
                            fontSize: 10, 
                            fontWeight: '800', 
                            textTransform: 'uppercase',
                            color: periodo === p ? '#fff' : colors.textSecondary 
                        }}>{p}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Resumen de Reventa */}
            <Animated.View entering={FadeInDown.delay(100)} style={styles.resumenCard}>
                <Text style={styles.labelResumen}>Ventas de Productos (Reventa)</Text>
                <Text style={styles.montoGeneral}>{formatMoney(parseFloat(data?.resumen?.totalReventaIngreso || '0'))}</Text>
                <Text style={styles.descResumen}>Comisiones generadas por venta de productos</Text>

                <View style={styles.rowMonto}>
                    <View style={[styles.cardMonto, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                        <Text style={[styles.especialistaLabel, { color: '#8b5cf6' }]}>COMISIÓN BARBEROS</Text>
                        <Text style={[styles.especialistaMonto, { color: '#8b5cf6' }]}>{formatMoney(parseFloat(data?.resumen?.totalReventaComision || '0'))}</Text>
                    </View>
                    <View style={[styles.cardMonto, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                        <Text style={[styles.especialistaLabel, { color: '#10b981' }]}>GANANCIA LOCAL</Text>
                        <Text style={[styles.especialistaMonto, { color: '#10b981' }]}>{formatMoney(parseFloat(data?.resumen?.totalReventaIngreso || '0') - parseFloat(data?.resumen?.totalReventaComision || '0'))}</Text>
                    </View>
                </View>

                <View style={styles.configMeta}>
                    <Ionicons name="pricetag" size={14} color={colors.primary} />
                    <Text style={[styles.metaText, { color: colors.primary, fontWeight: '800' }]}>
                        COMISIÓN GLOBAL: {reventaPct}%
                    </Text>
                </View>
            </Animated.View>

            {/* Config rápida */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.infoBento}>
                <Text style={[styles.sectionTitle, { fontSize: 13, marginBottom: 8 }]}>Configurar % de Reventa</Text>
                <View style={{ gap: 12, marginBottom: 12 }}>
                    <View style={{ 
                        backgroundColor: colors.surface, borderRadius: 16, padding: 20, 
                        borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10
                    }}>
                        <KitchyInput
                            value={reventaPct}
                            onChangeText={setReventaPct}
                            keyboardType="numeric"
                            placeholder="10"
                            style={{ height: 60, width: 80, marginBottom: 0, textAlign: 'center', fontSize: 32, fontWeight: '900', color: colors.primary }}
                            containerStyle={{ marginBottom: 0 }}
                        />
                        <Text style={{ fontSize: 24, fontWeight: '900', color: colors.textMuted }}>% de Comisión Global</Text>
                    </View>
                    <KitchyButton
                        title="Guardar Cambios de Reventa"
                        onPress={handleSaveReventa}
                        loading={isSavingReventa}
                        style={{ width: '100%', height: 50 }}
                    />
                </View>
                <Text style={styles.infoText}>
                    ℹ️ Este porcentaje se aplica a todos los productos de reventa. Puedes sobreescribirlo por producto desde el Inventario.
                </Text>
            </Animated.View>

            {/* Desglose por Especialista */}
            <Text style={styles.sectionTitle}>Desglose por Especialista</Text>

            {data?.reventaEspecialistas?.map((esp: any, idx: number) => (
                <Animated.View
                    key={esp.id}
                    entering={FadeInDown.delay(300 + idx * 80)}
                    style={styles.especialistaCard}
                >
                    <View style={styles.especialistaRow}>
                        <View style={styles.espInfoRow}>
                            <View style={styles.avatarPlaceholder}>
                                <Ionicons name="person" size={22} color="#8b5cf6" />
                            </View>
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Text style={styles.espName}>{esp.nombre}</Text>
                                    <View style={{ backgroundColor: `${colors.primary}15`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                                        <Text style={{ fontSize: 10, fontWeight: '900', color: colors.primary }}>{esp.porcentajeReventa}%</Text>
                                    </View>
                                </View>
                                <Text style={styles.espSubtitle}>{esp.totalProductosVendidos} productos vendidos</Text>
                            </View>
                        </View>
                        <View style={styles.montoCol}>
                            <Text style={styles.montoEsp}>{formatMoney(esp.comisionReventa)}</Text>
                            <Text style={styles.montoTotalEsp}>de {formatMoney(esp.totalIngresoReventa)}</Text>
                        </View>
                    </View>

                    {/* Detalle de productos vendidos */}
                    {esp.detalle?.length > 0 && (
                        <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
                            {esp.detalle.map((d: any, di: number) => (
                                <View key={di} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>{d.cantidad}x {d.producto}</Text>
                                    <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '700' }}>+{formatMoney(d.comision)}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </Animated.View>
            ))}

            {(!data?.reventaEspecialistas || data.reventaEspecialistas.length === 0) && (
                <View style={styles.emptyContainer}>
                    <Ionicons name="pricetag-outline" size={64} color={colors.textMuted} />
                    <Text style={styles.emptyTitle}>Sin ventas de reventa</Text>
                    <Text style={styles.emptySubtitle}>
                        Cuando tus barberos vendan productos (cera, sodas, etc.) las comisiones aparecerán aquí.
                    </Text>
                </View>
            )}
        </View>
    );
};
