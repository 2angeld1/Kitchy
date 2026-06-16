import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';

interface AlertaRentabilidad {
    id: string;
    nombre: string;
    margenActual: string;
    margenObjetivo: number;
    precioActual: number;
    precioSugerido: string;
    costoTotal: string;
    razon?: string;
    alertaMercado?: boolean;
}

interface CaitlynAlertsModalProps {
    visible: boolean;
    onClose: () => void;
    alertas: AlertaRentabilidad[];
    onViewStrategy: (alerta: AlertaRentabilidad) => void;
    onAplicarTodo?: () => void;
}

export const CaitlynAlertsModal: React.FC<CaitlynAlertsModalProps> = ({ 
    visible, 
    onClose, 
    alertas, 
    onViewStrategy,
    onAplicarTodo
}) => {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    return (
        <Modal 
            visible={visible} 
            animationType="slide" 
            transparent={true} 
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
                <View style={{ 
                    backgroundColor: colors.background, 
                    borderTopLeftRadius: 32, 
                    borderTopRightRadius: 32, 
                    padding: 24, 
                    paddingBottom: 40, 
                    maxHeight: '85%',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -10 },
                    shadowOpacity: 0.2,
                    shadowRadius: 20,
                    elevation: 5
                }}>
                    {/* Header */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: isDark ? 'rgba(251, 191, 36, 0.1)' : '#fef3c7', justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons name="bulb" size={26} color="#fbbf24" />
                            </View>
                            <View>
                                <Text style={{ fontSize: 22, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 }}>Caitlyn AI</Text>
                                <Text style={{ fontSize: 13, color: colors.textSecondary }}>Estrategia de Precios</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            {alertas.length > 1 && onAplicarTodo && (
                                <TouchableOpacity 
                                    onPress={() => {
                                        onAplicarTodo();
                                        onClose();
                                    }} 
                                    style={{
                                        height: 32,
                                        borderRadius: 16,
                                        backgroundColor: colors.primary,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingHorizontal: 12,
                                        gap: 4
                                    }}
                                >
                                    <Ionicons name="flash" size={14} color="#fff" />
                                    <Text style={{color: '#fff', fontSize: 12, fontWeight: '800'}}>Todos</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity 
                                onPress={onClose} 
                                style={{ 
                                    width: 40, 
                                    height: 40, 
                                    borderRadius: 20, 
                                    backgroundColor: colors.surface, 
                                    justifyContent: 'center', 
                                    alignItems: 'center' 
                                }}
                            >
                                <Ionicons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                        {alertas.length === 0 ? (
                            <View style={{ padding: 40, alignItems: 'center' }}>
                                <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
                                <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary, textAlign: 'center' }}>Tus márgenes están saludables. ¡Buen trabajo!</Text>
                            </View>
                        ) : (
                            alertas.map((alerta, idx) => (
                                <View 
                                    key={idx} 
                                    style={{ 
                                        backgroundColor: colors.surface, 
                                        padding: 24, 
                                        borderRadius: 28, 
                                        marginBottom: 20, 
                                        borderWidth: 1, 
                                        borderColor: alerta.alertaMercado ? '#fbbf24' : colors.border,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: isDark ? 0.3 : 0.05,
                                        shadowRadius: 12,
                                        elevation: 2
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 20, fontWeight: '900', color: colors.textPrimary, marginBottom: 4 }}>{alerta.nombre}</Text>
                                            {alerta.razon && (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                    <Ionicons name={alerta.alertaMercado ? "warning" : "information-circle"} size={14} color={alerta.alertaMercado ? "#fbbf24" : "#3b82f6"} />
                                                    <Text style={{ fontSize: 12, color: colors.textSecondary, flex: 1 }}>{alerta.razon}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* Comparativa */}
                                    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                                        <View style={{ flex: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
                                            <Text style={{ fontSize: 10, color: colors.textSecondary, textTransform: 'uppercase', fontWeight: '800', marginBottom: 4 }}>Actual</Text>
                                            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>${alerta.precioActual}</Text>
                                            <Text style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>Margen: {alerta.margenActual}%</Text>
                                        </View>

                                        <View style={{ justifyContent: 'center' }}>
                                            <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
                                        </View>

                                        <View style={{ flex: 1, backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#86efac' }}>
                                            <Text style={{ fontSize: 10, color: '#166534', textTransform: 'uppercase', fontWeight: '800', marginBottom: 4 }}>Sugerido</Text>
                                            <Text style={{ fontSize: 18, fontWeight: '900', color: '#166534' }}>${alerta.precioSugerido}</Text>
                                            <Text style={{ fontSize: 11, color: '#16a34a', marginTop: 2 }}>Margen: {alerta.margenObjetivo}%</Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity 
                                        activeOpacity={0.8}
                                        style={{ 
                                            backgroundColor: colors.textPrimary, 
                                            height: 54, 
                                            borderRadius: 18, 
                                            flexDirection: 'row',
                                            justifyContent: 'center', 
                                            alignItems: 'center',
                                            gap: 8
                                        }}
                                        onPress={() => onViewStrategy(alerta)}
                                    >
                                        <Ionicons name="eye" size={20} color={colors.background} />
                                        <Text style={{ color: colors.background, fontSize: 16, fontWeight: '900' }}>Ver Estrategia y Detalles</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </ScrollView>

                </View>
            </View>
        </Modal>
    );
};
