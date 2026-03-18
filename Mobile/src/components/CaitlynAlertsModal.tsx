import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
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
}

interface CaitlynAlertsModalProps {
    visible: boolean;
    onClose: () => void;
    alertas: AlertaRentabilidad[];
    onAjustarPrecio: (id: string) => Promise<void>;
}

export const CaitlynAlertsModal: React.FC<CaitlynAlertsModalProps> = ({ 
    visible, 
    onClose, 
    alertas, 
    onAjustarPrecio 
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
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                <View style={{ 
                    backgroundColor: colors.background, 
                    borderTopLeftRadius: 32, 
                    borderTopRightRadius: 32, 
                    padding: 24, 
                    paddingBottom: 40, 
                    maxHeight: '85%',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -10 },
                    shadowOpacity: 0.1,
                    shadowRadius: 20,
                    elevation: 5
                }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(239, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons name="sparkles" size={24} color="#ef4444" />
                            </View>
                            <View>
                                <Text style={{ fontSize: 20, fontWeight: '900', color: colors.textPrimary }}>Recomendaciones</Text>
                                {alertas.length > 0 && (
                                    <Text style={{ fontSize: 13, color: colors.textSecondary }}>Meta de rentabilidad: {alertas[0].margenObjetivo}%</Text>
                                )}
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={{ padding: 8, backgroundColor: colors.surface, borderRadius: 14 }}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                        {alertas.map((alerta, idx) => (
                            <View 
                                key={idx} 
                                style={{ 
                                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.05)' : colors.surface, 
                                    padding: 20, 
                                    borderRadius: 24, 
                                    marginBottom: 16, 
                                    borderWidth: 1, 
                                    borderColor: isDark ? 'rgba(239, 68, 68, 0.2)' : colors.border,
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 18, fontWeight: '900', color: colors.textPrimary, marginBottom: 8 }}>{alerta.nombre}</Text>
                                    
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                                        <View style={{ backgroundColor: '#fee2e2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#fecaca' }}>
                                            <Text style={{ fontSize: 11, color: '#991b1b', fontWeight: '900' }}>Margen: {alerta.margenActual}%</Text>
                                        </View>
                                        <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                                            <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '700' }}>Actual: ${alerta.precioActual}</Text>
                                        </View>
                                    </View>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4', padding: 12, borderRadius: 14, borderLeftWidth: 4, borderLeftColor: '#22c55e' }}>
                                        <Ionicons name="rocket-outline" size={16} color="#22c55e" style={{ marginRight: 8 }} />
                                        <Text style={{ fontSize: 13, color: colors.textPrimary, fontWeight: '600' }}>
                                            Sugerido: <Text style={{ color: '#22c55e', fontWeight: '900', fontSize: 15 }}>${alerta.precioSugerido}</Text>
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity 
                                    style={{ 
                                        backgroundColor: '#ef4444', 
                                        width: 56, 
                                        height: 56, 
                                        borderRadius: 20, 
                                        justifyContent: 'center', 
                                        alignItems: 'center', 
                                        marginLeft: 16,
                                        shadowColor: '#ef4444',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 8,
                                        elevation: 4
                                    }}
                                    onPress={() => onAjustarPrecio(alerta.id)}
                                >
                                    <Ionicons name="flash" size={26} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
