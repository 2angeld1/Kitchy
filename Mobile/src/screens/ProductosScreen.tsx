import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, RefreshControl, Modal, KeyboardAvoidingView, Platform, Image, Switch, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../theme';
import { styles } from '../styles/ProductosScreen.styles';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';
import { useProductos, Producto, IIngrediente } from '../hooks/useProductos';
import { useInventario } from '../hooks/useInventario';
import { KitchyInput } from '../components/KitchyInput';
import Toast from 'react-native-toast-message';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { TouchableOpacity as GHTouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function ProductosScreen() {
    const navigation = useNavigation();
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    const {
        productosFiltrados, loading, refreshing, error, clearError, success, clearSuccess,
        showModal, setShowModal, editItem, busqueda, setBusqueda, filtro, setFiltro,
        nombre, setNombre, descripcion, setDescripcion, precio, setPrecio,
        categoria, setCategoria, disponible, setDisponible, imagen, setImagen,
        ingredientes, setIngredientes, handleRefresh, resetForm, openEditModal,
        handleSubmit, handleDelete, handleToggleDisponible, handleImportCsv
    } = useProductos();

    const { items: itemsInventario } = useInventario();

    useEffect(() => {
        if (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: error });
            clearError();
        }
        if (success) {
            Toast.show({ type: 'success', text1: 'Éxito', text2: success });
            clearSuccess();
        }
    }, [error, success]);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
                copyToCacheDirectory: true
            });
            if (result.canceled) return;
            handleImportCsv(result.assets[0]);
        } catch (err) {
            console.error(err);
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true
            });

            if (!result.canceled && result.assets[0].base64) {
                // Using base64 to be compatible with what backend might expect if it accepts base64
                // or we can pass just uri if the backend handles multipart/form-data for products.
                // Depending on the generic backend, we use base64 data URI format:
                setImagen(`data:image/jpeg;base64,${result.assets[0].base64}`);
            }
        } catch (err) {
            console.error(err);
            Toast.show({ type: 'error', text1: 'Error de Imagen', text2: 'No se pudo cargar la imagen.' });
        }
    };

    const handleChangeIngrediente = (index: number, field: string, value: any) => {
        const nuevos = [...ingredientes];
        (nuevos[index] as any)[field] = value;
        setIngredientes(nuevos);
    };

    const handleAddIngrediente = () => {
        setIngredientes([...ingredientes, { inventario: '', cantidad: 1 }]);
    };

    const handleRemoveIngrediente = (index: number) => {
        const nuevos = [...ingredientes];
        nuevos.splice(index, 1);
        setIngredientes(nuevos);
    };

    const renderRightActions = (item: Producto) => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%' }}>
                <TouchableOpacity
                    style={{ backgroundColor: item.disponible ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', width: 60, height: '100%', justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => handleToggleDisponible(item._id, item.disponible)}
                >
                    <Ionicons name={item.disponible ? 'eye-off' : 'eye'} size={22} color={item.disponible ? '#f59e0b' : '#10b981'} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ backgroundColor: colors.surface, width: 60, height: '100%', justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => openEditModal(item)}
                >
                    <Ionicons name="pencil" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ backgroundColor: 'rgba(225, 29, 72, 0.1)', width: 60, height: '100%', justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => handleDelete(item._id)}
                >
                    <Ionicons name="trash" size={22} color="#e11d48" />
                </TouchableOpacity>
            </View>
        );
    };

    const renderItemCard = (item: Producto, index: number) => {
        const iconName = item.categoria === 'comida' ? 'restaurant-outline' : item.categoria === 'bebida' ? 'cafe-outline' : item.categoria === 'postre' ? 'ice-cream-outline' : 'cube-outline';

        return (
            <Animated.View key={item._id} entering={FadeInDown.delay(index * 50)}>
                <Swipeable renderRightActions={() => renderRightActions(item)}>
                    <GHTouchableOpacity
                        style={[styles.itemCard, { backgroundColor: colors.background, borderBottomColor: colors.border, opacity: item.disponible ? 1 : 0.5 }]}
                        onPress={() => openEditModal(item)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.itemIconBox, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
                            {item.imagen ? (
                                <Image source={{ uri: item.imagen }} style={styles.productImage} />
                            ) : (
                                <Ionicons name={iconName} size={24} color={colors.primary} />
                            )}
                        </View>

                        <View style={styles.itemInfo}>
                            <View style={styles.itemTitleRow}>
                                <Text style={[styles.itemTitle, { color: colors.textPrimary, textDecorationLine: item.disponible ? 'none' : 'line-through' }]} numberOfLines={1}>{item.nombre}</Text>
                                <Text style={[styles.itemPrice, { color: colors.primary }]}>${(item.precio || 0).toFixed(2)}</Text>
                            </View>
                            <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                                {item.categoria} {item.descripcion ? `• ${item.descripcion}` : ''}
                            </Text>
                            <View style={[styles.itemStatus, { backgroundColor: item.disponible ? 'rgba(16, 185, 129, 0.1)' : 'rgba(161, 161, 170, 0.2)' }]}>
                                <Text style={[styles.itemStatusText, { color: item.disponible ? '#10b981' : '#71717a' }]}>
                                    {item.disponible ? 'Activo' : 'Oculto'}
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-back" size={18} color={colors.textMuted} style={{ opacity: 0.8 }} />
                    </GHTouchableOpacity>
                </Swipeable>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <KitchyToolbar title="Productos" onBack={() => navigation.goBack()} />

            <View style={styles.headerRow}>
                <View style={[styles.searchInputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="search-outline" size={20} color={colors.textMuted} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.textPrimary }]}
                        placeholder="Buscar menú..."
                        placeholderTextColor={colors.textMuted}
                        value={busqueda}
                        onChangeText={setBusqueda}
                        returnKeyType="search"
                    />
                </View>
            </View>

            <View style={styles.filterContainer}>
                <View style={[styles.filterScrollView, { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 }]}>
                    {['todos', 'comida', 'bebida', 'postre', 'otro'].map((f) => {
                        const isSelected = filtro === f;
                        return (
                            <TouchableOpacity
                                key={f}
                                style={[styles.filterPill, {
                                    backgroundColor: isSelected ? colors.primary : colors.surface,
                                    borderColor: isSelected ? colors.primary : colors.border,
                                    flex: isSelected ? 2 : 1, // expanded when selected
                                    marginRight: f !== 'otro' ? 8 : 0,
                                    paddingHorizontal: 0,
                                }]}
                                onPress={() => setFiltro(f)}
                            >
                                {f === 'todos' && <Ionicons name="apps-outline" size={20} color={isSelected ? '#ffffff' : colors.textMuted} />}
                                {f === 'comida' && <Ionicons name="fast-food-outline" size={20} color={isSelected ? '#ffffff' : colors.textMuted} />}
                                {f === 'bebida' && <Ionicons name="water-outline" size={20} color={isSelected ? '#ffffff' : colors.textMuted} />}
                                {f === 'postre' && <Ionicons name="ice-cream-outline" size={20} color={isSelected ? '#ffffff' : colors.textMuted} />}
                                {f === 'otro' && <Ionicons name="cube-outline" size={20} color={isSelected ? '#ffffff' : colors.textMuted} />}

                                {isSelected && (
                                    <Animated.Text entering={FadeInDown.duration(200)} style={[styles.filterText, { color: '#ffffff', marginLeft: 6 }]}>
                                        {f === 'todos' ? 'Todos' : f === 'comida' ? 'Comidas' : f === 'bebida' ? 'Bebidas' : f === 'postre' ? 'Postres' : 'Otros'}
                                    </Animated.Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
            >
                {productosFiltrados.length > 0 ? (
                    productosFiltrados.map((item, index) => renderItemCard(item, index))
                ) : (
                    !loading && (
                        <Animated.View entering={FadeInDown} style={styles.emptyState}>
                            <View style={[styles.emptyIconBox, { backgroundColor: colors.surface }]}>
                                <Ionicons name="restaurant-outline" size={40} color={colors.textMuted} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Menú Vacío</Text>
                            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                                No hay productos registrados. Agrega platillos para empezar a vender.
                            </Text>
                        </Animated.View>
                    )
                )}
            </ScrollView>

            <View style={styles.fabRow}>
                <TouchableOpacity style={[styles.secFab, { backgroundColor: colors.surface }]} onPress={pickDocument}>
                    <Ionicons name="cloud-upload" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => { resetForm(); setShowModal(true); }}>
                    <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Modal Crear/Editar */}
            <Modal visible={showModal} animationType="slide" transparent={true} onRequestClose={() => setShowModal(false)}>
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', height: '92%' }}>
                        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                                    {editItem ? 'Editar' : 'Nuevo'} <Text style={{ color: colors.primary }}>Producto</Text>
                                </Text>
                                <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.surface }]} onPress={() => setShowModal(false)}>
                                    <Ionicons name="close" size={24} color={colors.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>

                                <View style={styles.imageUploadContainer}>
                                    <TouchableOpacity style={[styles.imageUploadBox, { borderColor: imagen ? 'transparent' : colors.border, backgroundColor: colors.surface }]} onPress={pickImage}>
                                        {imagen ? (
                                            <>
                                                <Image source={{ uri: imagen }} style={styles.productImage} />
                                                <TouchableOpacity style={[styles.deleteImageBtn, { backgroundColor: colors.card }]} onPress={() => setImagen('')}>
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
                                        {/* Simplified Select for mobile utilizing input text, in real scenario a Picker, but we simulate it with simple input/text for category limits */}
                                        <Text style={{ fontSize: 10, fontWeight: '900', textTransform: 'uppercase', color: colors.textMuted, marginLeft: 16, marginBottom: 8, marginTop: 4 }}>Categoría</Text>
                                        <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 16, padding: 4 }}>
                                            <TouchableOpacity onPress={() => setCategoria('comida')} style={{ flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: categoria === 'comida' ? colors.primary : 'transparent', borderRadius: 12 }}>
                                                <Ionicons name="fast-food-outline" size={24} color={categoria === 'comida' ? '#ffffff' : colors.textPrimary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => setCategoria('bebida')} style={{ flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: categoria === 'bebida' ? colors.primary : 'transparent', borderRadius: 12 }}>
                                                <Ionicons name="water-outline" size={24} color={categoria === 'bebida' ? '#ffffff' : colors.textPrimary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => setCategoria('postre')} style={{ flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: categoria === 'postre' ? colors.primary : 'transparent', borderRadius: 12 }}>
                                                <Ionicons name="ice-cream-outline" size={24} color={categoria === 'postre' ? '#ffffff' : colors.textPrimary} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                <KitchyInput label="Descripción" placeholder="Detalles deliciosos..." value={descripcion} onChangeText={setDescripcion} multiline />

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

                                {/* Receta / Insumos */}
                                <View style={[styles.sectionTitleRow, { borderTopColor: colors.border }]}>
                                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}><Ionicons name="archive" size={16} color={colors.primary} /> Receta / Insumos</Text>
                                    <TouchableOpacity style={[styles.addIngredientBtn, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]} onPress={handleAddIngrediente}>
                                        <Ionicons name="add" size={16} color={colors.primary} />
                                        <Text style={[styles.addIngredientText, { color: colors.primary }]}>Insumo</Text>
                                    </TouchableOpacity>
                                </View>

                                <View>
                                    {ingredientes.map((ing, index) => {
                                        // To simulate native select we will just use a minimal view. Ideally react-native-picker/picker is used.
                                        // For now we map over available inventory items to allow a cyclic simple selection logic for MVP natively.
                                        const currentInvIndex = itemsInventario.findIndex(i => i._id === ing.inventario);
                                        const currentInv = itemsInventario[currentInvIndex];

                                        const nextInv = () => {
                                            if (itemsInventario.length === 0) return;
                                            const nIdx = currentInvIndex + 1 >= itemsInventario.length ? 0 : currentInvIndex + 1;
                                            handleChangeIngrediente(index, 'inventario', itemsInventario[nIdx]._id);
                                        };

                                        return (
                                            <View key={index} style={[styles.ingredientRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                                                <TouchableOpacity style={[styles.ingredientSelect, { borderColor: colors.border, backgroundColor: colors.background }]} onPress={nextInv}>
                                                    <Text style={{ fontSize: 14, fontWeight: '700', color: currentInv ? colors.textPrimary : colors.textMuted }} numberOfLines={1}>
                                                        {currentInv ? `${currentInv.nombre} (${currentInv.unidad})` : (ing.nombreDisplay ? `${ing.nombreDisplay} (No disp.)` : 'Toca para Elegir')}
                                                    </Text>
                                                </TouchableOpacity>

                                                <TextInput
                                                    style={[styles.ingredientInput, { borderColor: colors.border, backgroundColor: colors.background, color: colors.textPrimary }]}
                                                    value={ing.cantidad.toString()}
                                                    onChangeText={(t) => handleChangeIngrediente(index, 'cantidad', t)}
                                                    keyboardType="numeric"
                                                    placeholder="0.0"
                                                    placeholderTextColor={colors.textMuted}
                                                />

                                                <TouchableOpacity style={[styles.deleteIngredientBtn, { backgroundColor: 'rgba(225, 29, 72, 0.1)' }]} onPress={() => handleRemoveIngrediente(index)}>
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
                                <TouchableOpacity style={{ backgroundColor: colors.primary, paddingVertical: 18, borderRadius: 24, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8, flexDirection: 'row', justifyContent: 'center', gap: 8 }} onPress={handleSubmit}>
                                    <Ionicons name={editItem ? 'save' : 'add-circle'} size={24} color="#fff" />
                                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: -0.5 }}>{editItem ? 'Actualizar Producto' : 'Crear Producto'}</Text>
                                </TouchableOpacity>

                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

        </View>
    );
}
