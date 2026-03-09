import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, RefreshControl, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, SlideInDown, FadeIn } from 'react-native-reanimated';
import { lightTheme, darkTheme, spacing } from '../theme';
import { styles } from '../styles/InventarioScreen.styles';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';
import { useInventario, InventarioItem } from '../hooks/useInventario';
import { KitchyInput } from '../components/KitchyInput';
import { KitchyButton } from '../components/KitchyButton';
import Toast from 'react-native-toast-message';
import { CameraView } from 'expo-camera';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { TouchableOpacity as GHTouchableOpacity } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { WebScanner } from '../components/WebScanner';

export default function InventarioScreen() {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    const {
        loading, refreshing, error, success, isAnalyzing, clearError, clearSuccess, itemsFiltrados,
        showModal, setShowModal, showMovModal, setShowMovModal, showScanner, setShowScanner,
        showInvoiceReview, setShowInvoiceReview, invoiceItems, setInvoiceItems,
        invoiceFiltro, setInvoiceFiltro, invoiceItemsFiltrados, invoiceStatusCounts, getInvoiceItemStatus,
        editItem, selectedItem, movTipo, setMovTipo, movCantidad, setMovCantidad,
        movMotivo, setMovMotivo, movCosto, setMovCosto,
        filtro, setFiltro, smartText, setSmartText,
        nombre, setNombre, descripcion, setDescripcion,
        cantidad, setCantidad, unidad, setUnidad,
        cantidadMinima, setCantidadMinima, costoUnitario, setCostoUnitario,
        categoria, setCategoria, proveedor, setProveedor,
        codigoBarras, setCodigoBarras, fechaVencimiento, setFechaVencimiento,
        hasPermission, scanned, scannerZoom, tapCoords, scannerSettings, isListening, searchingGlobal,
        handleRefresh, resetForm, openEditModal, handleSubmit, handleDelete,
        openMovModal, handleMovimiento, handleSmartAction,
        handleBarCodeScanned, openScanner, handleScannerTap, requestCameraPermission,
        pickDocument, startListening, handleCaitlynInvoice, tomarFotoFactura, seleccionarImagenGaleria, handleConfirmInvoiceItems
    } = useInventario();

    // Mapa de colores por estado de item de factura
    const statusColors: Record<string, { bg: string; border: string; text: string; label: string; icon: string }> = {
        coincide: { bg: 'rgba(16, 185, 129, 0.10)', border: '#10b981', text: '#059669', label: 'Coincide', icon: 'checkmark-circle' },
        similar: { bg: 'rgba(245, 158, 11, 0.10)', border: '#f59e0b', text: '#d97706', label: 'Similar', icon: 'help-circle' },
        nuevo: { bg: colors.card, border: colors.border, text: colors.textMuted, label: 'Nuevo', icon: 'add-circle' },
        incompleto: { bg: 'rgba(239, 68, 68, 0.10)', border: '#ef4444', text: '#dc2626', label: 'Incompleto', icon: 'alert-circle' },
    };

    React.useEffect(() => {
        if (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: error, position: 'top', onHide: clearError });
        }
    }, [error]);

    React.useEffect(() => {
        if (success) {
            Toast.show({ type: 'success', text1: 'Éxito', text2: success, position: 'top', onHide: clearSuccess });
        }
    }, [success]);

    const renderRightActions = (item: InventarioItem) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%' }}>
            <TouchableOpacity style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', width: 60, height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => openMovModal(item, 'entrada')}>
                <Ionicons name="arrow-up" size={22} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', width: 60, height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => openMovModal(item, 'salida')}>
                <Ionicons name="cart-outline" size={22} color="#f59e0b" />
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', width: 60, height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => openMovModal(item, 'merma')}>
                <Ionicons name="flask-outline" size={22} color="#10b981" />
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: colors.surface, width: 60, height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => openEditModal(item)}>
                <Ionicons name="pencil" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={{ backgroundColor: 'rgba(225, 29, 72, 0.1)', width: 60, height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => handleDelete(item._id)}>
                <Ionicons name="trash" size={22} color="#e11d48" />
            </TouchableOpacity>
        </View>
    );

    const renderItemCard = (item: InventarioItem, index: number) => {
        const isBajoStock = item.cantidad <= item.cantidadMinima;
        const hoy = new Date();
        const tresDias = new Date();
        tresDias.setDate(hoy.getDate() + 3);
        const estaPorVencer = item.fechaVencimiento && new Date(item.fechaVencimiento) <= tresDias;

        return (
            <Animated.View key={item._id} entering={FadeInDown.delay(index * 50)}>
                <Swipeable renderRightActions={() => renderRightActions(item)}>
                    <GHTouchableOpacity
                        style={[styles.itemCard, { backgroundColor: colors.background, borderBottomColor: colors.border }, estaPorVencer && { borderLeftWidth: 4, borderLeftColor: colors.primary }]}
                        onPress={() => openEditModal(item)}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.itemIconBox, { backgroundColor: colors.card }]}>
                            <Ionicons name={item.categoria === 'comida' ? 'restaurant-outline' : item.categoria === 'bebida' ? 'cafe-outline' : 'cube-outline'} size={24} color={colors.primary} />
                            {estaPorVencer && <View style={{ position: 'absolute', top: -4, right: -4 }}><Ionicons name="alert-circle" size={16} color={colors.primary} /></View>}
                        </View>
                        <View style={styles.itemInfo}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                <Text style={[styles.itemTitle, { color: colors.textPrimary }]} numberOfLines={1}>{item.nombre}</Text>
                                <Text style={[styles.itemSub, { color: colors.textMuted, marginHorizontal: 6 }]}>•</Text>
                                <Text style={[styles.itemTitle, { color: colors.primary, flexShrink: 1 }]} numberOfLines={1}>{item.cantidad} {item.unidad}</Text>
                            </View>
                            <Text style={[styles.itemSub, { color: colors.textSecondary }]}>${(item.costoUnitario || 0).toFixed(2)} / ud</Text>
                            {isBajoStock && <Text style={styles.stockWarning}>Bajo Stock (Min: {item.cantidadMinima})</Text>}
                            {item.fechaVencimiento && (
                                <Text style={{ fontSize: 10, color: estaPorVencer ? colors.primary : colors.textMuted, marginTop: 2, fontWeight: estaPorVencer ? 'bold' : 'normal' }}>
                                    Vence: {new Date(item.fechaVencimiento).toLocaleDateString()}
                                </Text>
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
                    <TouchableOpacity onPress={startListening} style={{ paddingHorizontal: 4 }}>
                        <Ionicons name={isListening ? "mic" : "mic-outline"} size={22} color={isListening ? colors.primary : colors.textMuted} />
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={{ paddingHorizontal: 24, fontSize: 12, color: isListening ? colors.primary : colors.textMuted, marginBottom: 8, fontStyle: 'italic' }}>
                {isListening ? '🎙️ Te escucho... Ej: "Gasté 5 litros de leche"' : '💡 Escribe o dicta: "5 tomates a 10 dólares" o "usé 2 libras de carne"'}
            </Text>

            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterOptions}>
                    {['todos', 'stockBajo', 'ingrediente'].map(opcion => (
                        <TouchableOpacity
                            key={opcion}
                            style={[styles.filterChip, { backgroundColor: colors.card, borderColor: colors.border }, filtro === opcion && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                            onPress={() => setFiltro(opcion)}
                        >
                            <Text style={[styles.filterText, { color: colors.textSecondary }, filtro === opcion && { color: colors.white }]}>
                                {opcion === 'stockBajo' ? 'Bajo Stock' : opcion === 'ingrediente' ? 'Insumos' : 'Todos'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}>
                {loading && !refreshing && itemsFiltrados.length === 0 ? (
                    <View style={styles.emptyContainer}><ActivityIndicator size="large" color={colors.primary} /></View>
                ) : itemsFiltrados.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cube-outline" size={48} color={colors.border} /><Text style={[styles.emptyText, { color: colors.textMuted }]}>Inventario vacío.</Text>
                    </View>
                ) : (
                    itemsFiltrados.map((item, i) => renderItemCard(item, i))
                )}
            </ScrollView>

            <View style={{ position: 'absolute', bottom: spacing.lg, right: spacing.xl, gap: spacing.md }}>
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: '#4f46e5', position: 'relative', right: 0, bottom: 0 }]}
                    onPress={tomarFotoFactura}
                >
                    <Ionicons name="camera" size={24} color={colors.white} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: '#6366f1', position: 'relative', right: 0, bottom: 0 }]}
                    onPress={seleccionarImagenGaleria}
                >
                    <Ionicons name="images" size={24} color={colors.white} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.fab, { backgroundColor: colors.surface, position: 'relative', right: 0, bottom: 0, borderWidth: 1, borderColor: colors.border }]} onPress={openScanner}>
                    <Ionicons name="barcode-outline" size={24} color={colors.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.fab, { backgroundColor: colors.surface, position: 'relative', right: 0, bottom: 0, borderWidth: 1, borderColor: colors.border }]} onPress={pickDocument}>
                    <Ionicons name="cloud-download-outline" size={24} color={colors.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary, position: 'relative', right: 0, bottom: 0 }]} onPress={() => { resetForm(); setShowModal(true); }}>
                    <Ionicons name="add" size={30} color={colors.white} />
                </TouchableOpacity>
            </View>

            {/* Modal de Crear/Editar Item */}
            <Modal visible={showModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <Animated.View entering={SlideInDown.springify().damping(15)} style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{editItem ? 'Editar Item' : 'Nuevo Item'}</Text>
                                {searchingGlobal && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                        <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 6 }} />
                                        <Text style={{ fontSize: 10, color: colors.textMuted }}>Buscando información del producto...</Text>
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close-circle" size={32} color={colors.textMuted} /></TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                            <KitchyInput label="Nombre" value={nombre} onChangeText={setNombre} />
                            <KitchyInput label="Descripción" value={descripcion} onChangeText={setDescripcion} />
                            <View style={styles.formRow}>
                                <View style={styles.inputSmall}><KitchyInput label="Cantidad" value={cantidad} onChangeText={setCantidad} keyboardType="numeric" /></View>
                                <View style={styles.inputSmall}><KitchyInput label="Medida" value={unidad} onChangeText={setUnidad} /></View>
                            </View>
                            <View style={styles.formRow}>
                                <View style={styles.inputSmall}><KitchyInput label="Costo / Ud" value={costoUnitario} onChangeText={setCostoUnitario} keyboardType="numeric" /></View>
                                <View style={styles.inputSmall}><KitchyInput label="Min Stock" value={cantidadMinima} onChangeText={setCantidadMinima} keyboardType="numeric" /></View>
                            </View>
                            <KitchyInput label="Categoría" value={categoria} onChangeText={setCategoria} />
                            <KitchyInput label="Código de Barras" value={codigoBarras} onChangeText={setCodigoBarras} />
                            <KitchyInput label="Fecha Vencimiento" value={fechaVencimiento} onChangeText={setFechaVencimiento} />
                            <KitchyButton title={editItem ? 'Actualizar' : 'Guardar'} onPress={handleSubmit} loading={loading} variant="primary" />
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
                                {movTipo === 'entrada' ? 'Registrar Entrada' : movTipo === 'merma' ? 'Reportar Merma' : 'Registrar Salida'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowMovModal(false)}>
                                <Ionicons name="close-circle" size={32} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ fontFamily: 'Inter_500Medium', color: colors.textSecondary, marginBottom: 20 }}>
                            Item: <Text style={{ fontWeight: '800', color: colors.textPrimary }}>{selectedItem?.nombre}</Text>
                        </Text>

                        {movTipo === 'entrada' && (
                            <KitchyInput label="Costo Total de la Compra" value={movCosto} onChangeText={setMovCosto} keyboardType="numeric" placeholder="$0.00" />
                        )}
                        <KitchyInput label="Cantidad" value={movCantidad} onChangeText={setMovCantidad} keyboardType="numeric" placeholder="0" />
                        <KitchyInput label="Motivo / Nota" value={movMotivo} onChangeText={setMovMotivo} placeholder={movTipo === 'merma' ? 'Ej. Producto vencido en estante' : 'Ej. Uso en cocina'} />

                        <KitchyButton
                            title="Confirmar"
                            onPress={handleMovimiento}
                            loading={loading}
                            variant={movTipo === 'entrada' ? 'primary' : 'dark'}
                        />
                    </Animated.View>
                </View>
            </Modal>

            {/* Modal de Escaneo */}
            <Modal visible={showScanner} animationType="slide" onRequestClose={() => setShowScanner(false)}>
                <View style={{ flex: 1, backgroundColor: '#000' }}>
                    {hasPermission === null ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={colors.primary} /></View>
                    ) : hasPermission === false ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                            <Ionicons name="camera-reverse-outline" size={64} color={colors.error} />
                            <Text style={{ color: '#fff', marginTop: 20, textAlign: 'center', fontSize: 18 }}>Sin permiso de cámara</Text>
                            <TouchableOpacity onPress={requestCameraPermission} style={{ backgroundColor: colors.primary, marginTop: 20, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 25 }}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Habilitar</Text>
                            </TouchableOpacity>
                        </View>
                    ) : Platform.OS === 'web' ? (
                        <WebScanner
                            onScanned={handleBarCodeScanned}
                            onClose={() => setShowScanner(false)}
                        />
                    ) : (
                        <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={handleScannerTap}>
                            <CameraView
                                style={{ flex: 1 }}
                                facing="back"
                                zoom={scannerZoom}
                                barcodeScannerSettings={scannerSettings}
                                onBarcodeScanned={scanned ? undefined : (result) => handleBarCodeScanned(result.data)}
                            />
                            {tapCoords && (
                                <Animated.View entering={FadeIn} style={{ position: 'absolute', left: tapCoords.x - 30, top: tapCoords.y - 30, width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: colors.primary, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                            )}
                            <View style={{ position: 'absolute', top: 100, left: 20, right: 20, alignItems: 'center' }}>
                                <View style={{ width: 250, height: 250, borderWidth: 2, borderColor: colors.primary, borderStyle: 'dotted', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                                <Text style={{ color: '#fff', marginTop: 20, fontSize: 16, textAlign: 'center', fontWeight: '600' }}>Apunta al código de barras</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.6)', marginTop: 10, fontSize: 12 }}>Toca la pantalla para enfocar</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    <View style={{ position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => setShowScanner(false)} style={{ backgroundColor: colors.primary, paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 }}>
                            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {/* Modal de Revisión de Factura (IA) */}
            <Modal visible={showInvoiceReview} animationType="slide">
                <View style={{ flex: 1, backgroundColor: colors.background }}>
                    <KitchyToolbar title="Revisión de Factura" />

                    <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textPrimary }}>
                            Caitlyn detectó {invoiceItems.length} productos
                        </Text>
                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
                            Verifica la información. Los colores indican el estado de cada producto.
                        </Text>

                        {/* Leyenda rápida */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 8 }}>
                            {[
                                { color: '#10b981', label: 'Coincide' },
                                { color: '#f59e0b', label: 'Similar' },
                                { color: colors.textMuted, label: 'Nuevo' },
                                { color: '#ef4444', label: 'Incompleto' },
                            ].map(l => (
                                <View key={l.label} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: l.color, marginRight: 4 }} />
                                    <Text style={{ fontSize: 11, color: colors.textMuted }}>{l.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Chips de filtro por estado */}
                    <View style={{ paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                            {(['todos', 'coincide', 'similar', 'nuevo', 'incompleto'] as const).map(estado => {
                                const isActive = invoiceFiltro === estado;
                                const count = invoiceStatusCounts[estado];
                                const chipColor = estado === 'todos' ? colors.primary
                                    : estado === 'coincide' ? '#10b981'
                                        : estado === 'similar' ? '#f59e0b'
                                            : estado === 'incompleto' ? '#ef4444'
                                                : colors.textMuted;
                                const label = estado === 'todos' ? 'Todos'
                                    : estado === 'coincide' ? 'Coinciden'
                                        : estado === 'similar' ? 'Similares'
                                            : estado === 'nuevo' ? 'Nuevos'
                                                : 'Incompletos';

                                return (
                                    <TouchableOpacity
                                        key={estado}
                                        onPress={() => setInvoiceFiltro(estado)}
                                        style={{
                                            paddingHorizontal: 14,
                                            paddingVertical: 8,
                                            borderRadius: 20,
                                            borderWidth: 1.5,
                                            borderColor: isActive ? chipColor : colors.border,
                                            backgroundColor: isActive ? chipColor : 'transparent',
                                        }}
                                    >
                                        <Text style={{
                                            fontSize: 12,
                                            fontWeight: '700',
                                            color: isActive ? '#fff' : chipColor,
                                        }}>
                                            {label} ({count})
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }}>
                        {invoiceItemsFiltrados.map((item: any, index: number) => {
                            const status = getInvoiceItemStatus(item);
                            const sc = statusColors[status];
                            // Encontar el indice real en invoiceItems para poder editarlo
                            const realIndex = invoiceItems.indexOf(item);

                            return (
                                <Animated.View
                                    key={realIndex}
                                    entering={FadeInDown.delay(index * 30)}
                                    style={{
                                        backgroundColor: sc.bg,
                                        padding: 14,
                                        borderRadius: 12,
                                        marginBottom: 10,
                                        borderWidth: 1.5,
                                        borderColor: sc.border,
                                    }}
                                >
                                    {/* Header: nombre + badge de estado + borrar */}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <View style={{ flex: 1, marginRight: 8 }}>
                                            <TextInput
                                                style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '700', paddingVertical: 2 }}
                                                value={item.nombre}
                                                onChangeText={(text) => {
                                                    const newItems = [...invoiceItems];
                                                    newItems[realIndex] = { ...newItems[realIndex], nombre: text };
                                                    setInvoiceItems(newItems);
                                                }}
                                            />
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            {/* Badge de estado */}
                                            <View style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                backgroundColor: sc.border,
                                                paddingHorizontal: 8,
                                                paddingVertical: 3,
                                                borderRadius: 10,
                                            }}>
                                                <Ionicons name={sc.icon as any} size={12} color="#fff" style={{ marginRight: 3 }} />
                                                <Text style={{ fontSize: 10, fontWeight: '800', color: '#fff' }}>{sc.label}</Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    const newItems = invoiceItems.filter((_, i) => i !== realIndex);
                                                    setInvoiceItems(newItems);
                                                }}
                                            >
                                                <Ionicons name="close-circle" size={22} color={colors.error} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Campos editables */}
                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 10, color: sc.text, fontWeight: '600' }}>Cantidad</Text>
                                            <TextInput
                                                style={{ color: colors.textPrimary, fontSize: 15, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: sc.border }}
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
                                            <Text style={{ fontSize: 10, color: sc.text, fontWeight: '600' }}>Unidad</Text>
                                            <TextInput
                                                style={{ color: colors.textPrimary, fontSize: 15, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: sc.border }}
                                                value={item.unidad}
                                                onChangeText={(text) => {
                                                    const newItems = [...invoiceItems];
                                                    newItems[realIndex] = { ...newItems[realIndex], unidad: text };
                                                    setInvoiceItems(newItems);
                                                }}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 10, color: sc.text, fontWeight: '600' }}>Precio Ud.</Text>
                                            <TextInput
                                                style={{ color: colors.textPrimary, fontSize: 15, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: sc.border }}
                                                value={String(item.precioUnitario || '')}
                                                keyboardType="numeric"
                                                placeholder="0.00"
                                                placeholderTextColor={colors.textMuted}
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
                        {invoiceItemsFiltrados.length === 0 && (
                            <View style={{ alignItems: 'center', marginTop: 40, opacity: 0.6 }}>
                                <Ionicons name="filter-outline" size={48} color={colors.textMuted} />
                                <Text style={{ color: colors.textMuted, marginTop: 10 }}>No hay productos con este filtro</Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer con botones */}
                    <View style={{ padding: 16, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border }}>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity
                                style={{ flex: 1, height: 52, backgroundColor: colors.surface, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border }}
                                onPress={() => { setShowInvoiceReview(false); setInvoiceFiltro('todos'); }}
                            >
                                <Text style={{ color: colors.textPrimary, fontWeight: 'bold' }}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ flex: 2, height: 52, backgroundColor: colors.primary, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}
                                onPress={() => handleConfirmInvoiceItems(invoiceItems)}
                            >
                                {loading ? (
                                    <ActivityIndicator color={colors.white} />
                                ) : (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
                                        <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 16 }}>Importar ({invoiceItems.length})</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Overlay de Análisis de Caitlyn */}
            {isAnalyzing && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9999,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <BlurView
                        intensity={40}
                        tint={isDark ? "dark" : "light"}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0
                        }}
                    />
                    <Animated.View
                        entering={FadeIn}
                        style={{
                            backgroundColor: colors.card,
                            padding: 30,
                            borderRadius: 24,
                            alignItems: 'center',
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 0.1,
                            shadowRadius: 20,
                            elevation: 10,
                            borderWidth: 1,
                            borderColor: colors.border
                        }}
                    >
                        <View style={{ marginBottom: 20 }}>
                            <Ionicons name="sparkles" size={50} color={colors.primary} />
                        </View>
                        <Text style={{
                            fontSize: 20,
                            fontWeight: 'bold',
                            color: colors.textPrimary,
                            marginBottom: 8
                        }}>
                            Caitlyn está analizando...
                        </Text>
                        <Text style={{
                            fontSize: 14,
                            color: colors.textSecondary,
                            textAlign: 'center'
                        }}>
                            Extrayendo productos de tu factura
                        </Text>
                    </Animated.View>
                </View>
            )}
        </View>
    );
}
