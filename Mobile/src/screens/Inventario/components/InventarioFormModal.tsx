import React from 'react';
import { View, Text, Modal, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown, FadeInDown } from 'react-native-reanimated';
import { VestaInput } from '../../../components/VestaInput';
import { VestaSelect } from '../../../components/VestaSelect';
import { VestaButton } from '../../../components/VestaButton';
import { VestaDatePicker } from '../../../components/VestaDatePicker';

interface Props {
    visible: boolean;
    onClose: () => void;
    editItem: any;
    searchingGlobal: boolean;
    loading: boolean;
    categoriaNegocio: string;
    colors: any;
    styles: any;
    // Form States & Setters
    nombre: string; setNombre: (v: string) => void;
    descripcion: string; setDescripcion: (v: string) => void;
    cantidad: string; setCantidad: (v: string) => void;
    unidad: string; setUnidad: (v: string) => void;
    cantidadMinima: string; setCantidadMinima: (v: string) => void;
    costoUnitario: string; setCostoUnitario: (v: string) => void;
    precioVenta: string; setPrecioVenta: (v: string) => void;
    suggestedPrice: string | null;
    categoria: string; setCategoria: (v: string) => void;
    codigoBarras: string; setCodigoBarras: (v: string) => void;
    fechaVencimiento: string; setFechaVencimiento: (v: string) => void;
    onSubmit: () => void;
    error?: string;
}

export const InventarioFormModal: React.FC<Props> = ({
    visible, onClose, editItem, searchingGlobal, loading, categoriaNegocio, colors, styles,
    nombre, setNombre, descripcion, setDescripcion, cantidad, setCantidad, unidad, setUnidad,
    cantidadMinima, setCantidadMinima, costoUnitario, setCostoUnitario, precioVenta, setPrecioVenta,
    suggestedPrice,
    categoria, setCategoria, codigoBarras, setCodigoBarras, fechaVencimiento, setFechaVencimiento,
    onSubmit, error
}) => {

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <Animated.View entering={SlideInDown.springify().damping(15)} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.modalTitle}>{editItem ? 'Editar Item' : 'Nuevo Item'}</Text>
                                {error ? (
                                    <Text style={{ color: '#ef4444', fontSize: 10, fontWeight: '700', marginTop: 4 }}>
                                        ⚠️ {error}
                                    </Text>
                                ) : searchingGlobal && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                        <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 6 }} />
                                        <Text style={{ fontSize: 10, color: colors.textMuted }}>Buscando informació...</Text>
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={32} color={colors.textMuted} /></TouchableOpacity>
                        </View>
                        <ScrollView
                            style={styles.modalScroll}
                            contentContainerStyle={{ paddingBottom: 60 }}
                            showsVerticalScrollIndicator={false}
                        >
                            <VestaInput label="Nombre" value={nombre} onChangeText={setNombre} />
                            <VestaInput label="Descripción" value={descripcion} onChangeText={setDescripcion} />
                            <View style={styles.formRow}>
                                <View style={styles.inputSmall}><VestaInput label="Cantidad" value={cantidad} onChangeText={setCantidad} keyboardType="numeric" /></View>
                                <View style={styles.inputSmall}>
                                    <VestaSelect
                                        label="Medida"
                                        value={unidad}
                                        onSelect={setUnidad}
                                        options={[
                                            { label: 'Unidades', value: 'unidades' },
                                            { label: 'Lts', value: 'litros' },
                                            { label: 'ml', value: 'ml' },
                                            { label: 'Gr', value: 'gramos' },
                                            { label: 'Kg', value: 'kg' },
                                            { label: 'Oz', value: 'onzas' },
                                            { label: 'Paq', value: 'paquete' },
                                        ]}
                                    />
                                </View>
                            </View>
                            <View style={styles.formRow}>
                                <View style={styles.inputSmall}><VestaInput label="Costo / UD" value={costoUnitario} onChangeText={setCostoUnitario} keyboardType="numeric" /></View>
                                <View style={styles.inputSmall}><VestaInput label="Stock Mínimo" value={cantidadMinima} onChangeText={setCantidadMinima} keyboardType="numeric" placeholder="Mínimo" /></View>
                            </View>
                            <VestaSelect
                                label="Categoría"
                                value={categoria}
                                onSelect={setCategoria}
                                options={categoriaNegocio === 'FRUTERIA' ? [
                                    { label: 'Producto Reventa (Venta)', value: 'reventa' },
                                    { label: 'Insumo (Bolsas, Empaques)', value: 'insumo' },
                                    { label: 'Limpieza', value: 'limpieza' },
                                    { label: 'Otro', value: 'otro' },
                                ] : [
                                    { label: 'Ingrediente', value: 'ingrediente' },
                                    { label: 'Bebida', value: 'bebida' },
                                    { label: 'Limpieza', value: 'limpieza' },
                                    { label: 'Otro', value: 'otro' },
                                ]}
                            />
                            {categoria === 'reventa' && (
                                <Animated.View entering={FadeInDown}>
                                    <View style={{ position: 'relative' }}>
                                        <VestaInput label="Precio Venta Público" value={precioVenta} onChangeText={setPrecioVenta} keyboardType="numeric" placeholder="$0.00" />
                                        {suggestedPrice && (
                                            <TouchableOpacity
                                                onPress={() => setPrecioVenta(suggestedPrice)}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: 0,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                    backgroundColor: colors.primary + '15',
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 2,
                                                    borderRadius: 8
                                                }}
                                            >
                                                <Image
                                                    source={categoriaNegocio === 'FRUTERIA' 
                                                        ? require('../../../../assets/caitlyn_frutera.png')
                                                        : require('../../../../assets/caitlyn_avatar.png')}
                                                    style={{ width: 14, height: 14, borderRadius: 7 }}
                                                />
                                                <Text style={{ fontSize: 10, color: colors.primary, fontWeight: '800' }}>
                                                    Sugerido: ${suggestedPrice}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </Animated.View>
                            )}

                            <VestaDatePicker
                                label="Fecha Vencimiento"
                                value={fechaVencimiento}
                                onChange={setFechaVencimiento}
                            />
                            <View style={{ marginTop: 24 }}>
                                <VestaButton title={editItem ? 'Actualizar' : 'Guardar'} onPress={onSubmit} loading={loading} />
                            </View>
                        </ScrollView>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};
