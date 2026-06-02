import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';
import { useReportes } from '../hooks/useReportes';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Animated, { FadeInDown } from 'react-native-reanimated';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function FinanzasScreen() {
    const navigation = useNavigation();
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const { financialData, loading, error, cargarReporteFinanciero } = useReportes();
    const [fiscalData, setFiscalData] = useState<any>(null);
    const [loadingFiscal, setLoadingFiscal] = useState(false);

    const cargarDatosFiscales = async () => {
        try {
            setLoadingFiscal(true);
            const response = await api.get('/stats/fiscal-balance');
            setFiscalData(response.data);
        } catch (err) {
            console.warn('Error cargando balance fiscal:', err);
        } finally {
            setLoadingFiscal(false);
        }
    };

    useEffect(() => {
        cargarReporteFinanciero();
        cargarDatosFiscales();
    }, [cargarReporteFinanciero]);

    const onRefresh = () => {
        cargarReporteFinanciero();
        cargarDatosFiscales();
    };

    if (loading && !financialData) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const chartData = {
        labels: financialData?.desgloseDiario.slice(-7).map(d => d.fecha.split('-')[2]) || [],
        datasets: [
            {
                data: financialData?.desgloseDiario.slice(-7).map(d => d.ingresos) || [0],
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green
                strokeWidth: 3
            },
            {
                data: financialData?.desgloseDiario.slice(-7).map(d => d.egresos) || [0],
                color: (opacity = 1) => `rgba(225, 29, 72, ${opacity})`, // Red
                strokeWidth: 3
            }
        ],
        legend: ["Ingresos", "Egresos"]
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <KitchyToolbar title="Salud Financiera" onBack={() => navigation.goBack()} />
            
            <ScrollView 
                contentContainerStyle={{ padding: 20 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {/* 🇵🇦 TARJETA FISCAL (PROVISIÓN ITBMS) */}
                <Animated.View 
                    entering={FadeInDown.delay(50)} 
                    style={{ 
                        backgroundColor: isDark ? 'rgba(79, 70, 229, 0.15)' : 'rgba(79, 70, 229, 0.05)', 
                        padding: 18, borderRadius: 24, marginBottom: 20, 
                        borderWidth: 1.5, borderColor: '#4f46e5',
                        flexDirection: 'row', alignItems: 'center'
                    }}
                >
                    <View style={{ backgroundColor: '#4f46e5', padding: 12, borderRadius: 16, marginRight: 15 }}>
                        <Ionicons name="receipt-outline" size={24} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>PROVISIÓN ITBMS ({fiscalData?.resumen.mes || 'Mes'})</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 2 }}>
                            <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: '900' }}>
                                ${fiscalData?.balanceFinal || '0.00'}
                            </Text>
                            <Text style={{ color: colors.textMuted, fontSize: 12, marginLeft: 4 }}>estimado</Text>
                        </View>
                        <Text style={{ color: '#4f46e5', fontSize: 11, marginTop: 4, fontWeight: '600' }}>
                            Deducibles de facturas: ${fiscalData?.itbmsCompras || '0.00'}
                        </Text>
                    </View>
                    {loadingFiscal && <ActivityIndicator size="small" color="#4f46e5" />}
                </Animated.View>

                {/* Resumen Cards */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 }}>
                    <Animated.View entering={FadeInDown.delay(100)} style={{ width: '48%', backgroundColor: colors.card, padding: 16, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Ingresos (Bruto)</Text>
                        <Text style={{ color: '#10b981', fontSize: 22, fontWeight: '800', marginTop: 4 }}>${financialData?.resumen.ingresos}</Text>
                    </Animated.View>
                    
                    <Animated.View entering={FadeInDown.delay(200)} style={{ width: '48%', backgroundColor: colors.card, padding: 16, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Egresos (Gastos)</Text>
                        <Text style={{ color: colors.primary, fontSize: 22, fontWeight: '800', marginTop: 4 }}>${financialData?.resumen.egresos}</Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(300)} style={{ width: '100%', backgroundColor: colors.card, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Ganancia Neta</Text>
                            <Text style={{ color: colors.textPrimary, fontSize: 32, fontWeight: '900', marginTop: 4 }}>${financialData?.resumen.ganancia}</Text>
                        </View>
                        <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 12, borderRadius: 16 }}>
                            <Text style={{ color: '#10b981', fontWeight: 'bold' }}>Margen {financialData?.resumen.margen}</Text>
                        </View>
                    </Animated.View>
                </View>

                {/* Grafica */}
                <Animated.View entering={FadeInDown.delay(400)} style={{ backgroundColor: colors.card, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: colors.border, marginBottom: 20 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: 'bold', marginBottom: 20 }}>Comparativa (7 días)</Text>
                    <LineChart
                        data={chartData}
                        width={width - 72}
                        height={220}
                        chartConfig={{
                            backgroundColor: colors.card,
                            backgroundGradientFrom: colors.card,
                            backgroundGradientTo: colors.card,
                            decimalPlaces: 0,
                            color: (opacity = 1) => colors.textMuted,
                            labelColor: (opacity = 1) => colors.textSecondary,
                            propsForDots: { r: "5" },
                        }}
                        bezier
                        style={{ borderRadius: 16, marginLeft: -10 }}
                    />
                </Animated.View>

                {/* Desglose List */}
                <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Historial Diario</Text>
                {financialData?.desgloseDiario.slice(0).reverse().map((dia, idx) => (
                    <Animated.View key={idx} entering={FadeInDown.delay(500 + (idx * 50))} style={{ backgroundColor: colors.card, padding: 16, borderRadius: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
                        <View>
                            <Text style={{ color: colors.textPrimary, fontWeight: 'bold' }}>{new Date(dia.fecha).toLocaleDateString('es-PA', { day: 'numeric', month: 'short' })}</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{dia.ingresos > 0 ? 'Ventas registradas' : 'Sin ventas'}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ color: dia.ganancia >= 0 ? '#10b981' : colors.primary, fontWeight: '800' }}>
                                {dia.ganancia >= 0 ? '+' : ''}${dia.ganancia.toFixed(2)}
                            </Text>
                            <Text style={{ color: colors.textMuted, fontSize: 10 }}>In: ${dia.ingresos.toFixed(0)} | Out: ${dia.egresos.toFixed(0)}</Text>
                        </View>
                    </Animated.View>
                ))}
            </ScrollView>
        </View>
    );
}
