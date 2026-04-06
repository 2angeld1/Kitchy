import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, RefreshControl, Modal, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { useVentas, Producto } from '../hooks/useVentas';
import { lightTheme, darkTheme } from '../theme';
import { createStyles } from '../styles/VentasScreen.styles';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';
import { useAppDimensions } from '../context/DimensionsContext';
import { useAuth, Negocio } from '../context/AuthContext';
import BellezaVentasScreen from './BellezaVentasScreen';

// Componentes modulares
import { VentasProductCard } from './Ventas/components/VentasProductCard';
import { VentasCartModal } from './Ventas/components/VentasCartModal';
import { VentasOrderSelector } from './Ventas/components/VentasOrderSelector';
import { VentasHistorialModal } from './Ventas/components/VentasHistorialModal';
import { VentasNotebookModal } from './Ventas/components/VentasNotebookModal'; // Nuevo import

export default function VentasScreen() {
    const { width, height } = useAppDimensions();
    const isTablet = width > 800; // Umbral para mostrar sidebar
    const isLandscape = width > height;

    const {
        productosFiltrados, carrito, loading, refreshing, onRefresh,
        showModal, setShowModal, busqueda, setBusqueda,
        categoriaFiltro, setCategoriaFiltro, agregarAlCarrito,
        quitarDelCarrito, calcularTotal, procesarVenta,
        cliente, setCliente, metodoPago, setMetodoPago,
        ordenes, activeOrderId, activeOrder, nuevaOrden,
        seleccionarOrden, pedirConfirmacionEliminar,
        confirmarEliminarOrden, cancelarEliminarOrden, ordenAEliminar,
        showHistorial, setShowHistorial, ventas, abrirHistorial,
        montoRecibido, setMontoRecibido, cambio,
        isAnalyzingNotebook, notebookVentas, showNotebookModal, setShowNotebookModal,
        tomarFotoCuaderno, seleccionarImagenCuaderno, importarVentaNotebook
    } = useVentas();

    const [showSuccess, setShowSuccess] = useState(false);
    const [showScanSourceModal, setShowScanSourceModal] = useState(false);

    const handleABrirMenuEscaneo = () => {
        setShowScanSourceModal(true);
    };
    const { user } = useAuth();
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const styles = useMemo(() => createStyles(colors, width, height), [colors, width, height]);

    const negocioActual = typeof user?.negocioActivo === 'object'
        ? user.negocioActivo as Negocio
        : (user?.negocioIds?.find(n => (typeof n === 'object' ? n._id : n) === user?.negocioActivo) as Negocio);

    // Si es un negocio de belleza, derivamos a su pantalla especializada
    if (negocioActual?.categoria === 'BELLEZA') {
        return <BellezaVentasScreen />;
    }

    const categorias = ['comida', 'bebida', 'postre'];

    const handleProcesarVenta = async () => {
        await procesarVenta();
        // El hook cierra el modal y limpia el carrito. 
        // Aquí disparamos la animación de éxito.
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const renderSidebar = () => {
        const ordenesActivas = ordenes.filter(o => !o.completada);
        return (
            <View style={styles.sidebar}>
                <View style={styles.sidebarHeader}>
                    <Text style={styles.sidebarTitle}>Pedidos</Text>
                    <TouchableOpacity onPress={() => nuevaOrden()} style={styles.addBtn}>
                        <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {ordenesActivas.map(o => {
                        const isActive = o.id === activeOrderId;
                        const subtotal = o.items.reduce((sum: number, item: any) => sum + (Number(item.producto.precio) * item.cantidad), 0);
                        return (
                            <TouchableOpacity
                                key={o.id}
                                onPress={() => seleccionarOrden(o.id)}
                                style={[
                                    styles.orderItem,
                                    { backgroundColor: isActive ? colors.primary + '15' : 'transparent', borderColor: isActive ? colors.primary : 'transparent' }
                                ]}
                            >
                                <View style={[styles.orderIcon, { backgroundColor: isActive ? colors.primary : colors.surface }]}>
                                    <Ionicons name="receipt-outline" size={16} color={isActive ? '#fff' : colors.textMuted} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.orderName} numberOfLines={1}>{o.nombre}</Text>
                                    <Text style={styles.orderMeta}>
                                        {o.items.length} items · ${subtotal.toFixed(2)}
                                    </Text>
                                </View>
                                {isActive && <View style={styles.activeDot} />}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
                <View style={styles.sidebarFooter}>
                    <TouchableOpacity 
                        onPress={handleABrirMenuEscaneo}
                        style={[styles.historyBtn, styles.scanBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
                    >
                        <Ionicons name="camera-outline" size={18} color={colors.primary} />
                        <Text style={[styles.historyText, { color: colors.primary }]}>Escanear Cuaderno</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={abrirHistorial}
                        style={styles.historyBtn}
                    >
                        <Ionicons name="journal-outline" size={18} color={colors.primary} />
                        <Text style={styles.historyText}>Libro de Ventas</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background, flexDirection: 'row' }]}>
            {/* Sidebar para Tablets / Landscape */}
            {isTablet && renderSidebar()}

            <View style={{ flex: 1 }}>
                <KitchyToolbar
                    title="Ventas"
                    notifications={ventas}
                    onNotificationPress={abrirHistorial}
                    notificationIcon="journal-outline" // Cambiado de campana a Libro de Ventas
                    extraButtons={
                        <TouchableOpacity
                            style={[styles.cartButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={() => setShowModal(true)}
                        >
                            <Ionicons name="cart-outline" size={22} color={colors.textPrimary} />
                            {carrito.length > 0 && (
                                <View style={styles.cartBadge}>
                                    <Text style={styles.cartBadgeText}>
                                        {carrito.reduce((sum, item) => sum + item.cantidad, 0)}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    }
                />

                {!isTablet && (
                    <VentasOrderSelector
                        ordenes={ordenes}
                        activeOrderId={activeOrderId}
                        seleccionarOrden={seleccionarOrden}
                        eliminarOrden={pedirConfirmacionEliminar}
                        nuevaOrden={nuevaOrden}
                        colors={colors}
                        styles={styles}
                        openCart={() => setShowModal(true)}
                    />
                )}

                <View style={styles.searchContainer}>
                    <View style={[styles.searchInputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="search-outline" size={20} color={colors.textMuted} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.textPrimary }]}
                            placeholder="Buscar producto..."
                            placeholderTextColor={colors.textMuted}
                            value={busqueda}
                            onChangeText={setBusqueda}
                        />
                    </View>
                </View>

                <View style={styles.categoriesContainer}>
                    <TouchableOpacity
                        style={[
                            styles.categoryChip,
                            { backgroundColor: colors.card, borderColor: colors.border },
                            !categoriaFiltro && { backgroundColor: colors.primary, borderColor: colors.primary }
                        ]}
                        onPress={() => setCategoriaFiltro('')}
                    >
                        <Text style={[styles.categoryText, { color: colors.textSecondary }, !categoriaFiltro && { color: colors.white }]}>Todos</Text>
                    </TouchableOpacity>
                    {categorias.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.categoryChip,
                                { backgroundColor: colors.card, borderColor: colors.border, flex: 1 },
                                categoriaFiltro === cat && { backgroundColor: colors.primary, borderColor: colors.primary }
                            ]}
                            onPress={() => setCategoriaFiltro(cat)}
                        >
                            <Text style={[styles.categoryText, { color: colors.textSecondary }, categoriaFiltro === cat && { color: colors.white }]}>
                                {cat === 'comida' ? 'Platos' : cat === 'bebida' ? 'Bebidas' : 'Postres'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <ScrollView
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                >
                    {productosFiltrados.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={48} color={colors.border} />
                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No hay productos que coincidan</Text>
                        </View>
                    ) : (
                        <View style={styles.productsGrid}>
                            {productosFiltrados.map((p: Producto, i: number) => {
                                const qty = carrito.find(item => item.producto._id === p._id)?.cantidad || 0;
                                return (
                                    <VentasProductCard
                                        key={p._id}
                                        producto={p}
                                        index={i}
                                        cantidadEnCarrito={qty}
                                        onPress={agregarAlCarrito}
                                        colors={colors}
                                        styles={styles}
                                    />
                                );
                            })}
                        </View>
                    )}
                </ScrollView>
            </View>

            <VentasCartModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                activeOrder={activeOrder}
                carrito={carrito}
                colors={colors}
                styles={styles}
                agregarAlCarrito={agregarAlCarrito}
                quitarDelCarrito={quitarDelCarrito}
                calcularTotal={calcularTotal}
                cliente={cliente}
                setCliente={setCliente}
                metodoPago={metodoPago}
                setMetodoPago={setMetodoPago}
                montoRecibido={montoRecibido}
                setMontoRecibido={setMontoRecibido}
                cambio={cambio}
                procesarVenta={handleProcesarVenta}
                loading={loading}
            />

            <VentasHistorialModal 
                visible={showHistorial}
                onClose={() => setShowHistorial(false)}
                ventas={ventas}
                colors={colors}
            />

            <VentasNotebookModal
                visible={showNotebookModal}
                onClose={() => setShowNotebookModal(false)}
                ventas={notebookVentas}
                onConfirm={(venta) => {
                    importarVentaNotebook(venta);
                    setShowNotebookModal(false);
                }}
                isAnalyzing={isAnalyzingNotebook}
                colors={colors}
            />

            {/* FAB para Móvil: Escanear Cuaderno */}
            {!isTablet && (
                <TouchableOpacity 
                    onPress={handleABrirMenuEscaneo}
                    style={styles.fab}
                >
                    <Ionicons name="camera" size={24} color="#fff" />
                </TouchableOpacity>
            )}

            {/* Animación de Éxito */}
            {showSuccess && (
                <Animated.View 
                    entering={FadeIn} 
                    exiting={FadeIn}
                    style={styles.successOverlay}
                >
                    <Animated.View entering={ZoomIn.duration(400)} style={styles.successCircle}>
                        <Ionicons name="checkmark" size={60} color="#fff" />
                    </Animated.View>
                    <Text style={{ marginTop: 20, fontSize: 24, fontWeight: '900', color: '#fff' }}>¡VENDA EXITOSA!</Text>
                </Animated.View>
            )}

            {/* Modal de Confirmación para Eliminar Pedido */}
            <Modal visible={!!ordenAEliminar} transparent animationType="fade">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 24, width: '100%', maxWidth: 360 }}>
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(239,68,68,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                                <Ionicons name="trash-outline" size={28} color="#ef4444" />
                            </View>
                            <Text style={{ fontSize: 18, fontWeight: '900', color: colors.textPrimary, marginBottom: 6 }}>¿Eliminar este pedido?</Text>
                            <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center' }}>
                                "{ordenAEliminar?.nombre}" se eliminará de tu lista.
                            </Text>
                            <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 8 }}>
                                🔔 El historial siempre estará en tu Libro de Ventas.
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity
                                onPress={cancelarEliminarOrden}
                                style={{ flex: 1, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: colors.border }}
                            >
                                <Text style={{ fontWeight: '800', color: colors.textSecondary }}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={confirmarEliminarOrden}
                                style={{ flex: 1, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ef4444' }}
                            >
                                <Text style={{ fontWeight: '800', color: '#fff' }}>Sí, eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal para elegir origen del escaneo (PWA Friendly) */}
            <Modal visible={showScanSourceModal} transparent animationType="fade">
                <TouchableOpacity 
                    activeOpacity={1}
                    onPress={() => setShowScanSourceModal(false)}
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}
                >
                    <View style={{ backgroundColor: colors.card, borderRadius: 28, padding: 28, width: '100%', maxWidth: 320 }}>
                        <Text style={{ fontSize: 20, fontWeight: '900', color: colors.textPrimary, marginBottom: 8, textAlign: 'center' }}>Escanear Cuaderno</Text>
                        <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 24 }}>¿Desde dónde quieres cargar la imagen?</Text>
                        
                        <View style={{ gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => { setShowScanSourceModal(false); tomarFotoCuaderno(); }}
                                style={{ height: 60, borderRadius: 16, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12 }}
                            >
                                <Ionicons name="camera" size={24} color="#fff" />
                                <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>Usar Cámara</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => { setShowScanSourceModal(false); seleccionarImagenCuaderno(); }}
                                style={{ height: 60, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12 }}
                            >
                                <Ionicons name="images" size={24} color={colors.primary} />
                                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>Elegir de Galería</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setShowScanSourceModal(false)}
                                style={{ height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 8 }}
                            >
                                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textMuted }}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

