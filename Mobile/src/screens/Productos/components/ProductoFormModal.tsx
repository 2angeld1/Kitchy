import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, Image, Switch, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown, FadeInDown, Layout, SlideOutDown, FadeOut } from 'react-native-reanimated';
import { IIngrediente, Producto, ProductoFormModalProps } from '../../../types/producto.types';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createModalStyles } from '../../../styles/ProductoForm.styles';

export const ProductoFormModal: React.FC<ProductoFormModalProps> = ({
    visible, onClose, editItem, nombre, setNombre, descripcion, setDescripcion,
    precio, setPrecio, categoria, setCategoria, disponible, setDisponible,
    imagen, setImagen, ingredientes, itemsInventario, onPickImage, onAddIngrediente,
    onRemoveIngrediente, onChangeIngrediente, onSugerirReceta, onSubmit, loading, colors,
    productAdvice, loadingCaitlyn, loadingRecipe, errorCaitlyn, getBusinessAdvice, setProductAdvice,
    sugerenciaIA, handleApplyRecipe,
    backendCostoTotal, backendPrecioSugerido,
    servingSize, onServingSizeChange, showSizePrompt, onShowSizePromptChange,
    isLiquid, onPreSugerirReceta, onApplySuggestion, faltantesIA,
    suggestedStrategyPrice
}) => {

    const styles = createModalStyles(colors);

    const renderRightActions = (index: number) => (
        <TouchableOpacity
            style={styles.deleteAction}
            onPress={() => onRemoveIngrediente(index)}
        >
            <Ionicons name="trash-outline" size={24} color="#fff" />
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Animated.View
                    entering={FadeIn.duration(300)}
                    style={styles.modalOverlay}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <Animated.View
                            entering={SlideInDown.springify().damping(15)}
                            style={styles.modalContent}
                        >
                            {/* HEADER */}
                            <View style={styles.header}>
                                <View style={styles.headerTitleBox}>
                                    <Text style={styles.headerPrefix}>{editItem ? 'Editando' : 'Nuevo'}</Text>
                                    <Text style={styles.headerTitle}>Producto</Text>
                                </View>
                                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                    <Ionicons name="close" size={24} color={colors.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                {/* IMAGE UPLOAD */}
                                <TouchableOpacity
                                    style={styles.imageWrapper}
                                    onPress={onPickImage}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.imageCircle}>
                                        {imagen ? (
                                            <Image source={{ uri: imagen }} style={styles.imagePreview} />
                                        ) : (
                                            <Ionicons name="camera-outline" size={40} color={colors.primary} />
                                        )}
                                    </View>
                                    <View style={styles.imageBadge}>
                                        <Text style={styles.imageBadgeText}>TOCA PARA FOTO</Text>
                                    </View>
                                </TouchableOpacity>

                                {/* BASIC INFO (NAME FIRST) */}
                                <Text style={styles.inputLabel}>Información del Producto</Text>
                                <TextInput
                                    style={styles.mainInput}
                                    placeholder="Nombre del Producto"
                                    placeholderTextColor={colors.textMuted}
                                    value={nombre}
                                    onChangeText={setNombre}
                                />

                                <View style={styles.row}>
                                    <View style={styles.col}>
                                        <Text style={styles.inputLabel}>Precio ($)</Text>
                                        <TextInput
                                            style={[styles.mainInput, { marginBottom: suggestedStrategyPrice ? 4 : 20 }]}
                                            placeholder="0.00"
                                            placeholderTextColor={colors.textMuted}
                                            value={precio}
                                            onChangeText={setPrecio}
                                            keyboardType="numeric"
                                        />
                                        {suggestedStrategyPrice && (
                                            <Animated.View entering={FadeInDown} style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                marginBottom: 16,
                                                backgroundColor: 'rgba(217, 119, 6, 0.1)', // Fondo ámbar muy suave
                                                paddingVertical: 5,
                                                paddingHorizontal: 8,
                                                borderRadius: 8,
                                                alignSelf: 'flex-start'
                                            }}>
                                                <Ionicons name="sparkles" size={12} color="#d97706" style={{ marginRight: 4 }} />
                                                <Text style={{ fontSize: 11, color: '#d97706', fontWeight: '800' }}>
                                                    Sugerido: ${suggestedStrategyPrice}
                                                </Text>
                                            </Animated.View>
                                        )}
                                    </View>
                                    <View style={styles.col}>
                                        <Text style={styles.inputLabel}>Categoría</Text>
                                        <View style={styles.categoryGrid}>
                                            {[
                                                { id: 'comida', icon: 'restaurant-outline' },
                                                { id: 'bebida', icon: 'water-outline' },
                                                { id: 'postre', icon: 'ice-cream-outline' },
                                                { id: 'otro', icon: 'grid-outline' },
                                            ].map((cat) => (
                                                <TouchableOpacity
                                                    key={cat.id}
                                                    style={[
                                                        styles.categoryItem,
                                                        categoria === cat.id && styles.categoryItemActive
                                                    ]}
                                                    onPress={() => setCategoria(cat.id)}
                                                >
                                                    <Ionicons
                                                        name={cat.icon as any}
                                                        size={20}
                                                        color={categoria === cat.id ? '#fff' : colors.textPrimary}
                                                    />
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </View>

                                <Text style={styles.inputLabel}>Descripción</Text>
                                <TextInput
                                    style={[styles.mainInput, styles.descriptionInput]}
                                    placeholder="Detalles sobre este producto..."
                                    placeholderTextColor={colors.textMuted}
                                    value={descripcion}
                                    onChangeText={setDescripcion}
                                    multiline
                                />

                                <View style={styles.toggleCard}>
                                    <View style={styles.toggleInfo}>
                                        <Text style={styles.toggleLabel}>Visible en Menú</Text>
                                        <Text style={styles.toggleSub}>ESTADO DE DISPONIBILIDAD PARA EL CLIENTE</Text>
                                    </View>
                                    <Switch
                                        value={disponible}
                                        onValueChange={setDisponible}
                                        trackColor={{ false: colors.border, true: colors.primary }}
                                        thumbColor="#fff"
                                    />
                                </View>

                                {/* 🤖 CAITLYN ASSISTANT CARD */}
                                <View style={styles.caitlynCard}>
                                    <View style={styles.caitlynHeader}>
                                        <View style={styles.caitlynIconCircle}>
                                            <Ionicons name="sparkles" size={20} color="#fff" />
                                        </View>
                                        <View style={styles.caitlynHeaderText}>
                                            <Text style={styles.caitlynTitle}>Asistente Caitlyn</Text>
                                            <Text style={styles.caitlynSub}>
                                                {(backendCostoTotal || 0) > 0 ? (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Ionicons name="stats-chart" size={14} color="#fff" style={{ marginRight: 6 }} />
                                                        <Text style={styles.caitlynSub}>COSTO REAL: ${backendCostoTotal?.toFixed(2)}</Text>
                                                    </View>
                                                ) : 'Sugerencias inteligentes con IA'}
                                            </Text>
                                        </View>
                                        {/* Precio sugerido movido como Box Boton abajo */}
                                    </View>

                                    {loadingCaitlyn && !productAdvice && !suggestedStrategyPrice && (
                                        <View style={{ padding: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                                            <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 10 }} />
                                            <Text style={{ color: colors.textMuted, fontSize: 13, fontStyle: 'italic' }}>Caitlyn está analizando el mercado...</Text>
                                        </View>
                                    )}

                                    {productAdvice && editItem && !suggestedStrategyPrice && (
                                        <Animated.View entering={FadeInDown} style={styles.caitlynInsightBox}>
                                            <Ionicons name="bulb-outline" size={18} color={colors.primary} style={{ marginRight: 8, marginTop: 2 }} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.caitlynInsightText}>{productAdvice}</Text>
                                                {loadingCaitlyn && (
                                                    <ActivityIndicator size="small" color={colors.primary} style={{ alignSelf: 'flex-end', marginTop: 10 }} />
                                                )}
                                            </View>
                                        </Animated.View>
                                    )}

                                    {sugerenciaIA && (
                                        <Animated.View entering={FadeInDown} style={styles.sugerenciaPreviewBox}>
                                            <Text style={styles.sugerenciaTitle}>RECETA SUGERIDA POR CAITLYN</Text>
                                            <View style={styles.sugerenciaList}>
                                                {sugerenciaIA.map((ing, idx) => (
                                                    <Text key={idx} style={styles.sugerenciaItem}>
                                                        • {ing.nombreDisplay || ing.nombre || 'Insumo'}: {ing.cantidad} {ing.unidad}
                                                    </Text>
                                                ))}
                                            </View>

                                            {faltantesIA && faltantesIA.length > 0 && (
                                                <View style={{ backgroundColor: '#ef444415', padding: 10, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#ef4444', marginTop: 8 }}>
                                                    <Text style={{ fontSize: 11, fontWeight: '900', color: '#ef4444' }}>FALTANTES EN INVENTARIO:</Text>
                                                    <Text style={{ fontSize: 11, color: '#ef4444' }}>{faltantesIA.join(', ')}</Text>
                                                    <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>* Deberás comprar estos insumos antes de preparar esta receta.</Text>
                                                </View>
                                            )}

                                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                                                <TouchableOpacity style={[styles.applyRecipeBtn, { flex: 1.5 }]} onPress={handleApplyRecipe}>
                                                    <Ionicons name="checkmark-done" size={20} color="#fff" style={{ marginRight: 8 }} />
                                                    <Text style={styles.applyRecipeText}>APLICAR RECETA</Text>
                                                </TouchableOpacity>

                                                {backendPrecioSugerido && backendPrecioSugerido > 0 && (
                                                    <TouchableOpacity
                                                        style={styles.suggestionButton}
                                                        onPress={onApplySuggestion}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Text style={styles.suggestionButtonValue}>${backendPrecioSugerido.toFixed(2)}</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </Animated.View>
                                    )}

                                    <View>
                                        {showSizePrompt ? (
                                            <Animated.View entering={FadeInDown} style={styles.caitlynPromptBox}>
                                                <Text style={[styles.caitlynSub, { marginBottom: 8, color: colors.primary }]}>
                                                    {isLiquid ? '¿De qué tamaño es tu bebida para calcularla?' : '¿Cuál es el tamaño de la ración?'}
                                                </Text>
                                                <View style={styles.caitlynInputRow}>
                                                    <TextInput
                                                        style={styles.caitlynInput}
                                                        placeholder={isLiquid ? "Ej: 16oz, 500ml, Jumbo" : "Ej: 250g, 1 ración"}
                                                        placeholderTextColor={colors.textMuted}
                                                        value={servingSize}
                                                        onChangeText={onServingSizeChange}
                                                    />
                                                    <TouchableOpacity
                                                        style={styles.caitlynActionBtn}
                                                        onPress={onPreSugerirReceta}
                                                        disabled={loadingRecipe}
                                                    >
                                                        {loadingRecipe ? (
                                                            <ActivityIndicator size="small" color="#fff" />
                                                        ) : (
                                                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                                                        )}
                                                    </TouchableOpacity>
                                                </View>
                                            </Animated.View>
                                        ) : (
                                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                                <TouchableOpacity
                                                    style={[styles.caitlynSuggestBtn, { flex: 1.5 }]}
                                                    onPress={onPreSugerirReceta}
                                                    disabled={loadingRecipe}
                                                >
                                                    {loadingRecipe ? (
                                                        <ActivityIndicator size="small" color={colors.primary} />
                                                    ) : (
                                                        <>
                                                            <Ionicons name="color-wand-outline" size={20} color={colors.primary} />
                                                            <Text style={styles.caitlynSuggestText}>
                                                                {ingredientes.length > 0 ? 'RE-SUGERIR' : (isLiquid ? '¿TAMAÑO?' : '¿SUGERIR RECETA?')}
                                                            </Text>
                                                        </>
                                                    )}
                                                </TouchableOpacity>

                                                {(backendPrecioSugerido || 0) > 0 && (
                                                    <TouchableOpacity
                                                        style={[styles.suggestionButton, { height: 50, borderRadius: 18 }]}
                                                        onPress={onApplySuggestion}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Text style={[styles.suggestionButtonLabel, { fontSize: 8 }]}>APLICAR PRECIO</Text>
                                                        <Text style={styles.suggestionButtonValue}>${backendPrecioSugerido?.toFixed(2)}</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* RECIPE SECTION */}
                                <View style={styles.recipeHeader}>
                                    <View>
                                        <Text style={styles.recipeTitle}>Recetario y Costos</Text>
                                        <Text style={styles.toggleSub}>GESTIÓN DE INSUMOS Y RENTABILIDAD</Text>
                                    </View>
                                    <TouchableOpacity style={styles.addBtn} onPress={onAddIngrediente}>
                                        <Ionicons name="add" size={20} color={colors.primary} />
                                        <Text style={styles.addBtnText}>Añadir</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.recipeContainer}>
                                    {ingredientes.map((ing, index) => {
                                        const inv = itemsInventario.find(i => i._id === (ing.inventario?._id || ing.inventario));

                                        // STOCK STATUS ICONS
                                        let statusIcon = "checkmark-circle";
                                        let statusColor = "#10b981";
                                        if (ing.is_missing) {
                                            statusIcon = "close-circle";
                                            statusColor = "#ef4444";
                                        } else if (ing.stock_status === 'bajo') {
                                            statusIcon = "alert-circle";
                                            statusColor = "#f59e0b";
                                        }

                                        return (
                                            <Animated.View
                                                layout={Layout.springify()}
                                                key={index}
                                                entering={FadeInDown.delay(index * 50)}
                                            >
                                                <Swipeable renderRightActions={() => renderRightActions(index)}>
                                                    <View style={styles.ingredientRow}>
                                                        <View style={styles.statusIconBox}>
                                                            <Ionicons name={statusIcon as any} size={22} color={statusColor} />
                                                        </View>
                                                        <View style={styles.ingredientInfo}>
                                                            <Text style={styles.ingredientName}>
                                                                {inv?.nombre || ing.nombreDisplay || ing.nombre || (typeof ing.inventario === 'object' ? ing.inventario?.nombre : '') || 'Seleccionar...'}
                                                            </Text>
                                                            <View style={styles.qtyUnitRow}>
                                                                <TextInput
                                                                    style={styles.qtyInput}
                                                                    value={ing.cantidad.toString()}
                                                                    onChangeText={(v) => onChangeIngrediente(index, 'cantidad', v)}
                                                                    keyboardType="numeric"
                                                                />
                                                                <Text style={styles.unitLabel}>
                                                                    {ing.unidad || inv?.unit || inv?.unidad || 'unid'}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                                                    </View>
                                                </Swipeable>
                                                {index < ingredientes.length - 1 && <View style={styles.ingredientSeparator} />}
                                            </Animated.View>
                                        );
                                    })}
                                </View>
                            </ScrollView>

                            {/* FOOTER */}
                            <View style={styles.footer}>
                                <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                                    <Ionicons name="close" size={24} color={colors.textMuted} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.btnSubmit}
                                    onPress={onSubmit}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.btnSubmitText}>Guardar Cambios</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </KeyboardAvoidingView>
                </Animated.View>
            </GestureHandlerRootView>
        </Modal>
    );
};
