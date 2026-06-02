import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';

interface FinancialAlertCardProps {
    alertCount: number;
    onPress: () => void;
}

export const FinancialAlertCard: React.FC<FinancialAlertCardProps> = ({ 
    alertCount, 
    onPress 
}) => {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    return (
        <Animated.View entering={FadeInDown.springify().damping(15).delay(200)}>
            <TouchableOpacity 
                style={{ 
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2', 
                    borderColor: 'rgba(239, 68, 68, 0.4)', 
                    borderWidth: 1.5, 
                    marginBottom: 24, 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    padding: 18,
                    borderRadius: 24,
                    shadowColor: '#ef4444',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: isDark ? 0.3 : 0.12,
                    shadowRadius: 15,
                    elevation: 8
                }}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                    <Ionicons name="trending-down" size={28} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 }}>
                        <Ionicons name="sparkles" size={14} color="#ef4444" />
                        <Text style={{ fontSize: 11, fontWeight: '900', color: '#ef4444', textTransform: 'uppercase', letterSpacing: 1.2 }}>Caitlyn: Alerta Crítica</Text>
                    </View>
                    <Text style={{ fontSize: 17, fontWeight: '900', color: isDark ? '#fecaca' : '#991b1b', marginBottom: 2 }}>Márgenes en Riesgo</Text>
                    <Text style={{ fontSize: 14, color: isDark ? '#fca5a5' : '#b91c1c', lineHeight: 18, fontWeight: '500' }}>
                        Tienes <Text style={{ fontWeight: '900' }}>{alertCount}</Text> productos perdiendo dinero. Toca para ver detalle.
                    </Text>
                </View>
                <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: 10, borderRadius: 14 }}>
                    <Ionicons name="chevron-forward" size={20} color="#ef4444" />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};
