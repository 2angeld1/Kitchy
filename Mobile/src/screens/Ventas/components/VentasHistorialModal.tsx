import React, { useState, useMemo } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, FlatList, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, Negocio } from '../../../context/AuthContext';

const { height, width } = Dimensions.get('window');

interface VentasHistorialModalProps {
    visible: boolean;
    onClose: () => void;
    ventas: any[];
    colors: any;
    onEdit?: (venta: any) => void;
    highlightVentaId?: string | null;
}

export const VentasHistorialModal = ({ visible, onClose, ventas, colors, onEdit, highlightVentaId }: VentasHistorialModalProps) => {
    const { user } = useAuth();
    const [ventaSeleccionada, setVentaSeleccionada] = useState<any>(null);

    const esBelleza = useMemo(() => {
        const negocioActual = typeof user?.negocioActivo === 'object'
            ? user.negocioActivo as Negocio
            : (user?.negocioIds?.find(n => (typeof n === 'object' ? n._id : n) === user?.negocioActivo) as Negocio);
        return negocioActual?.categoria === 'BELLEZA';
    }, [user]);

    // Efecto para abrir el detalle si hay un highlight
    React.useEffect(() => {
        if (visible && highlightVentaId) {
            const venta = ventas.find(v => v._id === highlightVentaId);
            if (venta) setVentaSeleccionada(venta);
        }
    }, [visible, highlightVentaId, ventas]);

    const renderItem = ({ item }: { item: any }) => {
        const nombreEspecialista = item.especialista?.nombre || 'General';
        
        return (
            <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setVentaSeleccionada(item)}
                style={[styles.ventaCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
                <View style={styles.ventaHeader}>
                    <View style={styles.ventaBadge}>
                        <Text style={[styles.ventaBadgeText, { color: colors.primary }]}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={[styles.ventaMetodo, { color: colors.textSecondary }]}>
                            {item.metodoPago === 'combinado' && item.pagoCombinado?.length > 0
                                ? `COMBINADO (${item.pagoCombinado.map((c: any) => c.metodo).join(' + ').toUpperCase()})`
                                : item.metodoPago?.toUpperCase()}
                        </Text>
                        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                    </View>
                </View>
                
                <View style={styles.ventaBody}>
                    <View style={styles.ventaInfo}>
                        <Text style={[styles.ventaCliente, { color: colors.textPrimary }]} numberOfLines={1}>
                            {item.cliente || 'Consumidor Final'}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            {esBelleza && (
                                <View style={{ backgroundColor: colors.primary + '10', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                    <Text style={{ fontSize: 10, color: colors.primary, fontWeight: '700' }}>{nombreEspecialista.split(' ')[0]}</Text>
                                </View>
                            )}
                            <Text style={[styles.ventaFecha, { color: colors.textSecondary }]}>
                                {new Date(item.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.ventaTotal, { color: colors.primary }]}>
                        ${(Number(item.total) || 0).toFixed(2)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.title, { color: colors.textPrimary }]}>
                                {esBelleza ? 'Servicios Recientes' : 'Ventas Recientes'}
                            </Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                {ventas.length} {esBelleza ? 'servicios registrados' : 'ventas registradas'}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={ventas}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.listContainer}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="receipt-outline" size={64} color={colors.border} />
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                    Aún no hay ventas registradas.
                                </Text>
                            </View>
                        }
                    />
                </View>

                {/* Modal de Detalle */}
                <Modal
                    visible={!!ventaSeleccionada}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setVentaSeleccionada(null)}
                >
                    <View style={styles.detailOverlay}>
                        <View style={[styles.detailContent, { backgroundColor: colors.card }]}>
                            <View style={styles.detailHeader}>
                                <View>
                                    <Text style={[styles.detailTitle, { color: colors.textPrimary }]}>Detalle de Venta</Text>
                                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                                        {ventaSeleccionada && new Date(ventaSeleccionada.createdAt).toLocaleString()}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => setVentaSeleccionada(null)}>
                                    <Ionicons name="close-circle" size={28} color={colors.textMuted} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={{ maxHeight: height * 0.4 }}>
                                <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10, marginBottom: 15 }}>
                                    <Text style={{ fontSize: 10, fontWeight: '900', color: colors.textSecondary, textTransform: 'uppercase' }}>Cliente</Text>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.textPrimary }}>{ventaSeleccionada?.cliente || 'Consumidor Final'}</Text>
                                </View>

                                <Text style={{ fontSize: 10, fontWeight: '900', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 10 }}>Productos</Text>
                                {ventaSeleccionada?.items.map((item: any, idx: number) => (
                                    <View key={idx} style={styles.detailItem}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                            <View style={[styles.itemQty, { backgroundColor: colors.primary + '15' }]}>
                                                <Text style={{ fontSize: 12, fontWeight: '900', color: colors.primary }}>{item.cantidad}x</Text>
                                            </View>
                                            <Text style={{ flex: 1, fontSize: 14, color: colors.textPrimary, fontWeight: '600' }} numberOfLines={1}>
                                                {item.nombreProducto}
                                            </Text>
                                        </View>
                                        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
                                            ${(Number(item.subtotal) || 0).toFixed(2)}
                                        </Text>
                                    </View>
                                ))}
                            </ScrollView>

                            <View style={[styles.detailFooter, { borderTopColor: colors.border }]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>Método de Pago</Text>
                                    <Text style={{ fontSize: 12, fontWeight: '900', color: colors.textPrimary, textTransform: 'uppercase' }}>
                                        {ventaSeleccionada?.metodoPago === 'combinado' && ventaSeleccionada?.pagoCombinado?.length > 0
                                            ? `Combinado (${ventaSeleccionada.pagoCombinado.map((c: any) => c.metodo).join(' + ')})`
                                            : ventaSeleccionada?.metodoPago}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                                    <Text style={{ fontSize: 18, fontWeight: '900', color: colors.textPrimary }}>TOTAL</Text>
                                    <Text style={{ fontSize: 24, fontWeight: '900', color: colors.primary }}>
                                        ${(Number(ventaSeleccionada?.total) || 0).toFixed(2)}
                                    </Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TouchableOpacity 
                                    style={[styles.printButton, { flex: 1, backgroundColor: colors.primary }]}
                                    onPress={() => setVentaSeleccionada(null)}
                                >
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Cerrar</Text>
                                </TouchableOpacity>
                                {onEdit && (
                                    <TouchableOpacity 
                                        style={[styles.printButton, { flex: 1, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary }]}
                                        onPress={() => {
                                            if (ventaSeleccionada) {
                                                onEdit(ventaSeleccionada);
                                                setVentaSeleccionada(null);
                                            }
                                        }}
                                    >
                                        <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Editar</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: height * 0.85,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    closeButton: {
        padding: 8,
    },
    listContainer: {
        paddingBottom: 40,
    },
    ventaCard: {
        borderRadius: 22,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1.5,
    },
    ventaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    ventaBadge: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    ventaBadgeText: {
        fontSize: 11,
        fontWeight: '800',
    },
    ventaMetodo: {
        fontSize: 11,
        fontWeight: '800',
    },
    ventaBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    ventaInfo: {
        flex: 1,
        marginRight: 10,
    },
    ventaCliente: {
        fontSize: 16,
        fontWeight: '900',
        marginBottom: 2,
    },
    ventaFecha: {
        fontSize: 11,
        fontWeight: '600',
    },
    ventaTotal: {
        fontSize: 19,
        fontWeight: '900',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
        paddingHorizontal: 40,
    },
    // Estilos del Detalle
    detailOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    detailContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 30,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    detailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    detailTitle: {
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemQty: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    detailFooter: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
    },
    printButton: {
        marginTop: 24,
        height: 54,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
