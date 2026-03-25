import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { createStyles } from '../styles/PresupuestarioScreen.styles';

import { useShoppingList } from '../hooks/useShoppingList';

export interface ShoppingItem {
    id: string;
    nombre: string;
    cantidad: number;
    unidad: string;
    precioEstimado: number;
    precioReal?: number;
    confirmado: boolean;
}

export default function PresupuestarioScreen() {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const styles = useMemo(() => createStyles(colors), [colors]);
    const navigation = useNavigation();

    const { 
        items, isListening, isAnalyzing, startListening, 
        handleTextParse, handlePhotoInput, toggleConfirm, removeItem 
    } = useShoppingList();

    const [budget, setBudget] = useState('100');
    const [inputText, setInputText] = useState('');

    const totalEstimado = useMemo(() => items.reduce((acc, item) => acc + (item.precioEstimado * item.cantidad), 0), [items]);
    const presupuestoRestante = parseFloat(budget || '0') - totalEstimado;

    const handleAddText = () => {
        if (!inputText.trim()) return;
        handleTextParse(inputText);
        setInputText('');
    };

    return (
        <View style={styles.container}>
            <KitchyToolbar 
                title="Presupuestario" 
                onBack={() => navigation.goBack()} 
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* CARD DE PRESUPUESTO */}
                <Animated.View entering={FadeInDown.delay(100)} style={[styles.budgetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.budgetHeader}>
                        <View>
                            <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>Mi Presupuesto</Text>
                            <View style={styles.budgetInputRow}>
                                <Text style={[styles.currency, { color: colors.primary }]}>$</Text>
                                <TextInput
                                    style={[styles.budgetInput, { color: colors.textPrimary }]}
                                    value={budget}
                                    onChangeText={setBudget}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                        <View style={styles.progressCircle}>
                            <Ionicons name={presupuestoRestante < 0 ? "alert-circle" : "sparkles"} size={40} color={presupuestoRestante < 0 ? "#ef4444" : colors.primary} />
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Estimado</Text>
                            <Text style={[styles.statValue, { color: colors.textPrimary }]}>${totalEstimado.toFixed(2)}</Text>
                        </View>
                        <View style={styles.statSeparator} />
                        <View style={styles.stat}>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Restante</Text>
                            <Text style={[styles.statValue, { color: presupuestoRestante < 0 ? '#ef4444' : '#10b981' }]}>
                                ${presupuestoRestante.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                {/* BARRA DE ENTRADA INTELIGENTE */}
                <View style={styles.inputWrapper}>
                    <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <TextInput
                            style={[styles.textInput, { color: colors.textPrimary }]}
                            placeholder='Ej: "2 leches, 1 pan..."'
                            placeholderTextColor={colors.textMuted}
                            value={inputText}
                            onChangeText={setInputText}
                            onSubmitEditing={handleAddText}
                        />
                        <TouchableOpacity onPress={startListening} style={styles.micButton}>
                            <Ionicons name={isListening ? "mic" : "mic-outline"} size={24} color={isListening ? "#ef4444" : colors.primary} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={handlePhotoInput} style={[styles.photoButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="camera-outline" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* LISTA DE ITEMS */}
                <View style={styles.listHeader}>
                    <Text style={[styles.listTitle, { color: colors.textPrimary }]}>Lista de Compras</Text>
                    {isAnalyzing && <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 10 }} />}
                    <View style={{ flex: 1 }} />
                    <Text style={[styles.listCount, { color: colors.textMuted }]}>{items.length} productos</Text>
                </View>

                {items.length === 0 && !isAnalyzing ? (
                    <Animated.View entering={FadeInUp} style={styles.emptyState}>
                        <Ionicons name="clipboard-outline" size={60} color={colors.border} />
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                            Tu lista está vacía. Dicta o escribe lo que necesitas.
                        </Text>
                    </Animated.View>
                ) : (
                    items.map((item, index) => (
                        <Animated.View 
                            key={item.id} 
                            entering={FadeInDown.delay(100)} 
                            layout={Layout.springify()}
                            style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                        >
                            <TouchableOpacity 
                                style={[styles.checkbox, { borderColor: item.confirmado ? colors.primary : colors.border, backgroundColor: item.confirmado ? colors.primary : 'transparent' }]}
                                onPress={() => toggleConfirm(item.id)}
                            >
                                {item.confirmado && <Ionicons name="checkmark" size={16} color="#fff" />}
                            </TouchableOpacity>
                            
                            <View style={styles.itemInfo}>
                                <Text style={[styles.itemName, { color: colors.textPrimary, textDecorationLine: item.confirmado ? 'line-through' : 'none' }]}>
                                    {item.nombre}
                                </Text>
                                <Text style={[styles.itemDetail, { color: colors.textMuted }]}>
                                    {item.cantidad} {item.unidad}
                                </Text>
                            </View>

                            <View style={styles.itemPrice}>
                                <Text style={[styles.priceValue, { color: colors.textPrimary }]}>
                                    ${(item.precioEstimado * item.cantidad).toFixed(2)}
                                </Text>
                                <Text style={[styles.priceLabel, { color: colors.textMuted }]}>est.</Text>
                            </View>

                            <TouchableOpacity onPress={() => removeItem(item.id)} style={{ marginLeft: 12 }}>
                                <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        </Animated.View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
