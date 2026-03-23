import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useCaitlyn } from '../hooks/useCaitlyn';

type CaitlynStrategyScreenRouteProp = RouteProp<RootStackParamList, 'CaitlynStrategy'>;
type CaitlynStrategyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CaitlynStrategy'>;

interface Props {
    route: CaitlynStrategyScreenRouteProp;
    navigation: CaitlynStrategyScreenNavigationProp;
}

export default function CaitlynStrategyScreen({ route, navigation }: Props) {
    const { alerta } = route.params;
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    const { getBusinessAdvice, productAdvice, productReasoning, loading, error } = useCaitlyn();

    useEffect(() => {
        // Al cargar la vista, pedimos el detalle profundo a Caitlyn
        if (alerta && alerta.nombre) {
            getBusinessAdvice(alerta.nombre, { ...alerta });
        }
    }, [alerta?.nombre]);

    const renderReasoning = () => {
        if (!productReasoning) return null;
        
        // Asumiendo que python nos devuelve viñetas o líneas separadas
        const bullets = productReasoning.split('\n').filter(line => line.trim().length > 0);

        return bullets.map((bullet, idx) => (
            <Animated.View 
                key={idx} 
                entering={FadeInDown.delay(400 + (idx * 100))}
                style={{
                    flexDirection: 'row', 
                    alignItems: 'flex-start',
                    marginBottom: 16,
                    backgroundColor: colors.surface,
                    padding: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: colors.border
                }}
            >
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, color: colors.textPrimary, lineHeight: 22, fontWeight: '500' }}>
                        {bullet}
                    </Text>
                </View>
            </Animated.View>
        ));
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <KitchyToolbar title="An\u00e1lisis de Estrategia" onBack={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                
                {/* Header Section */}
                <Animated.View entering={FadeInDown.duration(400)} style={{ marginBottom: 32, alignItems: 'center' }}>
                    <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : '#fef3c7', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                        <Ionicons name="bulb" size={32} color="#fbbf24" />
                    </View>
                    <Text style={{ fontSize: 24, fontWeight: '900', color: colors.textPrimary, textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 }}>
                        Plan para {alerta.nombre}
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', maxWidth: '80%' }}>
                        Caitlyn ha analizado el mercado y cruzado estos datos con tus costos internos.
                    </Text>
                </Animated.View>

                {/* Math Comparison Card */}
                <Animated.View entering={FadeInDown.delay(150)} style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
                    <View style={{ flex: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase', fontWeight: '800', marginBottom: 8 }}>Actual</Text>
                        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>${alerta.precioActual}</Text>
                        <Text style={{ fontSize: 13, color: '#ef4444', marginTop: 4, fontWeight: '600' }}>Margen: {alerta.margenActual}%</Text>
                    </View>

                    <View style={{ flex: 1, backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#86efac', alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, color: '#166534', textTransform: 'uppercase', fontWeight: '800', marginBottom: 8 }}>Sugerido por IA</Text>
                        <Text style={{ fontSize: 24, fontWeight: '900', color: '#166534' }}>${alerta.precioSugerido}</Text>
                        <Text style={{ fontSize: 13, color: '#16a34a', marginTop: 4, fontWeight: '600' }}>Margen: {alerta.margenObjetivo}%</Text>
                    </View>
                </Animated.View>

                {/* AI Loading State */}
                {loading && (
                    <Animated.View entering={FadeIn} style={{ padding: 40, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#fbbf24" />
                        <Text style={{ marginTop: 16, color: colors.textSecondary, fontWeight: '600' }}>
                            Conectando con el mercado de Panam\u00e1...
                        </Text>
                    </Animated.View>
                )}

                {/* AI Error State */}
                {!loading && error && (
                    <Animated.View entering={FadeIn} style={{ padding: 20, backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2', borderRadius: 16, borderWidth: 1, borderColor: '#fca5a5' }}>
                        <Text style={{ color: '#ef4444', textAlign: 'center', fontWeight: '600' }}>{error}</Text>
                    </Animated.View>
                )}

                {/* AI Advice & Reasoning */}
                {!loading && productAdvice && (
                    <Animated.View entering={FadeInDown.delay(300)}>
                        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: 16 }}>
                            El Veredicto de Caitlyn
                        </Text>
                        
                        <View style={{ backgroundColor: isDark ? 'rgba(251, 191, 36, 0.08)' : '#fffbeb', padding: 20, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.3)' }}>
                            <Text style={{ fontSize: 16, color: colors.textPrimary, lineHeight: 24, fontWeight: '600' }}>
                                "{productAdvice}"
                            </Text>
                        </View>

                        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 16, letterSpacing: 0.5 }}>
                            Factores que impulsan esta decisi\u00f3n
                        </Text>
                        
                        {renderReasoning()}
                    </Animated.View>
                )}

            </ScrollView>

            {/* Sticky Action Footer */}
            {!loading && (
                <Animated.View entering={FadeInDown.delay(500)} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border }}>
                    <TouchableOpacity 
                        style={{ backgroundColor: colors.primary, height: 56, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        onPress={() => {
                            // Enviaremos al usuario a la pantalla de Productos
                            // idealmente filtrando o buscando automáticamente el producto en cuestión.
                            navigation.navigate('Main');
                            setTimeout(() => {
                                navigation.navigate('Productos', { 
                                    editProductId: alerta.id, 
                                    suggestedPrice: alerta.precioSugerido 
                                });
                            }, 100);
                        }}
                    >
                        <Ionicons name="pencil" size={20} color="#fff" />
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Ir a Editar Producto</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}

        </View>
    );
}
