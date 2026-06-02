import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { KitchyInput } from '../components/KitchyInput';
import { KitchyButton } from '../components/KitchyButton';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { forgotPassword } from '../services/api';
import Toast from 'react-native-toast-message';

export default function ForgotPasswordScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSendEmail = async () => {
        if (!email) {
            Toast.show({
                type: 'error',
                text1: 'Atención',
                text2: 'Por favor ingresa tu correo electrónico'
            });
            return;
        }

        setLoading(true);
        try {
            await forgotPassword(email);
            setSuccess(true);
            Toast.show({
                type: 'success',
                text1: '¡Enviado!',
                text2: 'Revisa tu bandeja de entrada'
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'No se pudo enviar el correo'
            });
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.successContent}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="mail-unread" size={80} color={colors.primary} />
                    </View>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>¡Correo Enviado!</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Hemos enviado un enlace de recuperación a:{"\n"}
                        <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>{email}</Text>
                    </Text>
                    <Text style={[styles.infoText, { color: colors.textMuted }]}>
                        Si no lo ves en unos minutos, revisa tu carpeta de SPAM.
                    </Text>
                    <TouchableOpacity 
                        style={[styles.backButton, { borderColor: colors.border }]}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>Volver al Inicio</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <View style={styles.content}>
                <TouchableOpacity 
                    style={styles.headerBack}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>

                <Text style={[styles.title, { color: colors.textPrimary }]}>Recuperar Contraseña</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    No te preocupes, sucede. Ingresa tu correo y te enviaremos un link para crear una nueva clave.
                </Text>

                <View style={styles.form}>
                    <KitchyInput
                        label="Correo Electrónico"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="tu@correo.com"
                    />

                    <KitchyButton
                        title="Enviar Enlace"
                        onPress={handleSendEmail}
                        loading={loading}
                        variant="primary"
                        style={{ marginTop: 20 }}
                    />
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, padding: 24, paddingTop: 60 },
    headerBack: { marginBottom: 30, width: 40, height: 40, justifyContent: 'center' },
    title: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
    subtitle: { fontSize: 16, lineHeight: 24, marginBottom: 40 },
    form: { gap: 10 },
    successContent: { flex: 1, padding: 30, justifyContent: 'center', alignItems: 'center' },
    iconContainer: { marginBottom: 30, padding: 30, backgroundColor: 'rgba(99, 102, 241, 0.05)', borderRadius: 100 },
    infoText: { textAlign: 'center', marginTop: 20, fontSize: 14 },
    backButton: { marginTop: 40, borderWidth: 1, paddingVertical: 15, paddingHorizontal: 40, borderRadius: 16 },
    backButtonText: { fontWeight: 'bold' }
});
