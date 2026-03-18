import React from 'react';
import { View, Text, Modal, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown, FadeInDown } from 'react-native-reanimated';
import { KitchyInput } from '../../../components/KitchyInput';
import { KitchySelect } from '../../../components/KitchySelect';
import { KitchyButton } from '../../../components/KitchyButton';

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
    categoria: string; setCategoria: (v: string) => void;
    codigoBarras: string; setCodigoBarras: (v: string) => void;
    fechaVencimiento: string; setFechaVencimiento: (v: string) => void;
    onSubmit: () => void;
}

export const InventarioFormModal: React.FC<Props> = ({
    visible, onClose, editItem, searchingGlobal, loading, categoriaNegocio, colors, styles,
    nombre, setNombre, descripcion, setDescripcion, cantidad, setCantidad, unidad, setUnidad,
    cantidadMinima, setCantidadMinima, costoUnitario, setCostoUnitario, precioVenta, setPrecioVenta,
    categoria, setCategoria, codigoBarras, setCodigoBarras, fechaVencimiento, setFechaVencimiento,
    onSubmit
}) => {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <Animated.View entering={SlideInDown.springify().damping(15)} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>{editItem ? 'Editar Item' : 'Nuevo Item'}</Text>
                                {searchingGlobal && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                        <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 6 }} />
                                        <Text style={{ fontSize: 10, color: colors.textMuted }}>Buscando informaci\u00f3n...</Text>
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity onPress={onClose}><Ionicons name="close-circle" size={32} color={colors.textMuted} /></TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                            <KitchyInput label="Nombre" value={nombre} onChangeText={setNombre} />
                            <KitchyInput label="Descripci\u00f3n" value={descripcion} onChangeText={setDescripcion} />
                            <View style={styles.formRow}>
                                <View style={styles.inputSmall}><KitchyInput label="Cantidad" value={cantidad} onChangeText={setCantidad} keyboardType="numeric" /></View>
                                <View style={styles.inputSmall}>
                                    <KitchySelect 
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
                                <View style={styles.inputSmall}><KitchyInput label="Costo / Ud" value={costoUnitario} onChangeText={setCostoUnitario} keyboardType="numeric" /></View>
                                <View style={styles.inputSmall}><KitchyInput label="Min Stock" value={cantidadMinima} onChangeText={setCantidadMinima} keyboardType="numeric" /></View>
                            </View>
                            <KitchySelect 
                                label="Categor\u00eda" 
                                value={categoria} 
                                onSelect={setCategoria} 
                                options={categoriaNegocio === 'BELLEZA' ? [
                                    { label: 'Insumo (Shampoo, Tintes)', value: 'insumo' },
                                    { label: 'Herramienta', value: 'herramienta' },
                                    { label: 'Producto Reventa', value: 'reventa' },
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
                                    <KitchyInput label="Precio Venta P\u00fablico" value={precioVenta} onChangeText={setPrecioVenta} keyboardType="numeric" placeholder="$0.00" />
                                </Animated.View>
                            )}
                            <KitchyInput label="C\u00f3digo de Barras" value={codigoBarras} onChangeText={setCodigoBarras} />
                            <KitchyInput label="Fecha Vencimiento" value={fechaVencimiento} onChangeText={setFechaVencimiento} placeholder="YYYY-MM-DD" />
                            <KitchyButton title={editItem ? 'Actualizar' : 'Guardar'} onPress={onSubmit} loading={loading} />
                        </ScrollView>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};
