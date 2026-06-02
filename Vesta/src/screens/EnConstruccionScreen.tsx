import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';
import { KitchyToolbar } from '../components/KitchyToolbar';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

export default function EnConstruccionScreen({ route }: any) {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const navigation = useNavigation();

    // Título opcional pasado por parámetros de navegación
    const title = route?.params?.title || "Próximamente";

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <KitchyToolbar title={title} />

            <View style={styles.content}>
                <Animated.View entering={FadeInUp.delay(200)} style={styles.heroSection}>
                    <View style={[styles.iconLarge, { backgroundColor: '#f59e0b15' }]}>
                        <Ionicons name="construct-outline" size={80} color="#f59e0b" />
                    </View>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>¡Estamos trabajando en esto!</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        El módulo "{title}" está siendo perfeccionado por nuestra IA y equipo de desarrollo para darte la mejor experiencia premium.
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400)}>
                    <TouchableOpacity
                        style={[styles.backBtn, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backBtnText}>Regresar al Panel</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
    heroSection: { alignItems: 'center', marginBottom: 40 },
    iconLarge: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
    subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20, maxWidth: 300 },
    backBtn: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    backBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
