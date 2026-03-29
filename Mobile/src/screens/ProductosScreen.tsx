import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, RefreshControl, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../theme';
import { createStyles } from '../styles/ProductosScreen.styles';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';
import { useProductos } from '../hooks/useProductos';
import { Producto } from '../types/producto.types';
import { useInventario } from '../hooks/useInventario';
import { useCaitlyn } from '../hooks/useCaitlyn';
import Toast from 'react-native-toast-message';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { updateNegocioConfig } from '../services/api';

// Subcomponentes extra\u00eddos
import { ProductoItemCard } from './Productos/components/ProductoItemCard';
import { ProductoFormModal } from './Productos/components/ProductoFormModal';
import { RentabilidadConfigModal } from './Productos/components/RentabilidadConfigModal';
import { MenuIdeasModal } from './Productos/components/MenuIdeasModal';

export default function ProductosScreen({ route }: any) {
    const navigation = useNavigation();
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const styles = useMemo(() => createStyles(colors), [colors]);
    const openedSwipeableRef = useRef<any>(null);

    const [showMenuIdeasModal, setShowMenuIdeasModal] = useState(false);

    const {
        productos, productosFiltrados, loading, loadingReceta, refreshing, error, clearError, success, clearSuccess,
        showModal, setShowModal, editItem, busqueda, setBusqueda, filtro, setFiltro,
        nombre, setNombre, descripcion, setDescripcion, precio, setPrecio,
        categoria, setCategoria, disponible, setDisponible, imagen, setImagen,
        ingredientes, setIngredientes, handleRefresh, resetForm, openEditModal,
        handleSubmit, handleDelete, handleToggleDisponible, handleImportCsv,
        handleAddIngrediente, handleRemoveIngrediente, handleChangeIngrediente,
        handleSugerirReceta, backendCostoTotal, backendPrecioSugerido,
        servingSize, setServingSize, showSizePrompt, setShowSizePrompt, isLiquid,
        handlePreSugerirReceta, handleApplySuggestion, sugerenciaIA, handleApplyRecipe
    } = useProductos();

    const { items: itemsInventario } = useInventario();
    const { getBusinessAdvice, productAdvice, loading: loadingCaitlyn, error: errorCaitlyn, setProductAdvice, generateMenuIdeas, menuIdeas, menuSource } = useCaitlyn();

    const handleUseIdea = (idea: any) => {
        resetForm();
        setNombre(idea.nombre_plato);
        setDescripcion(idea.descripcion);
        setPrecio(idea.precio_recomendado?.toString() || '');
        if (idea.ingredientes_a_usar && idea.ingredientes_a_usar.length > 0) {
            const formateados = idea.ingredientes_a_usar.map((ing: any) => ({
                id: Math.random().toString(),
                inventario: ing.inventario || '',
                nombre: ing.nombre,
                nombreDisplay: ing.nombre, // Para que se vea el nombre incluso si no hay ID vinculado
                cantidad: ing.cantidad?.toString(),
                unidad: ing.unidad
            }));
            setIngredientes(formateados);
        }
        setShowMenuIdeasModal(false);
        setTimeout(() => setShowModal(true), 300);
    };

    const handleSwipeOpen = (swipeable: any) => {
        if (openedSwipeableRef.current && openedSwipeableRef.current !== swipeable) {
            openedSwipeableRef.current.close();
        }
        openedSwipeableRef.current = swipeable;
    };

    // Deep linking interno desde Caitlyn Strategy
    useEffect(() => {
        if (route?.params?.editProductId && productos.length > 0) {
            const prodToEdit = productos.find(p => p._id === route.params.editProductId);
            if (prodToEdit && !showModal) {
                openEditModal(prodToEdit);
            }
        }
    }, [route?.params?.editProductId, productos.length]);

    // Estado para Configuració de Margen
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [margenInput, setMargenInput] = useState('50');
    const [savingConfig, setSavingConfig] = useState(false);

    const handleSaveMargen = async () => {
        setSavingConfig(true);
        try {
            await updateNegocioConfig({ margenObjetivo: parseInt(margenInput) });
            Toast.show({ type: 'success', text1: '¡Actualizado!', text2: 'Caitlyn ahora vigilará los precios con esta meta.' });
            setShowConfigModal(false);
            handleRefresh();
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo actualizar el margen.' });
        } finally {
            setSavingConfig(false);
        }
    };

    useEffect(() => {
        if (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: error, position: 'top', onHide: clearError });
        }
        if (success) {
            Toast.show({ type: 'success', text1: 'Éxito', text2: success, position: 'top', onHide: clearSuccess });
        }
    }, [error, success]);

    // Trigger Automático de Consejos de Caitlyn al abrir/cambiar producto
    useEffect(() => {
        if (!showModal) {
            setProductAdvice(null);
            return;
        }

        const currentData = {
            nombre,
            descripcion,
            precio: parseFloat(precio) || 0,
            precioSugerido: route?.params?.suggestedPrice || undefined,
            ingredientes: ingredientes.map(i => ({ inventario: i.inventario, cantidad: Number(i.cantidad) }))
        };

        // Escudo de Cuota: Un debounce sano de 2.5 segundos (2500ms).
        // Si pulsas muchas teclas (editItem p.ej.), se reinicia. Caitlyn solo hablará
        // cuando te detengas de escribir y pensar por 2.5 segundos.
        const timer = setTimeout(() => {
            if (nombre) {
                getBusinessAdvice(nombre, currentData);
            }
        }, 2500);

        return () => clearTimeout(timer);
    }, [showModal, nombre, precio, ingredientes.length, route?.params?.suggestedPrice]);

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
                setImagen(`data:image/jpeg;base64,${result.assets[0].base64}`);
            }
        } catch (err) {
            console.error(err);
            Toast.show({ type: 'error', text1: 'Error de Imagen', text2: 'No se pudo cargar la imagen.' });
        }
    };

    return (
        <View style={styles.container}>
            <KitchyToolbar title="Productos" onBack={() => navigation.goBack()} />

            <View style={styles.headerRow}>
                <View style={styles.searchInputWrapper}>
                    <Ionicons name="search-outline" size={20} color={colors.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar menú..."
                        placeholderTextColor={colors.textMuted}
                        value={busqueda}
                        onChangeText={setBusqueda}
                        returnKeyType="search"
                    />
                </View>
                <TouchableOpacity
                    style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, padding: 12, borderRadius: 16 }}
                    onPress={() => setShowConfigModal(true)}
                >
                    <Ionicons name="options-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                <View style={styles.filterScrollView}>
                    {['todos', 'comida', 'bebida', 'postre', 'otro'].map((f) => {
                        const isSelected = filtro === f;
                        return (
                            <TouchableOpacity
                                key={f}
                                style={[styles.filterPill, {
                                    backgroundColor: isSelected ? colors.primary : colors.surface,
                                    borderColor: isSelected ? colors.primary : colors.border,
                                    flex: isSelected ? 2 : 1,
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
                    productosFiltrados.map((item, index) => (
                        <ProductoItemCard
                            key={item._id}
                            item={item}
                            index={index}
                            colors={colors}
                            styles={styles}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                            onToggleDisponible={handleToggleDisponible}
                            onSwipeableOpen={handleSwipeOpen}
                        />
                    ))
                ) : (
                    !loading && (
                        <Animated.View entering={FadeInDown} style={styles.emptyState}>
                            <View style={styles.emptyIconBox}>
                                <Ionicons name="restaurant-outline" size={40} color={colors.textMuted} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Men\u00fa Vac\u00edo</Text>
                            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                                No hay productos registrados. Agrega platillos para empezar a vender.
                            </Text>
                        </Animated.View>
                    )
                )}
            </ScrollView>

            <View style={styles.fabRow}>
                <TouchableOpacity style={[styles.secFab, { backgroundColor: '#d97706' }]} onPress={() => setShowMenuIdeasModal(true)}>
                    <Ionicons name="restaurant-outline" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.secFab} onPress={pickDocument}>
                    <Ionicons name="cloud-upload" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => { resetForm(); setShowModal(true); }}>
                    <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Modales Extra\u00eddos */}
            <MenuIdeasModal
                visible={showMenuIdeasModal}
                onClose={() => setShowMenuIdeasModal(false)}
                generateMenuIdeas={generateMenuIdeas}
                menuIdeas={menuIdeas}
                menuSource={menuSource}
                loading={loadingCaitlyn}
                error={errorCaitlyn}
                colors={colors}
                onUseIdea={handleUseIdea}
            />

            <ProductoFormModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                editItem={editItem}
                nombre={nombre} setNombre={setNombre}
                descripcion={descripcion} setDescripcion={setDescripcion}
                precio={precio} setPrecio={setPrecio}
                categoria={categoria} setCategoria={setCategoria}
                disponible={disponible} setDisponible={setDisponible}
                imagen={imagen} setImagen={setImagen}
                ingredientes={ingredientes}
                itemsInventario={itemsInventario}
                onPickImage={pickImage}
                onAddIngrediente={handleAddIngrediente}
                onRemoveIngrediente={handleRemoveIngrediente}
                onChangeIngrediente={handleChangeIngrediente}
                onSugerirReceta={handleSugerirReceta}
                onSubmit={handleSubmit}
                loading={loading}
                colors={colors}
                productAdvice={productAdvice}
                loadingCaitlyn={loadingCaitlyn}
                loadingRecipe={loadingReceta}
                errorCaitlyn={errorCaitlyn}
                getBusinessAdvice={getBusinessAdvice}
                setProductAdvice={setProductAdvice}
                backendCostoTotal={backendCostoTotal}
                backendPrecioSugerido={backendPrecioSugerido}
                sugerenciaIA={sugerenciaIA}
                handleApplyRecipe={handleApplyRecipe}
                servingSize={servingSize}
                onServingSizeChange={setServingSize}
                showSizePrompt={showSizePrompt}
                onShowSizePromptChange={setShowSizePrompt}
                isLiquid={isLiquid()}
                onPreSugerirReceta={handlePreSugerirReceta}
                onApplySuggestion={handleApplySuggestion}
                suggestedStrategyPrice={route?.params?.suggestedPrice}
            />

            <RentabilidadConfigModal
                visible={showConfigModal}
                onClose={() => setShowConfigModal(false)}
                margenInput={margenInput}
                setMargenInput={setMargenInput}
                savingConfig={savingConfig}
                onSave={handleSaveMargen}
                colors={colors}
                styles={styles}
            />
        </View>
    );
}
