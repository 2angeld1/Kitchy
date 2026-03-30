import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
    FadeInDown, 
    FadeOutRight,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';

const { width } = Dimensions.get('window');

interface Tier {
    desde: number;
    hasta: number;
    porcentajeBarbero: number;
    porcentajeDueno: number;
}

interface Especialista {
    _id: string;
    nombre: string;
    rol: string;
    conteoDia?: number;
}

interface Props {
    especialistas: Especialista[];
    config: {
        tipo: 'fijo' | 'escalonado';
        fijo?: { porcentajeBarbero: number; porcentajeDueno: number };
        escalonado?: Tier[];
    };
}

export const BellezaCaitlynFAB: React.FC<Props> = ({ especialistas, config }) => {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const [expanded, setExpanded] = useState(false);

    if (especialistas.length === 0) return null;

    const renderProgress = (conteo: number) => {
        // Usamos modo escalonado siempre que existan tramos, para ser coherentes con el backend
        const tieneTramos = config.escalonado && config.escalonado.length > 0;

        if (!tieneTramos) {
            return (
                <Text style={[styles.tierText, { color: colors.primary }]}>
                    Comisión Fija: {config.fijo?.porcentajeBarbero || 50}%
                </Text>
            );
        }

        // Ya sabemos que tiene tramos por el if de arriba
        const tramos = [...(config.escalonado || [])].sort((a, b) => a.desde - b.desde);
        const tramoActual = tramos.find(t => conteo >= t.desde && (conteo <= t.hasta || t.hasta === 0)) || tramos[0];
        const nextIndex = tramos.indexOf(tramoActual) + 1;
        const proximoTramo = tramos[nextIndex];

        const pctBarbero = tramoActual.porcentajeBarbero;
        
        let progress = 0;
        let goalText = '';

        if (proximoTramo) {
            const range = proximoTramo.desde - tramoActual.desde;
            const currentInRange = conteo - tramoActual.desde + 1;
            progress = Math.min(Math.max(currentInRange / range, 0), 1);
            goalText = `Faltan ${proximoTramo.desde - conteo} para el ${proximoTramo.porcentajeBarbero}%`;
        } else {
            progress = 1;
            goalText = '¡Nivel Máximo alcanzado!';
        }

        return (
            <View style={{ marginTop: 4 }}>
                <View style={styles.tierHeader}>
                    <Text style={[styles.tierText, { color: colors.primary }]}>{pctBarbero}% de comisión</Text>
                    <Text style={[styles.goalText, { color: colors.textMuted }]}>{goalText}</Text>
                </View>
                <View style={[styles.track, { backgroundColor: colors.surface }]}>
                    <View style={[styles.progress, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
                </View>
            </View>
        );
    };

    return (
        <View style={styles.floatingContainer} pointerEvents="box-none">
            {expanded && (
                <Animated.View 
                    entering={FadeInDown.springify().damping(12)}
                    exiting={FadeOutRight}
                    style={styles.bubbleWrapper}
                >
                    <BlurView intensity={isDark ? 40 : 85} style={[styles.bubble, { borderColor: colors.primary + '33' }]}>
                        <View style={styles.bubbleHeader}>
                            <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
                            <Text style={[styles.statusText, { color: colors.textSecondary }]}>Caitlyn: Resumen del Día</Text>
                            <TouchableOpacity onPress={() => setExpanded(false)}>
                                <Ionicons name="close" size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                            {especialistas.map((esp) => (
                                <View key={esp._id} style={styles.espRow}>
                                    <View style={styles.espInfo}>
                                        <Text style={[styles.espName, { color: colors.textPrimary }]}>{esp.nombre}</Text>
                                        <Text style={[styles.espCount, { color: colors.textMuted }]}>{esp.conteoDia || 0} cortes hoy</Text>
                                    </View>
                                    {renderProgress(esp.conteoDia || 0)}
                                </View>
                            ))}
                        </ScrollView>

                        <View style={styles.bubbleFooter}>
                            <Text style={[styles.footerText, { color: colors.textMuted }]}>
                                "Motiva a tu equipo, cada corte cuenta."
                            </Text>
                        </View>
                    </BlurView>
                    <View style={[styles.triangle, { borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]} />
                </Animated.View>
            )}

            <View style={styles.buttonAlignment}>
                <TouchableOpacity 
                    onPress={() => setExpanded(!expanded)}
                    activeOpacity={0.8}
                    style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                >
                    <Image 
                        source={require('../../assets/caitlyn_beauty_avatar.png')} 
                        style={{ width: 56, height: 56, borderRadius: 28 }} 
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    floatingContainer: {
        position: 'absolute',
        bottom: 100, // Debajo del ticket si está abierto, o ajustable
        right: 20,
        zIndex: 99999,
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
        maxHeight: 300,
    },
    bubbleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
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
    espRow: {
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    espInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    espName: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    espCount: {
        fontSize: 12,
    },
    tierHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    tierText: {
        fontSize: 12,
        fontWeight: '800',
    },
    goalText: {
        fontSize: 10,
        fontWeight: '600',
    },
    track: {
        height: 6,
        borderRadius: 3,
        width: '100%',
        overflow: 'hidden',
    },
    progress: {
        height: '100%',
        borderRadius: 3,
    },
    bubbleFooter: {
        marginTop: 4,
        paddingTop: 8,
    },
    footerText: {
        fontSize: 10,
        fontWeight: '600',
        fontStyle: 'italic',
        textAlign: 'center',
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
