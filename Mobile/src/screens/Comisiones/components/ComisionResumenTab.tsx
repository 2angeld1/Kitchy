import React from 'react';
import { View, Text, TouchableOpacity, Animated as RNAnimated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { formatMoney } from '../../../utils/beauty-helpers';

interface Props {
    data: any;
    periodo: string;
    setPeriodo: (p: any) => void;
    colors: any;
    styles: any;
}

export const ComisionResumenTab: React.FC<Props> = ({ data, periodo, setPeriodo, colors, styles }) => {
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

            {/* Resumen General */}
            {data?.resumen && (
                <Animated.View entering={FadeInDown.delay(100)} style={styles.resumenCard}>
                    <Text style={styles.labelResumen}>
                        Ingreso {periodo === 'hoy' ? 'de Hoy' : periodo === 'semana' ? 'de la Semana' : periodo === 'quincena' ? 'de la Quincena' : 'del Mes'}
                    </Text>
                    <Text style={styles.montoGeneral}>{formatMoney(data.resumen.totalGeneral)}</Text>
                    <Text style={styles.descResumen}>{data.resumen.totalServicios} servicios realizados en este {periodo}</Text>

                    <View style={styles.rowMonto}>
                        <View style={[styles.cardMonto, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                            <Text style={[styles.especialistaLabel, { color: '#8b5cf6' }]}>ESPECIALISTAS</Text>
                            <Text style={[styles.especialistaMonto, { color: '#8b5cf6' }]}>{formatMoney(data.resumen.totalEspecialistas)}</Text>
                        </View>
                        <View style={[styles.cardMonto, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                            <Text style={[styles.especialistaLabel, { color: '#10b981' }]}>GANANCIA LOCAL</Text>
                            <Text style={[styles.especialistaMonto, { color: '#10b981' }]}>{formatMoney(data.resumen.totalDueno)}</Text>
                        </View>
                    </View>

                    {data.config && (
                        <View style={styles.configMeta}>
                            <Ionicons 
                                name={data.config.tipo === 'fijo' ? 'lock-closed-outline' : 'flash-outline'} 
                                size={14} 
                                color={colors.primary} 
                            />
                            <Text style={[styles.metaText, { color: colors.primary, fontWeight: '800' }]}>
                                {data.config.tipo === 'fijo' ? 'MODO FIJO ACTIVO' : 'MODO ESCALONADO ACTIVO'}
                            </Text>
                        </View>
                    )}
                </Animated.View>
            )}

            {/* Reglas Activas (Mini Leyenda) */}
            {data.config && (
                <Animated.View entering={FadeInDown.delay(200)} style={styles.infoBento}>
                    <Text style={[styles.sectionTitle, { fontSize: 13, marginBottom: 8 }]}>Reglas de Comisionado</Text>
                    {data.config.tipo === 'fijo' ? (
                        <View style={{ backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border }}>
                            <Text style={{ fontSize: 12, fontWeight: '800', color: colors.textPrimary }}>
                                🔒 Comisión fija: <Text style={{ color: colors.primary }}>{data.config.fijo?.porcentajeBarbero || 50}%</Text> para el especialista
                            </Text>
                        </View>
                    ) : data.config.escalonado?.length > 0 ? (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                            {data.config.escalonado.map((t: any, i: number) => (
                                <View key={i} style={{ backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
                                    <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textPrimary }}>
                                        {t.desde}-{t.hasta} serv: <Text style={{ color: colors.primary }}>{t.porcentajeBarbero}%</Text>
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : null}
                </Animated.View>
            )}

            <Text style={styles.sectionTitle}>Desglose por Especialista</Text>

            {data?.especialistas?.map((esp: any, idx: number) => (
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
                                        <Text style={{ fontSize: 10, fontWeight: '900', color: colors.primary }}>{esp.porcentajeActual}%</Text>
                                    </View>
                                </View>
                                <Text style={styles.espSubtitle}>{esp.totalServicios} servicios realizados en este {periodo}</Text>
                            </View>
                        </View>
                        <View style={styles.montoCol}>
                            <Text style={styles.montoEsp}>{formatMoney(esp.montoEspecialista)}</Text>
                            <Text style={styles.montoTotalEsp}>de {formatMoney(esp.totalIngreso)}</Text>
                        </View>
                    </View>
                </Animated.View>
            ))}

            {(!data?.especialistas || data.especialistas.length === 0) && (
                <View style={styles.emptyContainer}>
                    <Ionicons name="cut-outline" size={64} color={colors.textMuted} />
                    <Text style={styles.emptyTitle}>Sin servicios este mes</Text>
                    <Text style={styles.emptySubtitle}>
                        Registra ventas asignando un especialista para ver las comisiones aquí.
                    </Text>
                </View>
            )}
        </View>
    );
};
