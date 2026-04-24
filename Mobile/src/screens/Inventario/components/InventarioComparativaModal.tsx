import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../../context/ThemeContext';
import { lightTheme, darkTheme } from '../../../theme';

interface ComparativaProps {
    visible: boolean;
    onClose: () => void;
    data: {
        resumen: {
            totalItems: number;
            itemsConMovimiento: number;
            valorVariacionTotal: string;
        };
        comparativa: any[];
    } | null;
    loading: boolean;
}

const InventarioComparativaModal: React.FC<ComparativaProps> = ({ visible, onClose, data, loading }) => {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <BlurView intensity={isDark ? 50 : 30} tint={isDark ? "dark" : "light"} style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Cierre de Inventario</Text>
                            <Text style={styles.subtitle}>Comparativa Inicio del Día vs Actual</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.center}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.loadingText}>Calculando variaciones...</Text>
                        </View>
                    ) : data ? (
                        <View style={{ flex: 1 }}>
                            {/* Cards de Resumen */}
                            <View style={styles.resumenContainer}>
                                <View style={[styles.resumenCard, { backgroundColor: isDark ? colors.border : '#F0F4FF' }]}>
                                    <Text style={styles.resumenLabel}>Items Movidos</Text>
                                    <Text style={styles.resumenValue}>{data.resumen.itemsConMovimiento}</Text>
                                </View>
                                <View style={[styles.resumenCard, { backgroundColor: parseFloat(data.resumen.valorVariacionTotal) >= 0 ? (isDark ? '#1a3a2a' : '#E8F5E9') : (isDark ? '#3d1a1a' : '#FFEBEE') }]}>
                                    <Text style={styles.resumenLabel}>Variación Valor</Text>
                                    <Text style={[styles.resumenValue, { color: parseFloat(data.resumen.valorVariacionTotal) >= 0 ? '#4ade80' : '#f87171' }]}>
                                        ${data.resumen.valorVariacionTotal}
                                    </Text>
                                </View>
                            </View>

                            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                                {data.comparativa.filter(c => c.entradas > 0 || c.salidas > 0).map((item, index) => (
                                    <View key={item._id} style={styles.itemRow}>
                                        <View style={styles.itemInfo}>
                                            <Text style={styles.itemName}>{item.nombre}</Text>
                                            <View style={styles.badgeRow}>
                                                <Text style={styles.categoryBadge}>{item.categoria}</Text>
                                                <Text style={styles.unitText}>{item.unidad}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.comparisonData}>
                                            <View style={styles.stockColumns}>
                                                <View style={styles.stockBox}>
                                                    <Text style={styles.stockLabel}>Inicio</Text>
                                                    <Text style={styles.stockVal}>{item.stockInicial}</Text>
                                                </View>
                                                <Ionicons name="arrow-forward" size={14} color={colors.textMuted} style={{ marginHorizontal: 5 }} />
                                                <View style={styles.stockBox}>
                                                    <Text style={styles.stockLabel}>Actual</Text>
                                                    <Text style={styles.stockVal}>{item.stockActual}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.variationRow}>
                                                <Ionicons 
                                                    name={item.variacionNeta >= 0 ? 'trending-up' : 'trending-down'} 
                                                    size={16} 
                                                    color={item.variacionNeta >= 0 ? '#4ade80' : '#f87171'} 
                                                />
                                                <Text style={[styles.variationText, { color: item.variacionNeta >= 0 ? '#4ade80' : '#f87171' }]}>
                                                    {item.variacionNeta > 0 ? '+' : ''}{item.variacionNeta} ({item.variacionPorcentaje}%)
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                                {data.comparativa.filter(c => c.entradas > 0 || c.salidas > 0).length === 0 && (
                                    <View style={styles.emptyState}>
                                        <Ionicons name="stats-chart" size={48} color={colors.border} />
                                        <Text style={styles.emptyText}>No ha habido movimientos de inventario hoy.</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    ) : null}

                    <TouchableOpacity style={styles.footerButton} onPress={onClose}>
                        <Text style={styles.footerButtonText}>Entendido</Text>
                    </TouchableOpacity>
                </View>
            </BlurView>
        </Modal>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    modalContainer: { flex: 1, justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: colors.card,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '85%',
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    title: { fontSize: 24, fontWeight: '900', color: colors.textPrimary },
    subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    closeButton: { padding: 5 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: colors.textSecondary, fontWeight: '700' },
    resumenContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    resumenCard: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent'
    },
    resumenLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 4, fontWeight: '800', textTransform: 'uppercase' },
    resumenValue: { fontSize: 20, fontWeight: '900', color: colors.textPrimary },
    list: { flex: 1 },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 18,
        borderBottomWidth:1,
        borderBottomColor: colors.border
    },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
    categoryBadge: { fontSize: 10, backgroundColor: colors.border, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, color: colors.textSecondary, fontWeight: '800', textTransform: 'uppercase' },
    unitText: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
    comparisonData: { alignItems: 'flex-end' },
    stockColumns: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    stockBox: { alignItems: 'center' },
    stockLabel: { fontSize: 9, color: colors.textMuted, fontWeight: '800', textTransform: 'uppercase' },
    stockVal: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
    variationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    variationText: { fontSize: 13, fontWeight: '900' },
    footerButton: {
        backgroundColor: colors.primary,
        padding: 18,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 15,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4
    },
    footerButtonText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
    emptyState: { padding: 40, alignItems: 'center' },
    emptyText: { textAlign: 'center', color: colors.textMuted, marginTop: 15, fontSize: 14, fontWeight: '600' }
});

export default InventarioComparativaModal;
