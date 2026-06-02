import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { getFeedbacks } from '../services/api';

export default function FeedbacksScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const cargarFeedbacks = useCallback(async () => {
        try {
            const res = await getFeedbacks();
            setFeedbacks(res.data);
        } catch (error) {
            console.error('Error cargando feedbacks:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        cargarFeedbacks();
    }, [cargarFeedbacks]);

    const onRefresh = () => {
        setRefreshing(true);
        cargarFeedbacks();
    };

    const renderStars = (puntuacion: number) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons 
                        key={s} 
                        name={s <= puntuacion ? "star" : "star-outline"} 
                        size={16} 
                        color={s <= puntuacion ? "#fbbf24" : colors.textMuted} 
                    />
                ))}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <KitchyToolbar 
                title="Opiniones del Cliente" 
                onBack={() => navigation.goBack()}
            />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                >
                    {feedbacks.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbubble-ellipses-outline" size={80} color={colors.border} />
                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                                Aún no has recibido comentarios de los clientes.
                            </Text>
                        </View>
                    ) : (
                        feedbacks.map((f, index) => (
                            <Animated.View 
                                key={f._id}
                                entering={FadeInDown.delay(index * 100)}
                                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                            >
                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={[styles.clientName, { color: colors.textPrimary }]}>
                                            {f.ventaId?.cliente || 'Anónimo'}
                                        </Text>
                                        <Text style={[styles.date, { color: colors.textMuted }]}>
                                            {new Date(f.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                    {renderStars(f.puntuacion)}
                                </View>

                                {f.comentario ? (
                                    <View style={styles.commentBox}>
                                        <Text style={[styles.commentLabel, { color: colors.textSecondary }]}>Experiencia:</Text>
                                        <Text style={[styles.commentText, { color: colors.textPrimary }]}>"{f.comentario}"</Text>
                                    </View>
                                ) : null}

                                {f.sugerencias ? (
                                    <View style={styles.sugerenciaBox}>
                                        <Ionicons name="bulb-outline" size={14} color="#10b981" />
                                        <Text style={[styles.sugerenciaText, { color: '#10b981' }]}>
                                            Sujerencia: {f.sugerencias}
                                        </Text>
                                    </View>
                                ) : null}
                            </Animated.View>
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 16 },
    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    clientName: { fontSize: 16, fontWeight: 'bold' },
    date: { fontSize: 12, marginTop: 2 },
    starsContainer: { flexDirection: 'row', gap: 2 },
    commentBox: {
        backgroundColor: 'rgba(0,0,0,0.02)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
    },
    commentLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
    commentText: { fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
    sugerenciaBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(16, 185, 129, 0.06)',
        padding: 10,
        borderRadius: 10,
    },
    sugerenciaText: { fontSize: 13, fontWeight: '600', flex: 1 },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 40 },
    emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16, lineHeight: 24 }
});
