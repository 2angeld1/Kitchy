import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, RefreshControl, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withSpring, FadeOutDown, FadeOut } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../theme';
import { createStyles } from '../styles/InventarioScreen.styles';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';
import { useAppDimensions } from '../context/DimensionsContext';
import { useInventario } from '../hooks/useInventario';
import { useAuth } from '../context/AuthContext';
import { getCategoriaNegocio } from '../utils/beauty-helpers';
import Toast from 'react-native-toast-message';

// Subcomponentes extraídos
import { InventarioItemCard } from './Inventario/components/InventarioItemCard';
import { InventarioBellezaView } from './Inventario/components/InventarioBellezaView';
import { InventarioComidaView } from './Inventario/components/InventarioComidaView';
import { InventarioFormModal } from './Inventario/components/InventarioFormModal';
import { InventarioMovimientoModal } from './Inventario/components/InventarioMovimientoModal';
import { InventarioScannerModal } from './Inventario/components/InventarioScannerModal';
import { InventarioInvoiceReviewModal } from './Inventario/components/InventarioInvoiceReviewModal';
import { InventarioConfigModal } from './Inventario/components/InventarioConfigModal';
import { updateNegocioConfig, updateComisionReventaConfig } from '../services/api';

export default function InventarioScreen() {
    const { isDark } = useTheme();
    const { width } = useAppDimensions();
    const { user } = useAuth();
    const colors = isDark ? darkTheme : lightTheme;
    const styles = useMemo(() => createStyles(colors, width), [colors, width]);

    const categoriaNegocio = useMemo(() => getCategoriaNegocio(user), [user]);

    const {
        loading, refreshing, error, success, isAnalyzing, clearError, clearSuccess, itemsFiltrados,
        showModal, setShowModal, showMovModal, setShowMovModal, showScanner, setShowScanner,
        showInvoiceReview, setShowInvoiceReview, invoiceItems, setInvoiceItems,
        invoiceMetadata, setInvoiceMetadata,
        invoiceFiltro, setInvoiceFiltro, invoiceItemsFiltrados, invoiceStatusCounts, getInvoiceItemStatus,
        editItem, selectedItem, movTipo, setMovTipo, movCantidad, setMovCantidad,
        movMotivo, setMovMotivo, movCosto, setMovCosto,
        filtro, setFiltro, smartText, setSmartText,
        nombre, setNombre, descripcion, setDescripcion,
        cantidad, setCantidad, unidad, setUnidad,
        cantidadMinima, setCantidadMinima, costoUnitario, setCostoUnitario,
        precioVenta, setPrecioVenta, suggestedPrice,
        comisionEspecialista, setComisionEspecialista,
        categoria, setCategoria, proveedor, setProveedor,
        codigoBarras, setCodigoBarras, fechaVencimiento, setFechaVencimiento,
        hasPermission, scanned, scannerZoom, tapCoords, scannerSettings, isListening, searchingGlobal,
        handleRefresh, resetForm, openEditModal, handleSubmit, handleDelete,
        openMovModal, handleMovimiento, handleSmartAction,
        handleBarCodeScanned, openScanner, handleScannerTap, requestCameraPermission,
        pickDocument, startListening, tomarFotoFactura, seleccionarImagenGaleria, handleConfirmInvoiceItems
    } = useInventario();

    const [isFabOpen, setIsFabOpen] = useState(false);

    // Estado para Configuración Estratégica
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [configInput, setConfigInput] = useState('');
    const [savingConfig, setSavingConfig] = useState(false);

    useEffect(() => {
        if (user?.negocioActivo) {
            const negocio = user.negocioActivo as any;
            if (categoriaNegocio === 'BELLEZA') {
                setConfigInput(negocio.comisionReventa?.porcentajeGlobal?.toString() || '10');
            } else {
                setConfigInput(negocio.config?.margenObjetivo?.toString() || '65');
            }
        }
    }, [user?.negocioActivo, categoriaNegocio]);

    const handleSaveConfig = async () => {
        setSavingConfig(true);
        try {
            const value = parseInt(configInput);
            if (categoriaNegocio === 'BELLEZA') {
                await updateComisionReventaConfig({ porcentajeGlobal: value });
                Toast.show({ type: 'success', text1: '¡Comisión Actualizada!', text2: 'Se aplicará a las nuevas ventas de reventa.' });
            } else {
                await updateNegocioConfig({ margenObjetivo: value });
                Toast.show({ type: 'success', text1: '¡Margen Actualizado!', text2: 'Caitlyn usará esta meta para tus insumos.' });
            }
            setShowConfigModal(false);
            handleRefresh();
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar la configuración.' });
        } finally {
            setSavingConfig(false);
        }
    };

    const fabRotation = useSharedValue(0);
    useEffect(() => {
        fabRotation.value = withSpring(isFabOpen ? 45 : 0, { damping: 15, stiffness: 150 });
    }, [isFabOpen]);

    const animatedFabStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${fabRotation.value}deg` }]
    }));

    useEffect(() => {
        if (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: error, position: 'top', onHide: clearError });
        }
    }, [error]);

    useEffect(() => {
        if (success) {
            Toast.show({ type: 'success', text1: 'Éxito', text2: success, position: 'top', onHide: clearSuccess });
        }
    }, [success]);

    return (
        <View style={styles.container}>
            <KitchyToolbar title="Inventario" />

            {/* BARRA DE BÚSQUEDA Y VOZ */}
            <View style={styles.headerRow}>
                <View style={styles.searchInputWrapper}>
                    <Ionicons name="search-outline" size={20} color={colors.textMuted} />
                    <TextInput
                        style={styles.searchInput}
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
                <TouchableOpacity
                    style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, padding: 12, borderRadius: 16, marginLeft: 8 }}
                    onPress={() => setShowConfigModal(true)}
                >
                    <Ionicons name="options-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <Text style={[styles.smartHint, { color: isListening ? colors.primary : colors.textMuted }]}>
                {isListening
                    ? '🎙️ Te escucho... Ej: "Gasté 1 litro de shampoo"'
                    : `💡 Escribe o dicta: "${categoriaNegocio === 'BELLEZA' ? '5 tintes a 10 dólares' : '5 tomates a 10 dólares'}" o "${categoriaNegocio === 'BELLEZA' ? 'usé 1 pote de cera' : 'usé 2 libras de carne'}"`}
            </Text>

            {/* FILTROS RÁPIDOS - FLEX LAYOUT */}
            <View style={styles.filterContainer}>
                <View style={styles.filterOptions}>
                    {(categoriaNegocio === 'BELLEZA'
                        ? ['todos', 'stockBajo', 'reventa', 'insumo', 'limpieza']
                        : ['todos', 'stockBajo', 'ingrediente', 'limpieza']
                    ).map(opcion => {
                        const isActive = filtro === opcion;
                        const labels: any = { 
                            todos: 'Todos', 
                            stockBajo: 'Bajo Stock', 
                            reventa: '💰 Reventa',
                            insumo: 'Insumos', 
                            ingrediente: 'Ingred.', 
                            limpieza: 'Limpieza' 
                        };
                        return (
                            <TouchableOpacity 
                                key={opcion} 
                                style={[styles.filterChip, isActive && styles.filterChipActive, { flex: 1 }]} 
                                onPress={() => setFiltro(opcion)}
                            >
                                <Text style={[styles.filterText, isActive && styles.filterTextActive]} numberOfLines={1}>
                                    {labels[opcion] || opcion}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* LISTADO DE PRODUCTOS */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}>
                {loading && !refreshing && itemsFiltrados.length === 0 ? (
                    <View style={styles.emptyContainer}><ActivityIndicator size="large" color={colors.primary} /></View>
                ) : itemsFiltrados.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cube-outline" size={48} color={colors.border} />
                        <Text style={styles.emptyText}>Inventario vacío.</Text>
                    </View>
                ) : (
                    categoriaNegocio === 'BELLEZA' ? (
                        <InventarioBellezaView 
                            items={itemsFiltrados}
                            categoriaNegocio={categoriaNegocio}
                            filtro={filtro}
                            colors={colors}
                            styles={styles}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                            onMovimiento={openMovModal}
                        />
                    ) : (
                        <InventarioComidaView 
                            items={itemsFiltrados}
                            categoriaNegocio={categoriaNegocio}
                            colors={colors}
                            styles={styles}
                            onEdit={openEditModal}
                            onDelete={handleDelete}
                            onMovimiento={openMovModal}
                        />
                    )
                )}
            </ScrollView>

            {/* FAB Y MENÚ DE ACCIONES */}
            {isFabOpen && (
                <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 }}>
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setIsFabOpen(false)} />
                </Animated.View>
            )}

            <View style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 11, alignItems: 'flex-end' }}>
                {isFabOpen && (
                    <Animated.View entering={FadeInDown.springify().damping(15)} exiting={FadeOutDown.duration(200)} style={{ gap: 12, alignItems: 'flex-end', marginBottom: 12 }}>
                        {[
                            { label: 'Crear Manualmente', color: colors.primary, icon: 'pencil', action: () => { resetForm(); setShowModal(true); } },
                            { label: 'Foto de Factura', color: '#4f46e5', icon: 'camera', action: tomarFotoFactura },
                            { label: 'Factura de Galería', color: '#6366f1', icon: 'images', action: seleccionarImagenGaleria },
                            // { label: 'Escanear Código', color: colors.surface, icon: 'barcode-outline', action: openScanner, dark: true },
                            { label: 'Subir CSV / Excel', color: colors.surface, icon: 'cloud-download-outline', action: pickDocument, dark: true },
                        ].map((m, i) => (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <Text style={styles.fabMenuLabel}>{m.label}</Text>
                                <TouchableOpacity style={[styles.fab, { width: 48, height: 48, borderRadius: 24, backgroundColor: m.color, borderWidth: m.dark ? 1 : 0, borderColor: colors.border }]} onPress={() => { setIsFabOpen(false); m.action(); }}>
                                    <Ionicons name={m.icon as any} size={20} color={m.dark ? colors.textPrimary : colors.white} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </Animated.View>
                )}

                <TouchableOpacity activeOpacity={0.8} onPress={() => setIsFabOpen(!isFabOpen)}>
                    <Animated.View style={[styles.fab, { backgroundColor: isFabOpen ? '#ef4444' : colors.primary }, animatedFabStyle]}>
                        <Ionicons name="add" size={32} color={colors.white} />
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {/* MODALES DE FORMULARIO, MOVIMIENTO, SCANNER E INVOICE */}
            <InventarioFormModal
                visible={showModal} onClose={() => setShowModal(false)}
                editItem={editItem} searchingGlobal={searchingGlobal} loading={loading}
                categoriaNegocio={categoriaNegocio} colors={colors} styles={styles}
                nombre={nombre} setNombre={setNombre} descripcion={descripcion} setDescripcion={setDescripcion}
                cantidad={cantidad} setCantidad={setCantidad} unidad={unidad} setUnidad={setUnidad}
                cantidadMinima={cantidadMinima} setCantidadMinima={setCantidadMinima}
                costoUnitario={costoUnitario} setCostoUnitario={setCostoUnitario}
                precioVenta={precioVenta} setPrecioVenta={setPrecioVenta}
                suggestedPrice={suggestedPrice}
                categoria={categoria} setCategoria={setCategoria}
                codigoBarras={codigoBarras} setCodigoBarras={setCodigoBarras}
                fechaVencimiento={fechaVencimiento} setFechaVencimiento={setFechaVencimiento}
                comisionEspecialista={comisionEspecialista} setComisionEspecialista={setComisionEspecialista}
                onSubmit={handleSubmit}
                error={error}
            />

            <InventarioMovimientoModal
                visible={showMovModal} onClose={() => setShowMovModal(false)}
                movTipo={movTipo} selectedItem={selectedItem}
                movCosto={movCosto} setMovCosto={setMovCosto}
                movCantidad={movCantidad} setMovCantidad={setMovCantidad}
                movMotivo={movMotivo} setMovMotivo={setMovMotivo}
                onConfirm={handleMovimiento} loading={loading}
                categoriaNegocio={categoriaNegocio} colors={colors} styles={styles}
            />

            <InventarioScannerModal
                visible={showScanner} onClose={() => setShowScanner(false)}
                hasPermission={hasPermission} requestCameraPermission={requestCameraPermission}
                onScanned={handleBarCodeScanned} scanned={scanned}
                scannerZoom={scannerZoom} scannerSettings={scannerSettings}
                tapCoords={tapCoords} onTap={handleScannerTap}
                colors={colors} styles={styles}
            />

            <InventarioInvoiceReviewModal
                visible={showInvoiceReview} onClose={() => setShowInvoiceReview(false)}
                invoiceItems={invoiceItems} setInvoiceItems={setInvoiceItems}
                invoiceMetadata={invoiceMetadata} setInvoiceMetadata={setInvoiceMetadata}
                invoiceFiltro={invoiceFiltro} setInvoiceFiltro={setInvoiceFiltro}
                invoiceItemsFiltrados={invoiceItemsFiltrados} invoiceStatusCounts={invoiceStatusCounts}
                getInvoiceItemStatus={getInvoiceItemStatus} onConfirm={handleConfirmInvoiceItems}
                loading={loading} colors={colors} styles={styles}
            />

            {/* OVERLAY DE ANÁLISIS IA */}
            {isAnalyzing && (
                <View style={styles.iaOverlay}>
                    <BlurView intensity={40} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
                    <Animated.View entering={FadeIn} style={styles.iaCard}>
                        <Image
                            source={require('../../assets/caitlyn_avatar.png')}
                            style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10 }}
                        />
                        <Text style={styles.iaTitle}>Caitlyn está analizando...</Text>
                        <Text style={styles.iaSubtitle}>Extrayendo productos de tu factura</Text>
                    </Animated.View>
                </View>
            )}

            <InventarioConfigModal 
                visible={showConfigModal}
                onClose={() => setShowConfigModal(false)}
                value={configInput}
                setValue={setConfigInput}
                saving={savingConfig}
                onSave={handleSaveConfig}
                categoriaNegocio={categoriaNegocio as any}
                colors={colors}
                styles={styles}
            />
        </View>
    );
}
