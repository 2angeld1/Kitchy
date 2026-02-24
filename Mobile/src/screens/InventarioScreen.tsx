import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, RefreshControl, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInDown, FadeIn } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../theme';
import { styles } from '../styles/InventarioScreen.styles';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';
import { useInventario, InventarioItem } from '../hooks/useInventario';
import { KitchyInput } from '../components/KitchyInput';
import { KitchyButton } from '../components/KitchyButton';
import Toast from 'react-native-toast-message';
import * as DocumentPicker from 'expo-document-picker';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { TouchableOpacity as GHTouchableOpacity } from 'react-native-gesture-handler';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

export default function InventarioScreen() {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    const {
        loading, refreshing, error, success, clearError, clearSuccess, itemsFiltrados,
        showModal, setShowModal, showMovModal, setShowMovModal,
        editItem, selectedItem, movTipo, movCantidad, setMovCantidad,
        movMotivo, setMovMotivo, movCosto, setMovCosto,
        filtro, setFiltro, smartText, setSmartText,
        nombre, setNombre, descripcion, setDescripcion,
        cantidad, setCantidad, unidad, setUnidad,
        cantidadMinima, setCantidadMinima, costoUnitario, setCostoUnitario,
        categoria, setCategoria, proveedor, setProveedor,
        handleRefresh, resetForm, openEditModal, handleSubmit, handleDelete,
        openMovModal, handleMovimiento, handleImportCsv, handleSmartAction,
        isListening, setIsListening
    } = useInventario();

    useSpeechRecognitionEvent("start", () => setIsListening(true));
    useSpeechRecognitionEvent("end", () => setIsListening(false));
    useSpeechRecognitionEvent("result", (event) => {
        setSmartText(event.results[0]?.transcript || '');
    });
    useSpeechRecognitionEvent("error", (event) => {
        console.warn("Speech error:", event);
        setIsListening(false);
    });

    React.useEffect(() => {
        if (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error,
                position: 'top',
                onHide: clearError
            });
        }
    }, [error]);

    React.useEffect(() => {
        if (success) {
            Toast.show({
                type: 'success',
                text1: 'Éxito',
                text2: success,
                position: 'top',
                onHide: clearSuccess
            });
        }
    }, [success]);

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

    const startListening = async () => {
        if (isListening) {
            ExpoSpeechRecognitionModule.stop();
            return;
        }

        const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!granted) {
            Toast.show({
                type: 'error',
                text1: 'Permiso Denegado',
                text2: 'Necesitamos usar el micrófono para escuchar tu pedido.',
            });
            return;
        }

        try {
            ExpoSpeechRecognitionModule.start({
                lang: "es-ES",
                interimResults: true,
                maxAlternatives: 1,
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Tu dispositivo no soporta dictado por voz de forma nativa.',
            });
            setIsListening(false);
        }
    };

    const renderRightActions = (item: InventarioItem) => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%' }}>
                <TouchableOpacity
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', width: 60, height: '100%', justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => openMovModal(item, 'entrada')}
                >
                    <Ionicons name="arrow-up" size={22} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', width: 60, height: '100%', justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => openMovModal(item, 'salida')}
                >
                    <Ionicons name="arrow-down" size={22} color="#f59e0b" />
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

    const renderItemCard = (item: InventarioItem, index: number) => {
        const isBajoStock = item.cantidad <= item.cantidadMinima;

        return (
            <Animated.View key={item._id} entering={FadeInDown.delay(index * 50)}>
                <Swipeable renderRightActions={() => renderRightActions(item)}>
                    <GHTouchableOpacity
                        style={[styles.itemCard, { backgroundColor: colors.background, borderBottomColor: colors.border }]}
                        onPress={() => openEditModal(item)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.itemIconBox, { backgroundColor: colors.card }]}>
                            <Ionicons
                                name={item.categoria === 'comida' ? 'restaurant-outline' : item.categoria === 'bebida' ? 'cafe-outline' : 'cube-outline'}
                                size={24}
                                color={colors.primary}
                            />
                        </View>

                        <View style={styles.itemInfo}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                <Text style={[styles.itemTitle, { color: colors.textPrimary }]} numberOfLines={1}>{item.nombre}</Text>
                                <Text style={[styles.itemSub, { color: colors.textMuted, marginHorizontal: 6 }]}>•</Text>
                                <Text style={[styles.itemTitle, { color: colors.primary, flexShrink: 1 }]} numberOfLines={1}>{item.cantidad} {item.unidad}</Text>
                            </View>
                            <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                                ${(item.costoUnitario || 0).toFixed(2)} / ud
                            </Text>
                            {isBajoStock && (
                                <Text style={styles.stockWarning}>Bajo Stock (Min: {item.cantidadMinima})</Text>
                            )}
                        </View>
                        <Ionicons name="chevron-back" size={18} color={colors.textMuted} style={{ opacity: 0.8 }} />
                    </GHTouchableOpacity>
                </Swipeable>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <KitchyToolbar title="Inventario" />

            {/* Búsqueda rápida */}
            <View style={styles.headerRow}>
                <View style={[styles.searchInputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="search-outline" size={20} color={colors.textMuted} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.textPrimary }]}
                        placeholder="Buscar producto..."
                        placeholderTextColor={colors.textMuted}
                        value={smartText}
                        onChangeText={setSmartText}
                        onSubmitEditing={handleSmartAction}
                        returnKeyType="search"
                    />
                    <TouchableOpacity onPress={startListening}>
                        <Ionicons name={isListening ? "mic" : "mic-outline"} size={22} color={isListening ? colors.primary : colors.textMuted} />
                    </TouchableOpacity>
                </View>
            </View>

            {isListening ? (
                <Animated.Text entering={FadeInDown} style={{ paddingHorizontal: 24, fontSize: 12, color: colors.primary, marginBottom: 8, fontStyle: 'italic' }}>
                    🎙️ Te escucho... Ej: "Gasté 5 litros de leche"
                </Animated.Text>
            ) : (
                <Text style={{ paddingHorizontal: 24, fontSize: 12, color: colors.textMuted, marginBottom: 8, fontStyle: 'italic' }}>
                    💡 Escribe o dicta: "5 tomates a 10 dólares" o "usé 2 libras de carne"
                </Text>
            )}

            {/* Filtros Horizontales */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterOptions}>
                    {['todos', 'stockBajo', 'ingrediente'].map(opcion => (
                        <TouchableOpacity
                            key={opcion}
                            style={[
                                styles.filterChip,
                                { backgroundColor: colors.card, borderColor: colors.border },
                                filtro === opcion && { backgroundColor: colors.primary, borderColor: colors.primary }
                            ]}
                            onPress={() => setFiltro(opcion)}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: colors.textSecondary },
                                filtro === opcion && { color: colors.white }
                            ]}>
                                {opcion === 'stockBajo' ? 'Bajo Stock' : opcion === 'ingrediente' ? 'Insumos' : 'Todos'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
                }
            >
                {loading && !refreshing && itemsFiltrados.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : itemsFiltrados.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cube-outline" size={48} color={colors.border} />
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>Inventario vacío.</Text>
                    </View>
                ) : (
                    itemsFiltrados.map((item, i) => renderItemCard(item, i))
                )}
            </ScrollView>

            {/* Import Data FAB */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.surface, bottom: 90, borderWidth: 1, borderColor: colors.border }]}
                onPress={pickDocument}
            >
                <Ionicons name="cloud-download-outline" size={24} color={colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => { resetForm(); setShowModal(true); }}
            >
                <Ionicons name="add" size={30} color={colors.white} />
            </TouchableOpacity>

            {/* Modal de Crear/Editar Item */}
            <Modal visible={showModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <Animated.View entering={SlideInDown.springify().damping(15)} style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                                {editItem ? 'Editar Item' : 'Nuevo Item'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Ionicons name="close-circle" size={32} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                            <KitchyInput label="Nombre" value={nombre} onChangeText={setNombre} placeholder="Ej. Lomo de Res" />
                            <KitchyInput label="Descripción (Opcional)" value={descripcion} onChangeText={setDescripcion} placeholder="Para cocina" />

                            <View style={styles.formRow}>
                                <View style={styles.inputSmall}>
                                    <KitchyInput label="Cantidad" value={cantidad} onChangeText={setCantidad} keyboardType="numeric" placeholder="0" />
                                </View>
                                <View style={styles.inputSmall}>
                                    <KitchyInput label="Medida" value={unidad} onChangeText={setUnidad} placeholder="kg, litros, ud" />
                                </View>
                            </View>

                            <View style={styles.formRow}>
                                <View style={styles.inputSmall}>
                                    <KitchyInput label="Costo / Ud" value={costoUnitario} onChangeText={setCostoUnitario} keyboardType="numeric" placeholder="$0.00" />
                                </View>
                                <View style={styles.inputSmall}>
                                    <KitchyInput label="Min Stock" value={cantidadMinima} onChangeText={setCantidadMinima} keyboardType="numeric" placeholder="Min" />
                                </View>
                            </View>

                            <KitchyInput label="Categoría" value={categoria} onChangeText={setCategoria} placeholder="ingrediente, comida" />
                            <KitchyInput label="Proveedor (Opcional)" value={proveedor} onChangeText={setProveedor} placeholder="Meat Co." />

                            <View style={styles.actionButtonGroup}>
                                <KitchyButton
                                    title={editItem ? 'Actualizar' : 'Guardar'}
                                    onPress={handleSubmit}
                                    loading={loading}
                                    variant="primary"
                                />
                                {editItem && (
                                    <TouchableOpacity
                                        style={{ justifyContent: 'center', paddingHorizontal: 20 }}
                                        onPress={() => {
                                            setShowModal(false);
                                            handleDelete(editItem._id);
                                        }}
                                    >
                                        <Text style={{ color: colors.error, fontWeight: 'bold' }}>Eliminar</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </ScrollView>
                    </Animated.View>
                </View>
            </Modal>

            {/* Modal de Movimientos */}
            <Modal visible={showMovModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <Animated.View entering={SlideInDown.springify().damping(15)} style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                                {movTipo === 'entrada' ? 'Registrar Entrada' : 'Registrar Salida'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowMovModal(false)}>
                                <Ionicons name="close-circle" size={32} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ fontFamily: 'Inter_500Medium', color: colors.textSecondary, marginBottom: 20 }}>
                            Producto: {selectedItem?.nombre} ({selectedItem?.cantidad} {selectedItem?.unidad} actuales)
                        </Text>

                        <KitchyInput label="Cantidad" value={movCantidad} onChangeText={setMovCantidad} keyboardType="numeric" placeholder="0" />
                        <KitchyInput label="Motivo (Opcional)" value={movMotivo} onChangeText={setMovMotivo} placeholder="Compra, Merma, etc..." />

                        {movTipo === 'entrada' && (
                            <KitchyInput label="Costo Total (Opcional)" value={movCosto} onChangeText={setMovCosto} keyboardType="numeric" placeholder="$0.00" />
                        )}

                        <KitchyButton
                            title="Confirmar"
                            onPress={handleMovimiento}
                            loading={loading}
                            variant={movTipo === 'entrada' ? 'primary' : 'dark'}
                        />
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}
