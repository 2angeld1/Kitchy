import React from 'react';
import { View, Text, Modal, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { KitchyToolbar } from '../../../components/KitchyToolbar';
import { KitchyButton } from '../../../components/KitchyButton';

interface Props {
    visible: boolean;
    onClose: () => void;
    invoiceItems: any[];
    setInvoiceItems: (items: any[]) => void;
    invoiceMetadata: any;
    setInvoiceMetadata: (meta: any) => void;
    invoiceFiltro: string;
    setInvoiceFiltro: (v: string) => void;
    invoiceItemsFiltrados: any[];
    invoiceStatusCounts: any;
    getInvoiceItemStatus: (item: any) => 'coincide' | 'similar' | 'nuevo' | 'incompleto';
    onConfirm: (items: any[]) => void;
    loading: boolean;
    colors: any;
    styles: any;
}

export const InventarioInvoiceReviewModal: React.FC<Props> = ({
    visible, onClose, invoiceItems, setInvoiceItems, invoiceMetadata, setInvoiceMetadata,
    invoiceFiltro, setInvoiceFiltro, invoiceItemsFiltrados, invoiceStatusCounts, getInvoiceItemStatus,
    onConfirm, loading, colors, styles
}) => {
    const statusColors: Record<string, { bg: string; border: string; text: string; label: string; icon: string }> = {
        coincide: { bg: 'rgba(16, 185, 129, 0.10)', border: '#10b981', text: '#059669', label: 'Coincide', icon: 'checkmark-circle' },
        similar: { bg: 'rgba(245, 158, 11, 0.10)', border: '#f59e0b', text: '#d97706', label: 'Similar', icon: 'help-circle' },
        nuevo: { bg: colors.card, border: colors.border, text: colors.textMuted, label: 'Nuevo', icon: 'add-circle' },
        incompleto: { bg: 'rgba(239, 68, 68, 0.10)', border: '#ef4444', text: '#dc2626', label: 'Incompleto', icon: 'alert-circle' },
    };

    return (
        <Modal visible={visible} animationType="slide">
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <KitchyToolbar title="Revisión de Factura" />

                <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textPrimary }}>
                        Caitlyn detectó {invoiceItems.length} productos
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
                        Verifica la información.
                    </Text>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 8 }}>
                        {Object.entries(statusColors).map(([key, l]) => (
                            <View key={key} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: l.border, marginRight: 4 }} />
                                <Text style={{ fontSize: 11, color: colors.textMuted }}>{l.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                        {(['todos', 'coincide', 'similar', 'nuevo', 'incompleto'] as const).map(estado => {
                            const isActive = invoiceFiltro === estado;
                            const count = invoiceStatusCounts[estado];
                            const chipColor = estado === 'todos' ? colors.primary : statusColors[estado]?.border || colors.textMuted;
                            const label = estado === 'todos' ? 'Todos' : statusColors[estado]?.label || 'Desconocido';

                            return (
                                <TouchableOpacity
                                    key={estado}
                                    onPress={() => setInvoiceFiltro(estado)}
                                    style={{
                                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                                        borderWidth: 1.5, borderColor: isActive ? chipColor : colors.border,
                                        backgroundColor: isActive ? chipColor : 'transparent',
                                    }}
                                >
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: isActive ? '#fff' : chipColor }}>
                                        {label} ({count})
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }}>
                    {invoiceMetadata && (
                        <Animated.View entering={FadeInDown} style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1.5, borderColor: colors.primary }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                                <Ionicons name="business-outline" size={20} color={colors.primary} />
                                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.primary, marginLeft: 8 }}>DATOS FISCALES</Text>
                            </View>
                            <View style={{ gap: 12 }}>
                                <View>
                                    <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', marginBottom: 4 }}>PROVEEDOR</Text>
                                    <TextInput 
                                        style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border }}
                                        value={invoiceMetadata.proveedor}
                                        onChangeText={(text) => setInvoiceMetadata({ ...invoiceMetadata, proveedor: text })}
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', marginBottom: 4 }}>TOTAL</Text>
                                        <TextInput 
                                            style={{ color: colors.primary, fontSize: 18, fontWeight: 'bold', paddingVertical: 4, borderBottomWidth: 2, borderBottomColor: colors.primary }}
                                            value={String(invoiceMetadata.total || '')}
                                            onChangeText={(text) => setInvoiceMetadata({ ...invoiceMetadata, total: parseFloat(text) || 0 })}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>
                            </View>
                        </Animated.View>
                    )}

                    {invoiceItemsFiltrados.map((item: any, index: number) => {
                        const status = getInvoiceItemStatus(item);
                        const sc = statusColors[status];
                        const realIndex = invoiceItems.indexOf(item);

                        return (
                            <Animated.View key={realIndex} entering={FadeInDown.delay(index * 30)} style={{ backgroundColor: sc.bg, padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1.5, borderColor: sc.border }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <TextInput
                                        style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '700', flex: 1 }}
                                        value={item.nombre}
                                        onChangeText={(text) => {
                                            const newItems = [...invoiceItems];
                                            newItems[realIndex] = { ...newItems[realIndex], nombre: text };
                                            setInvoiceItems(newItems);
                                        }}
                                    />
                                    <TouchableOpacity onPress={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== realIndex))}>
                                        <Ionicons name="close-circle" size={22} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 10, color: sc.text }}>Cant.</Text>
                                        <TextInput
                                            style={{ color: colors.textPrimary, borderBottomWidth: 1, borderBottomColor: sc.border }}
                                            value={String(item.cantidad)}
                                            keyboardType="numeric"
                                            onChangeText={(text) => {
                                                const newItems = [...invoiceItems];
                                                newItems[realIndex] = { ...newItems[realIndex], cantidad: parseFloat(text) || 0 };
                                                setInvoiceItems(newItems);
                                            }}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 10, color: sc.text }}>Precio Ud.</Text>
                                        <TextInput
                                            style={{ color: colors.textPrimary, borderBottomWidth: 1, borderBottomColor: sc.border }}
                                            value={String(item.precioUnitario || '')}
                                            keyboardType="numeric"
                                            onChangeText={(text) => {
                                                const newItems = [...invoiceItems];
                                                newItems[realIndex] = { ...newItems[realIndex], precioUnitario: parseFloat(text) || 0 };
                                                setInvoiceItems(newItems);
                                            }}
                                        />
                                    </View>
                                </View>
                            </Animated.View>
                        );
                    })}
                </ScrollView>

                <View style={{ padding: 16, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <KitchyButton title={`Importar (${invoiceItems.length})`} onPress={() => onConfirm(invoiceItems)} loading={loading} />
                    <TouchableOpacity onPress={onClose} style={{ marginTop: 12, alignItems: 'center' }}>
                        <Text style={{ color: colors.textMuted }}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
