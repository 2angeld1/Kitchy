import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn, SlideInDown } from 'react-native-reanimated';
import { useVentas, Producto } from '../hooks/useVentas';
import { lightTheme, darkTheme } from '../theme';
import { styles } from '../styles/VentasScreen.styles';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';

export default function VentasScreen() {
    const {
        productosFiltrados,
        carrito,
        loading,
        refreshing,
        onRefresh,
        showModal,
        setShowModal,
        busqueda,
        setBusqueda,
        categoriaFiltro,
        setCategoriaFiltro,
        agregarAlCarrito,
        quitarDelCarrito,
        calcularTotal,
        procesarVenta,
        cliente,
        setCliente,
        metodoPago,
    } = useVentas();

    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    const categorias = ['comida', 'bebida', 'postre'];

    const renderItem = (producto: Producto, index: number) => (
        <Animated.View
            entering={FadeInDown.delay(index * 50)}
            key={producto._id}
        >
            <TouchableOpacity
                style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => agregarAlCarrito(producto)}
                activeOpacity={0.7}
            >
                <View style={[styles.imagePlaceholder, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons
                        name={producto.categoria === 'comida' ? 'fast-food' : producto.categoria === 'bebida' ? 'water' : producto.categoria === 'postre' ? 'ice-cream' : 'cube'}
                        size={48}
                        color={colors.textMuted}
                        style={{ opacity: 0.5 }}
                    />
                </View>
                <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>{producto.nombre}</Text>
                <Text style={[styles.productPrice, { color: colors.primary }]}>${producto.precio.toFixed(2)}</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <KitchyToolbar
                title="Ventas"
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

            {/* Buscador */}
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

            {/* Categorías */}
            <View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                >
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
                                { backgroundColor: colors.card, borderColor: colors.border },
                                categoriaFiltro === cat && { backgroundColor: colors.primary, borderColor: colors.primary }
                            ]}
                            onPress={() => setCategoriaFiltro(cat)}
                        >
                            <Text style={[styles.categoryText, { color: colors.textSecondary }, categoriaFiltro === cat && { color: colors.white }]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Listado de Productos */}
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
                        {productosFiltrados.map((p, i) => renderItem(p, i))}
                    </View>
                )}
            </ScrollView>

            {/* Modal de Carrito */}
            <Modal
                visible={showModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowModal(false)}
            >
                <Animated.View
                    entering={FadeIn.duration(300)}
                    style={styles.modalOverlay}
                >
                    <Animated.View
                        entering={SlideInDown.springify().damping(15)}
                        style={[styles.modalContent, { backgroundColor: colors.card }]}
                    >
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Tu Pedido</Text>
                                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>{carrito.length} Items seleccionados</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Ionicons name="close-circle" size={32} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={styles.carritoList}>
                            {carrito.length === 0 ? (
                                <View style={[styles.emptyContainer, { paddingTop: 100 }]}>
                                    <Ionicons name="cart-outline" size={64} color={colors.border} />
                                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>El carrito está vacío</Text>
                                </View>
                            ) : (
                                carrito.map(item => (
                                    <View key={item.producto._id} style={[styles.cartItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                        <View style={[styles.cartItemImage, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
                                            <Ionicons
                                                name={item.producto.categoria === 'comida' ? 'fast-food' : item.producto.categoria === 'bebida' ? 'water' : item.producto.categoria === 'postre' ? 'ice-cream' : 'cube'}
                                                size={20}
                                                color={colors.primary}
                                            />
                                        </View>
                                        <View style={styles.cartItemInfo}>
                                            <Text style={[styles.cartItemName, { color: colors.textPrimary }]} numberOfLines={1}>{item.producto.nombre}</Text>
                                            <Text style={[styles.cartItemPrice, { color: colors.primary }]}>${item.producto.precio.toFixed(2)}</Text>
                                        </View>
                                        <View style={[styles.quantityControls, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                            <TouchableOpacity
                                                style={styles.qtyBtn}
                                                onPress={() => quitarDelCarrito(item.producto._id)}
                                            >
                                                <Ionicons name="remove" size={18} color={colors.textSecondary} />
                                            </TouchableOpacity>
                                            <Text style={[styles.qtyText, { color: colors.textPrimary }]}>{item.cantidad}</Text>
                                            <TouchableOpacity
                                                style={styles.qtyBtn}
                                                onPress={() => agregarAlCarrito(item.producto)}
                                            >
                                                <Ionicons name="add" size={18} color={colors.primary} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            )}
                        </ScrollView>

                        {carrito.length > 0 && (
                            <View style={[styles.checkoutFooter, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                                <View style={styles.formRow}>
                                    <TextInput
                                        style={[styles.inputSmall, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
                                        placeholder="Cliente (Opcional)"
                                        placeholderTextColor={colors.textMuted}
                                        value={cliente}
                                        onChangeText={setCliente}
                                    />
                                    <View style={[styles.selectSmall, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                        <Text style={[styles.selectText, { color: colors.textPrimary }]}>
                                            {metodoPago === 'efectivo' ? '💵 Efectivo' : '💸 Yappy'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.totalRow}>
                                    <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Total a pagar</Text>
                                    <Text style={[styles.totalValue, { color: colors.textPrimary }]}>${calcularTotal().toFixed(2)}</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.confirmBtn}
                                    onPress={procesarVenta}
                                    disabled={loading}
                                >
                                    <Ionicons name="checkmark-circle" size={24} color={colors.white} />
                                    <Text style={styles.confirmBtnText}>
                                        {loading ? 'Procesando...' : 'Confirmar Pedido'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>
                </Animated.View>
            </Modal>
        </View>
    );
}
