import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Modal, TouchableOpacity, Image, Linking, Animated as RNAnimated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { getProductos, getMenuConfig } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';
import { styles } from '../styles/MenuAppScreen.styles';
import { KitchyToolbar } from '../components/KitchyToolbar';

interface Producto {
    _id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string;
    disponible: boolean;
    imagen?: string;
}

interface MenuConfigData {
    nombreRestaurante: string;
    subtitulo: string;
    tema: string;
    colorPrimario: string;
    colorSecundario: string;
    imagenHero?: string;
    telefono: string;
}

export default function MenuAppScreen() {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const navigation = useNavigation();

    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeCategory, setActiveCategory] = useState('todos');
    const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
    const [config, setConfig] = useState<MenuConfigData>({
        nombreRestaurante: 'Food Menu',
        subtitulo: 'Restaurant & Bar',
        tema: 'paper',
        colorPrimario: '#c92c2c',
        colorSecundario: '#d4af37',
        telefono: '+000-000-0000'
    });

    const initMenu = async (isRef = false) => {
        if (isRef) setRefreshing(true);
        else setLoading(true);

        try {
            const [productosRes, configRes] = await Promise.all([
                getProductos({ disponible: true }),
                getMenuConfig()
            ]);
            setProductos(productosRes.data.filter((p: Producto) => p.disponible));
            if (configRes.data && configRes.data.nombreRestaurante) {
                setConfig(configRes.data);
            }
        } catch (error) {
            console.error('Error cargando menú público:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        initMenu();
    }, []);

    const filteredProducts = activeCategory === 'todos'
        ? productos
        : productos.filter(p => p.categoria === activeCategory);

    const categorias = ['todos', 'comida', 'bebida', 'postre'];

    const handleCall = () => {
        if (config.telefono) {
            Linking.openURL(`tel:${config.telefono}`);
        }
    };

    const paperBg = isDark ? '#1e1e1e' : '#fcfcfc'; // Theme adaptation for paper
    const textColor = isDark ? '#e0e0e0' : '#111827';
    const accentColor = config.colorPrimario || '#c92c2c';

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <KitchyToolbar title="Menú Público" onBack={() => navigation.goBack()} />

            <View style={[styles.paperSheet, { backgroundColor: paperBg, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 16 }]}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => initMenu(true)} tintColor={accentColor} />}
                >
                    {/* Header */}
                    <View style={styles.menuHeader}>
                        <Text style={[styles.brandTitle, { color: textColor }]}>{config.nombreRestaurante}</Text>
                        <Text style={[styles.brandSubtitle, { color: activeCategory ? accentColor : textColor, opacity: 0.8 }]}>{config.subtitulo}</Text>

                        <View style={styles.mainDishCircle}>
                            <Image
                                source={{ uri: config.imagenHero || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80" }}
                                style={[styles.heroImage, { borderWidth: 4, borderColor: paperBg }]}
                            />
                        </View>
                    </View>

                    {/* Tabs */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollTabs}>
                        {categorias.map(cat => {
                            const isActive = activeCategory === cat;
                            return (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.tabItem,
                                        {
                                            borderColor: isActive ? accentColor : colors.border,
                                            backgroundColor: isActive ? accentColor : 'transparent'
                                        }
                                    ]}
                                    onPress={() => setActiveCategory(cat)}
                                >
                                    <Text style={[styles.tabText, { color: isActive ? '#fff' : textColor, opacity: isActive ? 1 : 0.6 }]}>
                                        {cat === 'todos' ? 'Todos' : cat}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* List */}
                    <View style={styles.menuList}>
                        {filteredProducts.map((item, index) => (
                            <Animated.View entering={FadeInDown.delay(index * 100)} key={item._id}>
                                <TouchableOpacity
                                    style={[styles.menuItemCard, { borderBottomColor: colors.border }]}
                                    onPress={() => setSelectedProduct(item)}
                                >
                                    <View style={styles.itemInfo}>
                                        <View style={styles.itemHeader}>
                                            <Text style={[styles.itemName, { color: textColor }]} numberOfLines={1}>{item.nombre}</Text>
                                            <Text style={[styles.itemPrice, { color: accentColor }]}>${item.precio.toFixed(2)}</Text>
                                        </View>
                                        <Text style={[styles.itemDesc, { color: textColor }]} numberOfLines={2}>{item.descripcion}</Text>
                                    </View>

                                    {item.imagen ? (
                                        <Image source={{ uri: item.imagen }} style={styles.itemImage} />
                                    ) : (
                                        <View style={[styles.itemImage, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
                                            <Ionicons name="fast-food-outline" size={32} color={colors.textMuted} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        ))}

                        {!loading && filteredProducts.length === 0 && (
                            <View style={styles.emptyState}>
                                <Text style={[styles.emptyText, { color: textColor }]}>No hay platos en esta sección hoy.</Text>
                            </View>
                        )}
                    </View>

                    {/* Footer */}
                    <View style={[styles.footerContact, { borderTopColor: colors.border }]}>
                        <Text style={[styles.footerLabel, { color: textColor, opacity: 0.6 }]}>Llama para ordenar</Text>
                        <TouchableOpacity onPress={handleCall}>
                            <Text style={[styles.footerPhone, { color: textColor }]}>{config.telefono}</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </View>

            {/* Product Detail Modal */}
            <Modal visible={!!selectedProduct} animationType="slide" transparent={true} onRequestClose={() => setSelectedProduct(null)}>
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <Animated.View entering={SlideInDown} style={[styles.modalContent, { backgroundColor: paperBg }]}>
                        {selectedProduct && (
                            <>
                                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedProduct(null)}>
                                    <Ionicons name="close" size={24} color="#111827" />
                                </TouchableOpacity>

                                {selectedProduct.imagen ? (
                                    <Image source={{ uri: selectedProduct.imagen }} style={styles.modalImage} />
                                ) : (
                                    <View style={[styles.modalImage, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
                                        <Ionicons name="restaurant" size={64} color={colors.border} />
                                    </View>
                                )}

                                <ScrollView style={styles.modalBody}>
                                    <Text style={[styles.modalName, { color: textColor }]}>{selectedProduct.nombre}</Text>
                                    <Text style={[styles.modalPrice, { color: accentColor }]}>${selectedProduct.precio.toFixed(2)}</Text>

                                    <Text style={[styles.modalDesc, { color: textColor }]}>{selectedProduct.descripcion}</Text>

                                    <View style={{ marginTop: 20 }}>
                                        <TouchableOpacity
                                            style={[styles.addToCartBtn, { borderColor: textColor, backgroundColor: 'transparent' }]}
                                            onPress={() => setSelectedProduct(null)}
                                        >
                                            <Text style={[styles.addToCartText, { color: textColor }]}>¡LO QUIERO!</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ height: 60 }} />
                                </ScrollView>
                            </>
                        )}
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}
