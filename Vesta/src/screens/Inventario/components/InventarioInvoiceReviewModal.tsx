import React from 'react';
import { View, Text, Modal, ScrollView, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    onConfirm: (items: any[], metadata: any) => void;
    loading: boolean;
    colors: any;
    styles: any;
}

export const InventarioInvoiceReviewModal: React.FC<Props> = ({
    visible, onClose, invoiceItems, setInvoiceItems, invoiceMetadata, setInvoiceMetadata,
    invoiceFiltro, setInvoiceFiltro, invoiceItemsFiltrados, invoiceStatusCounts, getInvoiceItemStatus,
    onConfirm, loading, colors, styles
}) => {
    const insets = useSafeAreaInsets();
    const statusColors: Record<string, { bg: string; border: string; text: string; label: string; icon: string }> = {
        coincide: { bg: 'rgba(16, 185, 129, 0.10)', border: '#10b981', text: '#059669', label: 'Coincide', icon: 'checkmark-circle' },
        similar: { bg: 'rgba(245, 158, 11, 0.10)', border: '#f59e0b', text: '#d97706', label: 'Similar', icon: 'help-circle' },
        nuevo: { bg: colors.card, border: colors.border, text: colors.textMuted, label: 'Nuevo', icon: 'add-circle' },
        incompleto: { bg: 'rgba(239, 68, 68, 0.10)', border: '#ef4444', text: '#dc2626', label: 'Incompleto', icon: 'alert-circle' },
    };

    return (
        <Modal visible={visible} animationType="slide">
            <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
                <KitchyToolbar 
                    title="Revisión de Factura" 
                    showNotifications={false}
                    showUserMenuButton={false}
                    showSwitchNegocioButton={false}
                    onBack={onClose}
                />

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
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', marginBottom: 4 }}>PROVEEDOR</Text>
                                        <TextInput 
                                            style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border }}
                                            value={invoiceMetadata.proveedor}
                                            onChangeText={(text) => setInvoiceMetadata({ ...invoiceMetadata, proveedor: text })}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', marginBottom: 4 }}>RECEPTOR</Text>
                                        <TextInput 
                                            style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border }}
                                            value={invoiceMetadata.receptor}
                                            onChangeText={(text) => setInvoiceMetadata({ ...invoiceMetadata, receptor: text })}
                                        />
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flex: 2 }}>
                                        <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', marginBottom: 4 }}>RUC</Text>
                                        <TextInput 
                                            style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border }}
                                            value={invoiceMetadata.ruc}
                                            onChangeText={(text) => setInvoiceMetadata({ ...invoiceMetadata, ruc: text })}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', marginBottom: 4 }}>DV</Text>
                                        <TextInput 
                                            style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border }}
                                            value={invoiceMetadata.dv}
                                            onChangeText={(text) => setInvoiceMetadata({ ...invoiceMetadata, dv: text })}
                                        />
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', marginBottom: 4 }}>NRO. FACTURA</Text>
                                        <TextInput 
                                            style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border }}
                                            value={invoiceMetadata.nroFactura}
                                            onChangeText={(text) => setInvoiceMetadata({ ...invoiceMetadata, nroFactura: text })}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', marginBottom: 4 }}>FECHA</Text>
                                        <TextInput 
                                            style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border }}
                                            value={invoiceMetadata.fecha}
                                            onChangeText={(text) => setInvoiceMetadata({ ...invoiceMetadata, fecha: text })}
                                        />
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', marginBottom: 4 }}>SUBTOTAL</Text>
                                        <TextInput 
                                            style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border }}
                                            value={String(invoiceMetadata.subtotal || '')}
                                            onChangeText={(text) => setInvoiceMetadata({ ...invoiceMetadata, subtotal: parseFloat(text) || 0 })}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700', marginBottom: 4 }}>ITBMS (7%)</Text>
                                        <TextInput 
                                            style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border }}
                                            value={String(invoiceMetadata.itbms || '')}
                                            onChangeText={(text) => setInvoiceMetadata({ ...invoiceMetadata, itbms: parseFloat(text) || 0 })}
                                            keyboardType="numeric"
                                        />
                                    </View>
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
                                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 10, color: sc.text, fontWeight: '700' }}>CANT. FACTURA</Text>
                                        <TextInput
                                            style={{ color: colors.textPrimary, borderBottomWidth: 1.5, borderBottomColor: sc.border, paddingVertical: 4, fontWeight: '700' }}
                                            value={String(item.cantidad || 0)}
                                            keyboardType="numeric"
                                            onChangeText={(text) => {
                                                const newItems = [...invoiceItems];
                                                newItems[realIndex] = { ...newItems[realIndex], cantidad: parseFloat(text) || 0 };
                                                setInvoiceItems(newItems);
                                            }}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 10, color: sc.text, fontWeight: '700' }}>UDS/PACK</Text>
                                        <TextInput
                                            style={{ color: colors.primary, borderBottomWidth: 1.5, borderBottomColor: colors.primary, paddingVertical: 4, fontWeight: '800' }}
                                            value={String(item.unidadesPorEmpaque || 1)}
                                            keyboardType="numeric"
                                            placeholder="1"
                                            onChangeText={(text) => {
                                                const newItems = [...invoiceItems];
                                                newItems[realIndex] = { ...newItems[realIndex], unidadesPorEmpaque: parseInt(text) || 1 };
                                                setInvoiceItems(newItems);
                                            }}
                                        />
                                    </View>
                                    <View style={{ flex: 1.5 }}>
                                        <Text style={{ fontSize: 10, color: sc.text, fontWeight: '700' }}>PRECIO EMPAQUE</Text>
                                        <TextInput
                                            style={{ color: colors.textPrimary, borderBottomWidth: 1.5, borderBottomColor: sc.border, paddingVertical: 4, fontWeight: '700' }}
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

                                {/* Campos Sugeridos por Caitlyn (Categoría y Reventa) */}
                                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 10, color: sc.text, fontWeight: '700' }}>CATEGORÍA</Text>
                                        <TextInput
                                            style={{ color: colors.textPrimary, borderBottomWidth: 1.5, borderBottomColor: sc.border, paddingVertical: 4, fontWeight: '600' }}
                                            value={item.categoria || 'insumo'}
                                            onChangeText={(text) => {
                                                const newItems = [...invoiceItems];
                                                newItems[realIndex] = { ...newItems[realIndex], categoria: text };
                                                setInvoiceItems(newItems);
                                            }}
                                            placeholder="Categoría"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 10, color: sc.text, fontWeight: '700' }}>PRECIO REVENTA</Text>
                                        <TextInput
                                            style={{ color: colors.primary, borderBottomWidth: 1.5, borderBottomColor: colors.primary, paddingVertical: 4, fontWeight: '800' }}
                                            value={String(item.precioVenta || '')}
                                            keyboardType="numeric"
                                            placeholder="Sugerido"
                                            onChangeText={(text) => {
                                                const newItems = [...invoiceItems];
                                                newItems[realIndex] = { ...newItems[realIndex], precioVenta: parseFloat(text) || 0 };
                                                setInvoiceItems(newItems);
                                            }}
                                        />
                                    </View>
                                </View>

                                {/* Resumen de Desglose */}
                                <View style={{ marginTop: 12, backgroundColor: 'rgba(255,255,255,0.3)', padding: 8, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Ionicons name="cube-outline" size={14} color={sc.text} />
                                        <Text style={{ fontSize: 11, color: colors.textPrimary, fontWeight: '600' }}>
                                            Ingresar: <Text style={{ color: colors.primary, fontWeight: '900' }}>{(item.cantidad * (item.unidadesPorEmpaque || 1)).toFixed(1)} {item.unidad || 'uds'}</Text>
                                        </Text>
                                    </View>
                                    <Text style={{ fontSize: 11, color: colors.textMuted }}>
                                        Costo Ud: <Text style={{ fontWeight: '700' }}>${((item.precioUnitario || 0) / (item.unidadesPorEmpaque || 1)).toFixed(2)}</Text>
                                    </Text>
                                </View>
                            </Animated.View>
                        );
                    })}
                </ScrollView>

                <View style={{ 
                    padding: 16, 
                    backgroundColor: colors.card, 
                    borderTopWidth: 1, 
                    borderTopColor: colors.border,
                    paddingBottom: insets.bottom + 16
                }}>
                    <KitchyButton title={`Importar (${invoiceItems.length})`} onPress={() => onConfirm(invoiceItems, invoiceMetadata)} loading={loading} />
                    <TouchableOpacity onPress={onClose} style={{ marginTop: 12, alignItems: 'center' }}>
                        <Text style={{ color: colors.textMuted, fontWeight: '700' }}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
