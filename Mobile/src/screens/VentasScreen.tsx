import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVentas, Producto } from '../hooks/useVentas';
import { lightTheme, darkTheme } from '../theme';
import { styles } from '../styles/VentasScreen.styles';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';
import { useAuth, Negocio } from '../context/AuthContext';
import BellezaVentasScreen from './BellezaVentasScreen';

// Componentes modulares
import { VentasProductCard } from './Ventas/components/VentasProductCard';
import { VentasCartModal } from './Ventas/components/VentasCartModal';
import { VentasOrderSelector } from './Ventas/components/VentasOrderSelector';
import { VentasHistorialModal } from './Ventas/components/VentasHistorialModal';

export default function VentasScreen() {
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
        montoRecibido, setMontoRecibido, cambio
    } = useVentas();

    const { user } = useAuth();
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    const negocioActual = typeof user?.negocioActivo === 'object'
        ? user.negocioActivo as Negocio
        : (user?.negocioIds?.find(n => (typeof n === 'object' ? n._id : n) === user?.negocioActivo) as Negocio);

    // Si es un negocio de belleza, derivamos a su pantalla especializada
    if (negocioActual?.categoria === 'BELLEZA') {
        return <BellezaVentasScreen />;
    }

    const categorias = ['comida', 'bebida', 'postre'];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <KitchyToolbar
                title="Ventas"
                notifications={ventas}
                onNotificationPress={abrirHistorial}
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

            <VentasOrderSelector
                ordenes={ordenes}
                activeOrderId={activeOrderId}
                seleccionarOrden={seleccionarOrden}
                eliminarOrden={pedirConfirmacionEliminar}
                nuevaOrden={nuevaOrden}
                colors={colors}
                styles={styles}
            />

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
                procesarVenta={procesarVenta}
                loading={loading}
            />

            <VentasHistorialModal 
                visible={showHistorial}
                onClose={() => setShowHistorial(false)}
                ventas={ventas}
                colors={colors}
            />

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
                                🔔 Tranquilo, el historial de ventas siempre estará disponible en el panel de notificaciones.
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
        </View>
    );
}
