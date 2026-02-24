import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn, SlideInDown } from 'react-native-reanimated';
import { useVentas, Producto } from '../hooks/useVentas';
import { colors } from '../theme';
import { styles } from '../styles/VentasScreen.styles';
import { KitchyToolbar } from '../components/KitchyToolbar';

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

    const categorias = ['comida', 'bebida', 'postre'];

    const renderItem = (producto: Producto, index: number) => (
        <Animated.View
            entering={FadeInDown.delay(index * 50)}
            key={producto._id}
        >
            <TouchableOpacity
                style={styles.productCard}
                onPress={() => agregarAlCarrito(producto)}
                activeOpacity={0.7}
            >
                <View style={styles.imagePlaceholder}>
                    <Text style={styles.imageEmoji}>
                        {producto.categoria === 'comida' ? '🍔' :
                            producto.categoria === 'bebida' ? '🥤' :
                                producto.categoria === 'postre' ? '🍰' : '📦'}
                    </Text>
                </View>
                <Text style={styles.productName} numberOfLines={2}>{producto.nombre}</Text>
                <Text style={styles.productPrice}>${producto.precio.toFixed(2)}</Text>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <KitchyToolbar
                title="Ventas"
                extraButtons={
                    <TouchableOpacity
                        style={styles.cartButton}
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
                <View style={styles.searchInputWrapper}>
                    <Ionicons name="search-outline" size={20} color={colors.textMuted} />
                    <TextInput
                        style={styles.searchInput}
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
                        style={[styles.categoryChip, !categoriaFiltro && styles.categoryChipActive]}
                        onPress={() => setCategoriaFiltro('')}
                    >
                        <Text style={[styles.categoryText, !categoriaFiltro && styles.categoryTextActive]}>Todos</Text>
                    </TouchableOpacity>
                    {categorias.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.categoryChip, categoriaFiltro === cat && styles.categoryChipActive]}
                            onPress={() => setCategoriaFiltro(cat)}
                        >
                            <Text style={[styles.categoryText, categoriaFiltro === cat && styles.categoryTextActive]}>{cat}</Text>
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
                        <Text style={styles.emptyText}>No hay productos que coincidan</Text>
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
                        style={styles.modalContent}
                    >
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Tu Pedido</Text>
                                <Text style={styles.modalSubtitle}>{carrito.length} Items seleccionados</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Ionicons name="close-circle" size={32} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={styles.carritoList}>
                            {carrito.length === 0 ? (
                                <View style={[styles.emptyContainer, { paddingTop: 100 }]}>
                                    <Ionicons name="cart-outline" size={64} color={colors.border} />
                                    <Text style={styles.emptyText}>El carrito está vacío</Text>
                                </View>
                            ) : (
                                carrito.map(item => (
                                    <View key={item.producto._id} style={styles.cartItem}>
                                        <View style={styles.cartItemImage}>
                                            <Text style={{ fontSize: 20 }}>🍔</Text>
                                        </View>
                                        <View style={styles.cartItemInfo}>
                                            <Text style={styles.cartItemName} numberOfLines={1}>{item.producto.nombre}</Text>
                                            <Text style={styles.cartItemPrice}>${item.producto.precio.toFixed(2)}</Text>
                                        </View>
                                        <View style={styles.quantityControls}>
                                            <TouchableOpacity
                                                style={styles.qtyBtn}
                                                onPress={() => quitarDelCarrito(item.producto._id)}
                                            >
                                                <Ionicons name="remove" size={18} color={colors.textSecondary} />
                                            </TouchableOpacity>
                                            <Text style={styles.qtyText}>{item.cantidad}</Text>
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
                            <View style={styles.checkoutFooter}>
                                <View style={styles.formRow}>
                                    <TextInput
                                        style={styles.inputSmall}
                                        placeholder="Cliente (Opcional)"
                                        value={cliente}
                                        onChangeText={setCliente}
                                    />
                                    <View style={styles.selectSmall}>
                                        <Text style={styles.selectText}>
                                            {metodoPago === 'efectivo' ? '💵 Efectivo' : '💸 Yappy'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Total a pagar</Text>
                                    <Text style={styles.totalValue}>${calcularTotal().toFixed(2)}</Text>
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
