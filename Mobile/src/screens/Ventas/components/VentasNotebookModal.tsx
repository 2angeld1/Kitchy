import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface VentasNotebookModalProps {
    visible: boolean;
    onClose: () => void;
    ventas: any[];
    onConfirm: (venta: any) => void;
    isAnalyzing: boolean;
    colors: any;
}

export const VentasNotebookModal: React.FC<VentasNotebookModalProps> = ({
    visible,
    onClose,
    ventas,
    onConfirm,
    isAnalyzing,
    colors
}) => {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Animated.View 
                    entering={SlideInDown}
                    style={[styles.container, { backgroundColor: colors.card }]}
                >
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.title, { color: colors.textPrimary }]}>Ventas Detectadas</Text>
                            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Toca una venta para importarla al POS</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {isAnalyzing ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Caitlyn está leyendo tu cuaderno...</Text>
                        </View>
                    ) : ventas.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={48} color={colors.border} />
                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No se detectaron ventas legibles</Text>
                        </View>
                    ) : (
                        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                            {ventas.map((venta, index) => (
                                <TouchableOpacity 
                                    key={index}
                                    onPress={() => onConfirm(venta)}
                                    style={[styles.ventaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                >
                                    <View style={styles.ventaHeader}>
                                        <Text style={[styles.clienteName, { color: colors.textPrimary }]}>{venta.cliente || 'Venta General'}</Text>
                                        <Text style={[styles.ventaTotal, { color: colors.primary }]}>${venta.total?.toFixed(2)}</Text>
                                    </View>
                                    
                                    <View style={styles.itemsList}>
                                        {venta.items?.map((item: any, idx: number) => (
                                            <Text key={idx} style={[styles.itemText, { color: colors.textSecondary }]}>
                                                • {item.cantidad}x {item.nombre} - ${item.precio?.toFixed(2)}
                                            </Text>
                                        ))}
                                    </View>

                                    <View style={styles.footerRow}>
                                        {venta.metodoPago && (
                                            <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
                                                <Text style={[styles.badgeText, { color: colors.primary }]}>{venta.metodoPago.toUpperCase()}</Text>
                                            </View>
                                        )}
                                        <Text style={[styles.importText, { color: colors.primary }]}>Importar Pedido →</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    <TouchableOpacity 
                        onPress={onClose} 
                        style={[styles.mainBtn, { backgroundColor: colors.primary }]}
                    >
                        <Text style={styles.mainBtnText}>Entendido</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: '85%',
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 2,
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        marginBottom: 20,
    },
    ventaCard: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    ventaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    clienteName: {
        fontSize: 16,
        fontWeight: '800',
        flex: 1,
    },
    ventaTotal: {
        fontSize: 18,
        fontWeight: '900',
    },
    itemsList: {
        marginBottom: 12,
    },
    itemText: {
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 18,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
    },
    importText: {
        fontSize: 13,
        fontWeight: '800',
    },
    loadingContainer: {
        padding: 60,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },
    emptyContainer: {
        padding: 60,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 14,
        fontWeight: '700',
    },
    mainBtn: {
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
    }
});
