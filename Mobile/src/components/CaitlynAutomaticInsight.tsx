import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
    FadeInDown, 
    FadeOutRight,
    useAnimatedStyle, 
    withRepeat, 
    withSequence, 
    withTiming,
} from 'react-native-reanimated';
import { useCaitlyn } from '../hooks/useCaitlyn';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';
import { BlurView } from 'expo-blur';
import api from '../services/api';

const { width } = Dimensions.get('window');

export const CaitlynAutomaticInsight = () => {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const { getDailyInsight, advice, loading, setAdvice } = useCaitlyn();
    const [expanded, setExpanded] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        getDailyInsight();
    }, []);

    const handleAutoAdjust = async () => {
        setUpdating(true);
        try {
            await api.post('/productos/auto-adjust-general', {});
            setSuccess(true);
            setAdvice("¡Listo! He analizado tu menú y ajustado los precios necesarios para proteger tu rentabilidad hoy.");
            setTimeout(() => setSuccess(false), 8000);
        } catch (err) {
            console.error('Error al auto-ajustar desde burbuja:', err);
        } finally {
            setUpdating(false);
        }
    };

    // Efecto de pulso para el botón flotante
    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{
            scale: withRepeat(
                withSequence(
                    withTiming(1.08, { duration: 1500 }),
                    withTiming(1, { duration: 1500 })
                ),
                -1,
                true
            )
        }]
    }));

    if (dismissed || (!loading && !advice)) return null;

    return (
        <View style={styles.floatingContainer} pointerEvents="box-none">
            {/* Globo de Diálogo (Visible cuando se expande) */}
            {expanded && advice && (
                <Animated.View 
                    entering={FadeInDown.springify().damping(12)}
                    exiting={FadeOutRight}
                    style={[styles.bubbleWrapper]}
                >
                    <BlurView intensity={isDark ? 50 : 90} style={[styles.bubble, { borderColor: colors.primary + '44' }]}>
                        <View style={styles.bubbleHeader}>
                            <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
                            <Text style={[styles.statusText, { color: colors.textSecondary }]}>Sugerencia de Caitlyn</Text>
                            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => getDailyInsight(true)} disabled={loading}>
                                    <Ionicons name="sync" size={16} color={loading ? colors.textMuted : colors.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setExpanded(false)}>
                                    <Ionicons name="close" size={20} color={colors.textMuted} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        <ScrollView 
                            style={styles.scrollContainer} 
                            showsVerticalScrollIndicator={true}
                            indicatorStyle={isDark ? 'white' : 'black'}
                        >
                            <Text style={[styles.message, { color: colors.textPrimary }]}>
                                {advice}
                            </Text>

                            {!success && (advice.toLowerCase().includes('precio') || advice.toLowerCase().includes('ajust')) && (
                                <TouchableOpacity 
                                    onPress={handleAutoAdjust}
                                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                                    disabled={updating}
                                >
                                    {updating ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <>
                                            <Ionicons name="flash" size={16} color="#FFF" />
                                            <Text style={styles.actionText}>Ajustar Menú Ahora</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </ScrollView>

                        <View style={styles.bubbleFooter}>
                            <Text style={[styles.footerText, { color: colors.textMuted }]}>
                                Inteligencia de Mercado (Panamá)
                            </Text>
                        </View>
                    </BlurView>
                    {/* Triángulo de la burbuja */}
                    <View style={[styles.triangle, { borderTopColor: colors.primary + '22' }]} />
                </Animated.View>
            )}

            {/* El Botón Flotante (Avatar de Caitlyn) */}
            <View style={styles.buttonAlignment}>
                <Animated.View style={[pulseStyle, { padding: 4 }]}>
                    <TouchableOpacity 
                        onPress={() => setExpanded(!expanded)}
                        activeOpacity={0.8}
                        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Ionicons name="sparkles" size={24} color="#FFF" />
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    floatingContainer: {
        position: 'absolute',
        bottom: 20, // Bajado de 80 a 20 para que flote justo encima de la barra
        right: 20,
        zIndex: 9999,
        alignItems: 'flex-end',
        width: width - 40,
    },
    buttonAlignment: {
        width: 65,
        height: 65,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
    },
    bubbleWrapper: {
        width: width * 0.85,
        marginBottom: 8,
        alignItems: 'flex-end',
    },
    bubble: {
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
    },
    scrollContainer: {
        maxHeight: 220, // Altura máxima para permitir scroll interno
    },
    bubbleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
        textTransform: 'uppercase',
        flex: 1,
    },
    closeBtn: {
        padding: 4,
    },
    message: {
        fontSize: 14,
        lineHeight: 21,
        fontWeight: '600',
    },
    actionButton: {
        marginTop: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    actionText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    bubbleFooter: {
        marginTop: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    footerText: {
        fontSize: 9,
        fontWeight: '700',
        fontStyle: 'italic',
    },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        marginRight: 18,
    }
});
