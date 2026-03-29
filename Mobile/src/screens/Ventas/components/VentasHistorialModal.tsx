import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

interface VentasHistorialModalProps {
    visible: boolean;
    onClose: () => void;
    ventas: any[];
    colors: any;
}

export const VentasHistorialModal = ({ visible, onClose, ventas, colors }: VentasHistorialModalProps) => {
    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.ventaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.ventaHeader}>
                <View style={styles.ventaBadge}>
                    <Text style={[styles.ventaBadgeText, { color: colors.primary }]}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <Text style={[styles.ventaMetodo, { color: colors.textSecondary }]}>
                    {item.metodoPago?.toUpperCase()}
                </Text>
            </View>
            
            <View style={styles.ventaBody}>
                <View style={styles.ventaInfo}>
                    <Text style={[styles.ventaCliente, { color: colors.text }]} numberOfLines={1}>
                        {item.cliente || 'Consumidor Final'}
                    </Text>
                    <Text style={[styles.ventaFecha, { color: colors.textSecondary }]}>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                </View>
                <Text style={[styles.ventaTotal, { color: colors.primary }]}>
                    ${(Number(item.total) || 0).toFixed(2)}
                </Text>
            </View>
        </View>
    );

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
                            <Text style={[styles.title, { color: colors.text }]}>Historial de Hoy</Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                {ventas.length} ventas registradas
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.text} />
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
                                    Aún no hay ventas registradas para hoy.
                                </Text>
                            </View>
                        }
                    />
                </View>
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
        height: height * 0.8,
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
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
    },
    closeButton: {
        padding: 8,
    },
    listContainer: {
        paddingBottom: 40,
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
    ventaBadge: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ventaBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    ventaMetodo: {
        fontSize: 12,
        fontWeight: '500',
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
        fontWeight: '600',
        marginBottom: 2,
    },
    ventaFecha: {
        fontSize: 12,
    },
    ventaTotal: {
        fontSize: 18,
        fontWeight: 'bold',
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
        paddingHorizontal: 40,
    },
});
