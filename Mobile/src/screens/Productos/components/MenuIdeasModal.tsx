import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

interface MenuIdeasModalProps {
    visible: boolean;
    onClose: () => void;
    generateMenuIdeas: () => void;
    menuIdeas: any[];
    menuSource?: string | null;
    loading: boolean;
    error: string | null;
    colors: any;
    onUseIdea: (idea: any) => void;
}

export function MenuIdeasModal({ 
    visible, onClose, generateMenuIdeas, menuIdeas, menuSource, loading, error, colors, onUseIdea 
}: MenuIdeasModalProps) {
    const hasRequestedRef = useRef(false);

    useEffect(() => {
        if (visible) {
            if (menuIdeas.length === 0 && !loading && !error && !hasRequestedRef.current) {
                hasRequestedRef.current = true;
                generateMenuIdeas();
            }
        } else {
            // Reset flag when modal closes
            hasRequestedRef.current = false;
        }
    }, [visible, menuIdeas.length, loading, error]);

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
                <View style={{
                    backgroundColor: colors.background,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    height: '85%',
                    paddingHorizontal: 20,
                    paddingTop: 8,
                    paddingBottom: 40
                }}>
                    <View style={{ width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ marginRight: 12, overflow: 'hidden' }}>
                                <Image 
                                    source={require('../../../../assets/caitlyn_avatar.png')} 
                                    style={{ width: 44, height: 44, borderRadius: 22 }} 
                                />
                            </View>
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>Ingeniería de Menú</Text>
                                    {menuSource === 'CAITLYN_MEMORY_DB' && (
                                        <View style={{ backgroundColor: 'rgba(37,99,235,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                            <Text style={{ fontSize: 10, fontWeight: '800', color: '#2563eb' }}>MEMORIA 🧠</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={{ fontSize: 13, color: colors.textSecondary }}>Creando rentabilidad con tu inventario</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                            <Ionicons name="close" size={24} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#d97706" />
                            <Text style={{ marginTop: 16, color: colors.textSecondary, fontWeight: '600', textAlign: 'center' }}>
                                Caitlyn está analizando tu nevera...{`\n`}Buscando combinaciones rentables.
                            </Text>
                        </View>
                    ) : error ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                            <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
                            <Text style={{ marginTop: 16, color: colors.textSecondary, textAlign: 'center' }}>{error}</Text>
                            <TouchableOpacity style={{ marginTop: 20, padding: 12, backgroundColor: colors.surface, borderRadius: 8 }} onPress={generateMenuIdeas}>
                                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>Reintentar</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {menuIdeas.map((idea, index) => (
                                <Animated.View key={index} entering={FadeInDown.delay(index * 150)} style={{
                                    backgroundColor: colors.surface,
                                    borderRadius: 16,
                                    padding: 16,
                                    marginBottom: 16,
                                    borderWidth: 1,
                                    borderColor: colors.border
                                }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, flex: 1 }}>{idea.nombre_plato}</Text>
                                        <View style={{ backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 10 }}>
                                            <Text style={{ color: '#059669', fontWeight: '800', fontSize: 12 }}>Vende a ${idea.precio_recomendado?.toFixed(2)}</Text>
                                        </View>
                                    </View>

                                    <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 12 }}>
                                        {idea.descripcion}
                                    </Text>

                                    <View style={{ backgroundColor: colors.background, borderRadius: 8, padding: 12, marginBottom: 16 }}>
                                        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 6, textTransform: 'uppercase' }}>Ingredientes Clave (Costo: ${idea.costo_estimado?.toFixed(2)})</Text>
                                        {idea.ingredientes_a_usar && idea.ingredientes_a_usar.map((ing: any, i: number) => (
                                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                                <Ionicons name="checkmark-circle" size={14} color="#d97706" style={{ marginRight: 6 }} />
                                                <Text style={{ fontSize: 13, color: colors.textPrimary }}>
                                                    {ing.cantidad} {ing.unidad} de {ing.nombre}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => { onClose(); onUseIdea(idea); }}
                                        style={{
                                            backgroundColor: colors.primary,
                                            paddingVertical: 12,
                                            borderRadius: 10,
                                            alignItems: 'center',
                                            flexDirection: 'row',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Ionicons name="add-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Añadir al Menú</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                            {menuIdeas.length === 0 && (
                                <View style={{ alignItems: 'center', marginTop: 40 }}>
                                    <Ionicons name="leaf-outline" size={48} color={colors.textMuted} />
                                    <Text style={{ color: colors.textSecondary, marginTop: 12 }}>No encontramos ingredientes suficientes en tu inventario para sugerir nuevos platos.</Text>
                                </View>
                            )}
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
}
