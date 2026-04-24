import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';
import { KitchyToolbar } from '../components/KitchyToolbar';
import Toast from 'react-native-toast-message';
import { getVentasElegibles, enviarEncuesta } from '../services/api';

const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `hace ${Math.floor(interval)} años`;
    interval = seconds / 2592000;
    if (interval > 1) return `hace ${Math.floor(interval)} meses`;
    interval = seconds / 86400;
    if (interval > 1) return `hace ${Math.floor(interval)} días`;
    interval = seconds / 3600;
    if (interval > 1) return `hace ${Math.floor(interval)} horas`;
    interval = seconds / 60;
    if (interval > 1) return `hace ${Math.floor(interval)} minutos`;
    return 'hace unos segundos';
};

export default function EncuestasScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    const [ventas, setVentas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const { data } = await getVentasElegibles();
            setVentas(data);
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar los datos.' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSendSurvey = async (ventaId: string, nombre: string) => {
        setSendingId(ventaId);
        try {
            await enviarEncuesta(ventaId);
            
            // Actualizamos localmente el estado de la venta
            setVentas(prev => prev.map(v => v._id === ventaId ? { ...v, encuestaEnviada: true } : v));
            
            Toast.show({
                type: 'success',
                text1: '¡Encuesta Enviada!',
                text2: `A ${nombre} le llegará un correo en breve.`,
                position: 'bottom'
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error al enviar',
                text2: error.response?.data?.message || 'Hubo un problema.',
            });
        } finally {
            setSendingId(null);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <KitchyToolbar
                title="Encuestas de Satisfacción"
                onBack={() => navigation.goBack()}
            />

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={[colors.primary]} />}
            >
                <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                        Marketing Inteligente
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        Aquí tienes las ventas recientes que tienen correo de contacto. Envía encuestas para conocer la calidad de tu servicio.
                    </Text>
                </Animated.View>

                {loading ? (
                    <View style={{ marginTop: 50 }}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : ventas.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="mail-unread-outline" size={64} color={colors.textMuted} />
                        <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 16, fontWeight: '600' }}>
                            No hay ventas recientes con correo electrónico.
                        </Text>
                    </View>
                ) : (
                    ventas.map((venta, index) => {
                        const cliente = venta.clienteId;
                        const serviceName = venta.items[0]?.nombreProducto || 'Servicio';
                        const timeAgo = formatTimeAgo(new Date(venta.createdAt));

                        return (
                            <Animated.View
                                key={venta._id}
                                entering={FadeInDown.duration(400).delay(100 * index)}
                                style={[styles.clientCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            >
                                <View style={styles.clientInfo}>
                                    <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                                        <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 18 }}>
                                            {cliente?.nombre?.charAt(0) || 'A'}
                                        </Text>
                                    </View>
                                    <View style={styles.details}>
                                        <Text style={[styles.name, { color: colors.textPrimary }]}>{cliente?.nombre || 'Anónimo'}</Text>
                                        <Text style={[styles.service, { color: colors.textSecondary }]}>{serviceName}</Text>
                                        <View style={styles.timeRow}>
                                            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                                            <Text style={[styles.time, { color: colors.textMuted }]}>{timeAgo}</Text>
                                        </View>
                                    </View>
                                </View>

                                {venta.encuestaEnviada ? (
                                    <View style={[styles.sentButton, { backgroundColor: '#10b98120' }]}>
                                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                        <Text style={[styles.sentText, { color: '#10b981' }]}>Enviada</Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={[styles.sendButton, { backgroundColor: colors.primary }]}
                                        onPress={() => handleSendSurvey(venta._id, cliente?.nombre)}
                                        disabled={sendingId === venta._id}
                                    >
                                        {sendingId === venta._id ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <>
                                                <Ionicons name="paper-plane" size={18} color="#fff" />
                                                <Text style={styles.sendButtonText}>Enviar</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </Animated.View>
                        );
                    })
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 15,
        lineHeight: 22,
    },
    clientCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 12,
    },
    clientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    details: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    service: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    time: {
        fontSize: 12,
        marginLeft: 4,
    },
    sendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    sentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    sentText: {
        fontWeight: '600',
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
    }
});
