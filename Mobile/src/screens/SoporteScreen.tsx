import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';
import { KitchyToolbar } from '../components/KitchyToolbar';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function SoporteScreen() {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    const abrirWhatsApp = () => {
        Linking.openURL('https://wa.me/50768014613?text=Hola, estoy usando Kitchy y tengo una duda');
    };

    const abrirEmail = () => {
        Linking.openURL('mailto:adp21900@gmail.com?subject=Soporte Kitchy');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <KitchyToolbar title="Soporte Técnico" />

            <View style={styles.content}>
                <Animated.View entering={FadeInUp.delay(200)} style={styles.heroSection}>
                    <View style={[styles.iconLarge, { backgroundColor: colors.primary + '15' }]}>
                        <Ionicons name="headset-outline" size={80} color={colors.primary} />
                    </View>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>¿Cómo podemos ayudarte?</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Nuestro equipo está listo para ayudarte con cualquier duda técnica sobre Kitchy.
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400)} style={styles.optionsContainer}>
                    <TouchableOpacity
                        style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={abrirWhatsApp}
                    >
                        <View style={[styles.optionIcon, { backgroundColor: '#25D36620' }]}>
                            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                        </View>
                        <View style={styles.optionInfo}>
                            <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>WhatsApp Directo</Text>
                            <Text style={[styles.optionDesc, { color: colors.textMuted }]}>Respuesta inmediata</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={abrirEmail}
                    >
                        <View style={[styles.optionIcon, { backgroundColor: colors.primary + '20' }]}>
                            <Ionicons name="mail-outline" size={24} color={colors.primary} />
                        </View>
                        <View style={styles.optionInfo}>
                            <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Correo Electrónico</Text>
                            <Text style={[styles.optionDesc, { color: colors.textMuted }]}>adp21900@gmail.com</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                </Animated.View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textMuted }]}>Kitchy v1.0.4 - Premium Support</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, padding: 24, justifyContent: 'center' },
    heroSection: { alignItems: 'center', marginBottom: 40 },
    iconLarge: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
    subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
    optionsContainer: { gap: 16 },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    optionIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    optionInfo: { flex: 1 },
    optionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    optionDesc: { fontSize: 13 },
    footer: { marginTop: 40, alignItems: 'center' },
    footerText: { fontSize: 12, opacity: 0.6 }
});
