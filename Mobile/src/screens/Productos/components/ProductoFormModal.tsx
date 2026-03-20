import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, Image, Switch, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown, FadeInDown } from 'react-native-reanimated';
import { KitchyInput } from '../../../components/KitchyInput';
import { Producto, IIngrediente } from '../../../hooks/useProductos';

interface Props {
    visible: boolean;
    onClose: () => void;
    editItem: Producto | null;
    nombre: string;
    setNombre: (v: string) => void;
    descripcion: string;
    setDescripcion: (v: string) => void;
    precio: string;
    setPrecio: (v: string) => void;
    categoria: string;
    setCategoria: (v: string) => void;
    disponible: boolean;
    setDisponible: (v: boolean) => void;
    imagen: string;
    setImagen: (v: string) => void;
    ingredientes: IIngrediente[];
    itemsInventario: any[];
    onPickImage: () => void;
    onAddIngrediente: () => void;
    onRemoveIngrediente: (index: number) => void;
    onChangeIngrediente: (index: number, field: string, value: any) => void;
    onSugerirReceta: () => void;
    onSubmit: () => void;
    loading: boolean;
    colors: any;
    styles: any;
    // Caitlyn props
    productAdvice: string | null;
    loadingCaitlyn: boolean;
    errorCaitlyn: string | null;
    getBusinessAdvice: (nombre: string) => void;
    setProductAdvice: (v: string | null) => void;
}

export const ProductoFormModal: React.FC<Props> = ({ 
    visible, onClose, editItem, nombre, setNombre, descripcion, setDescripcion, 
    precio, setPrecio, categoria, setCategoria, disponible, setDisponible, 
    imagen, setImagen, ingredientes, itemsInventario, onPickImage, onAddIngrediente, 
    onRemoveIngrediente, onChangeIngrediente, onSugerirReceta, onSubmit, loading, colors, styles,
    productAdvice, loadingCaitlyn, errorCaitlyn, getBusinessAdvice, setProductAdvice
}) => {
    return (
        <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
            <Animated.View entering={FadeIn.duration(200)} style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', flex: 1, justifyContent: 'flex-end' }}>
                    <Animated.View entering={SlideInDown.duration(300).springify()} style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                                {editItem ? 'Editar' : 'Nuevo'} <Text style={{ color: colors.primary }}>Producto</Text>
                            </Text>
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <Ionicons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
                            <View style={styles.imageUploadContainer}>
                                <TouchableOpacity style={[styles.imageUploadBox, { borderColor: imagen ? 'transparent' : colors.border, backgroundColor: colors.surface }]} onPress={onPickImage}>
                                    {imagen ? (
                                        <>
                                            <Image source={{ uri: imagen }} style={styles.productImage} />
                                            <TouchableOpacity style={styles.deleteImageBtn} onPress={() => setImagen('')}>
                                                <Ionicons name="close" size={16} color="#e11d48" />
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="image-outline" size={40} color={colors.textMuted} />
                                            <Text style={[styles.imageUploadText, { color: colors.textMuted }]}>Toca Para Foto</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <KitchyInput label="Nombre del Producto" placeholder="Ej. Hamburguesa Kitchy" value={nombre} onChangeText={setNombre} />

                            <View style={styles.formRow}>
                                <View style={styles.flex1}>
                                    <KitchyInput label="Precio ($)" placeholder="0.00" value={precio} onChangeText={setPrecio} keyboardType="numeric" />
                                </View>
                                <View style={styles.flex1}>
                                    <Text style={{ fontSize: 10, fontWeight: '900', textTransform: 'uppercase', color: colors.textMuted, marginLeft: 16, marginBottom: 8, marginTop: 4 }}>Categor\u00eda</Text>
                                    <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 16, padding: 4 }}>
                                        {['comida', 'bebida', 'postre'].map((cat) => (
                                            <TouchableOpacity 
                                                key={cat}
                                                onPress={() => setCategoria(cat)} 
                                                style={{ 
                                                    flex: 1, paddingVertical: 12, alignItems: 'center', 
                                                    backgroundColor: categoria === cat ? colors.primary : 'transparent', 
                                                    borderRadius: 12 
                                                }}
                                            >
                                                <Ionicons 
                                                    name={cat === 'comida' ? 'fast-food-outline' : cat === 'bebida' ? 'water-outline' : 'ice-cream-outline'} 
                                                    size={24} 
                                                    color={categoria === cat ? '#ffffff' : colors.textPrimary} 
                                                />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            <KitchyInput label="Descripci\u00f3n" placeholder="Detalles deliciosos..." value={descripcion} onChangeText={setDescripcion} multiline />

                            <View style={[styles.toggleRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                                <View>
                                    <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>Visibilidad</Text>
                                    <Text style={[styles.toggleSub, { color: colors.textMuted }]}>Mostrar en Punto de Venta</Text>
                                </View>
                                <Switch
                                    trackColor={{ false: '#d4d4d8', true: 'rgba(59, 130, 246, 0.5)' }}
                                    thumbColor={disponible ? colors.primary : '#f4f3f4'}
                                    onValueChange={setDisponible}
                                    value={disponible}
                                />
                            </View>

                            {/* 🤖 ASISTENTE CAITLYN */}
                            <View style={[styles.caitlynContainer, { borderColor: colors.primary + '30', borderWidth: 1, borderRadius: 24, padding: 16, marginVertical: 12 }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                    <View style={{ backgroundColor: colors.primary, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}>
                                        <Ionicons name="sparkles" size={18} color="#fff" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 13, fontWeight: '800', color: colors.textPrimary }}>Asistente Caitlyn</Text>
                                        <Text style={{ fontSize: 11, color: colors.textMuted }}>Sugerencias inteligentes con IA</Text>
                                    </View>
                                    
                                    {/* Botón para Sugerir Receta (Ideal para productos nuevos) */}
                                    <TouchableOpacity 
                                        style={{ backgroundColor: colors.primary + '22', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.primary + '44' }}
                                        onPress={onSugerirReceta}
                                        disabled={loadingCaitlyn}
                                    >
                                        <Ionicons name="sparkles-outline" size={14} color={colors.primary} />
                                        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '900' }}>Sugerir Receta</Text>
                                    </TouchableOpacity>
                                </View>

                                {productAdvice && (
                                    <Animated.View entering={FadeInDown} style={{ backgroundColor: colors.background, padding: 12, borderRadius: 16, marginTop: 10 }}>
                                        <Text style={{ fontSize: 13, color: colors.textPrimary, lineHeight: 18 }}>{productAdvice}</Text>
                                        <TouchableOpacity onPress={() => setProductAdvice(null)} style={{ marginTop: 8 }}>
                                            <Text style={{ fontSize: 10, color: colors.primary, fontWeight: '700' }}>Cerrar</Text>
                                        </TouchableOpacity>
                                    </Animated.View>
                                )}
                                
                                {editItem && !productAdvice && !loadingCaitlyn && (
                                    <TouchableOpacity 
                                        onPress={() => getBusinessAdvice(nombre)}
                                        style={{ marginTop: 10, paddingVertical: 8, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border + '44' }}
                                    >
                                        <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMuted }}>¿Análisis de rentabilidad para este ítem? <Text style={{ color: colors.primary }}>Consultar</Text></Text>
                                    </TouchableOpacity>
                                )}

                                {loadingCaitlyn && (
                                    <Animated.View entering={FadeIn} style={{ paddingVertical: 10, alignItems: 'center' }}>
                                        <ActivityIndicator size="small" color={colors.primary} />
                                        <Text style={{ color: colors.textSecondary, fontSize: 12, fontStyle: 'italic', marginTop: 6 }}>Caitlyn está razonando...</Text>
                                    </Animated.View>
                                )}
                                {errorCaitlyn && <Text style={{ fontSize: 12, color: '#e11d48', marginTop: 4 }}>{errorCaitlyn}</Text>}
                            </View>

                            {/* Receta / Insumos */}
                            <View style={styles.sectionTitleRow}>
                                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}><Ionicons name="archive" size={16} color={colors.primary} /> Receta / Insumos</Text>
                                <TouchableOpacity style={[styles.addIngredientBtn, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]} onPress={onAddIngrediente}>
                                    <Ionicons name="add" size={16} color={colors.primary} />
                                    <Text style={[styles.addIngredientText, { color: colors.primary }]}>Insumo</Text>
                                </TouchableOpacity>
                            </View>

                            <View>
                                {ingredientes.map((ing, index) => {
                                    const currentInvIndex = itemsInventario.findIndex(i => i._id === ing.inventario);
                                    const currentInv = itemsInventario[currentInvIndex];

                                    const nextInv = () => {
                                        if (itemsInventario.length === 0) return;
                                        const nIdx = currentInvIndex + 1 >= itemsInventario.length ? 0 : currentInvIndex + 1;
                                        onChangeIngrediente(index, 'inventario', itemsInventario[nIdx]._id);
                                    };

                                    return (
                                        <View key={index} style={[styles.ingredientRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                                            <TouchableOpacity style={styles.ingredientSelect} onPress={nextInv}>
                                                <Text style={{ fontSize: 14, fontWeight: '700', color: currentInv ? colors.textPrimary : colors.textMuted }} numberOfLines={1}>
                                                    {currentInv ? `${currentInv.nombre} (${currentInv.unidad})` : (ing.nombreDisplay ? `${ing.nombreDisplay} (No disp.)` : 'Toca para Elegir')}
                                                </Text>
                                            </TouchableOpacity>

                                            <TextInput
                                                style={[styles.ingredientInput, { borderColor: colors.border, color: colors.textPrimary }]}
                                                value={ing.cantidad.toString()}
                                                onChangeText={(t) => onChangeIngrediente(index, 'cantidad', t)}
                                                keyboardType="numeric"
                                                placeholder="0.0"
                                                placeholderTextColor={colors.textMuted}
                                            />

                                            <TouchableOpacity style={[styles.deleteIngredientBtn, { backgroundColor: 'rgba(225, 29, 72, 0.1)' }]} onPress={() => onRemoveIngrediente(index)}>
                                                <Ionicons name="trash" size={18} color="#e11d48" />
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}

                                {ingredientes.length === 0 && (
                                    <Text style={{ fontSize: 11, fontWeight: '900', textTransform: 'uppercase', color: colors.textMuted, textAlign: 'center', marginTop: 12, letterSpacing: 1 }}>Sin Insumos Asignados</Text>
                                )}
                            </View>

                            <View style={{ height: 40 }} />
                            <TouchableOpacity 
                                style={{ backgroundColor: colors.primary, paddingVertical: 18, borderRadius: 24, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8, flexDirection: 'row', justifyContent: 'center', gap: 8 }} 
                                onPress={onSubmit}
                                disabled={loading}
                            >
                                <Ionicons name={editItem ? 'save' : 'add-circle'} size={24} color="#fff" />
                                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: -0.5 }}>
                                    {loading ? 'Guardando...' : (editItem ? 'Actualizar Producto' : 'Crear Producto')}
                                </Text>
                            </TouchableOpacity>

                        </ScrollView>
                    </Animated.View>
                </KeyboardAvoidingView>
            </Animated.View>
        </Modal>
    );
};
