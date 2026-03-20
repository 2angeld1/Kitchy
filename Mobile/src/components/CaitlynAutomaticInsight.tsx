import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { useCaitlyn } from '../hooks/useCaitlyn';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';

export const CaitlynAutomaticInsight = () => {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const { getDailyInsight, advice, loading, setAdvice } = useCaitlyn();
    const [updating, setUpdating] = React.useState(false);
    const [success, setSuccess] = React.useState(false);

    useEffect(() => {
        getDailyInsight();
    }, []);

    const handleAutoAdjust = async () => {
        setUpdating(true);
        try {
            // Intentamos un auto-ajuste general si Caitlyn detectó riesgos
            // En una versión pro, aquí pasaríamos IDs específicos, pero por ahora
            // activamos la revisión de márgenes del negocio.
            await api.post('/productos/auto-adjust-general', {});
            setSuccess(true);
            setAdvice("¡Listo! He ajustado tus precios para proteger tu margen de hoy.");
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            console.error('Error al auto-ajustar:', err);
        } finally {
            setUpdating(false);
        }
    };

    if (loading && !advice) {
        return (
            <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textMuted }]}>Caitlyn analizando Panamá...</Text>
            </View>
        );
    }

    if (!advice) return null;

    return (
        <Animated.View 
            entering={FadeInUp.duration(600)}
            layout={Layout.springify()}
            style={[styles.container, { 
                backgroundColor: colors.card, 
                borderColor: success ? '#4CAF50' : colors.primary + '44',
                shadowColor: success ? '#4CAF50' : colors.primary
            }]}
        >
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: (success ? '#4CAF50' : colors.primary) + '11' }]}>
                    <Ionicons 
                        name={success ? "checkmark-circle" : "sparkles-outline"} 
                        size={20} 
                        color={success ? "#4CAF50" : colors.primary} 
                    />
                </View>
                <Text style={[styles.title, { color: success ? "#4CAF50" : colors.primary }]}>
                    {success ? 'ACCIÓN EJECUTADA' : 'ESTRATEGIA CAITLYN'}
                </Text>
            </View>
            
            <Text style={[styles.message, { color: colors.textPrimary }]}>
                {advice}
            </Text>

            {!success && advice.toLowerCase().includes('precio') && (
                <View style={styles.actionContainer}>
                    <TouchableOpacity 
                        onPress={handleAutoAdjust}
                        disabled={updating}
                        style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    >
                        {updating ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="flash" size={16} color="#FFF" />
                                <Text style={styles.actionText}>Ajustar Precios Ahora</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.footer}>
                <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                <Text style={[styles.footerText, { color: colors.textMuted }]}>
                    {success ? 'Cambios aplicados en el menú' : 'Basado en precios oficiales (SNE, Merca Panamá, ACODECO)'}
                </Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        borderRadius: 28,
        marginHorizontal: 16,
        marginBottom: 24,
        borderWidth: 1.5,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 6,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        gap: 10,
    },
    iconContainer: {
        padding: 8,
        borderRadius: 12,
    },
    title: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    message: {
        fontSize: 15,
        lineHeight: 24,
        fontWeight: '600',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center'
    },
    actionContainer: {
        marginTop: 18,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4
    },
    actionText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 14
    },
    footer: {
        marginTop: 15,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    footerText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase'
    }
});
