import React from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useLogin } from '../hooks/useLogin';
import { KitchyInput } from '../components/KitchyInput';
import { KitchyButton } from '../components/KitchyButton';
import { colors, spacing, borderRadius, typography } from '../theme';

type LoginScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
    const { email, setEmail, password, setPassword, loading, error, handleLogin } = useLogin();

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.innerContainer}>

                {/* Fondo decorativo opcional */}
                <View style={styles.blurCircle} />

                <View style={styles.headerContainer}>
                    {/* Logo Falso */}
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>K<Text style={styles.logoDot}>.</Text></Text>
                    </View>

                    <Text style={styles.title}>¡Bienvenido!</Text>
                    <Text style={styles.subtitle}>Ingresa a tu cuenta para continuar en Kitchy.</Text>
                </View>

                {error ? <Text style={styles.globalError}>{error}</Text> : null}

                <View style={styles.formContainer}>
                    <KitchyInput
                        label="Correo Electrónico"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="ejemplo@restaurante.com"
                    />

                    <KitchyInput
                        label="Contraseña"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholder="••••••••"
                    />
                </View>

                <KitchyButton
                    title="Iniciar Sesión"
                    onPress={handleLogin}
                    loading={loading}
                    variant="dark"
                />

                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>¿No tienes cuenta? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.footerLink}>Regístrate aquí</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        position: 'relative',
    },
    blurCircle: {
        position: 'absolute',
        top: '-10%',
        right: '-20%',
        width: 288,
        height: 288,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: 144,
        zIndex: -1,
    },
    headerContainer: {
        marginBottom: spacing.xxl,
    },
    logoContainer: {
        width: 64,
        height: 64,
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    logoText: {
        fontSize: 30,
        fontWeight: typography.fontWeight.black,
        color: colors.white,
    },
    logoDot: {
        color: colors.primary,
    },
    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.black,
        color: colors.textPrimary,
        letterSpacing: -1,
        marginBottom: spacing.sm,
    },
    subtitle: {
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.medium,
        fontSize: typography.fontSize.base,
    },
    formContainer: {
        gap: spacing.sm,
    },
    globalError: {
        color: colors.error,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    footerContainer: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.textSecondary,
    },
    footerLink: {
        fontWeight: typography.fontWeight.black,
        color: colors.primary,
        fontSize: typography.fontSize.sm,
    }
});
