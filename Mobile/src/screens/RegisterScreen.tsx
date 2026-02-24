import React from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useRegister } from '../hooks/useRegister';
import { KitchyInput } from '../components/KitchyInput';
import { KitchyButton } from '../components/KitchyButton';
import { colors, spacing, borderRadius, typography } from '../theme';

type RegisterScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
    const {
        nombre, setNombre,
        email, setEmail,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        loading, error, handleRegister
    } = useRegister();

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.innerContainer}>

                    <View style={styles.blurCircle} />

                    <View style={styles.headerContainer}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoText}>K<Text style={styles.logoDot}>.</Text></Text>
                        </View>
                        <Text style={styles.title}>Crear cuenta</Text>
                        <Text style={styles.subtitle}>Comienza a gestionar tu negocio hoy mismo.</Text>
                    </View>

                    {error ? <Text style={styles.globalError}>{error}</Text> : null}

                    <View style={styles.formContainer}>
                        <KitchyInput
                            label="Nombre Completo"
                            value={nombre}
                            onChangeText={setNombre}
                            placeholder="Tu nombre completo"
                        />
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
                        <KitchyInput
                            label="Confirmar Contraseña"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            placeholder="••••••••"
                        />
                    </View>

                    <KitchyButton
                        title="Regístrate"
                        onPress={handleRegister}
                        loading={loading}
                        variant="primary"
                    />

                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.footerLink}>Iniciar Sesión</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xxl,
        position: 'relative',
    },
    blurCircle: {
        position: 'absolute',
        bottom: '-10%',
        right: '10%',
        width: 288,
        height: 288,
        backgroundColor: 'rgba(168, 85, 247, 0.1)', // purple-500/10
        borderRadius: 144,
        zIndex: -1,
    },
    headerContainer: {
        marginBottom: spacing.xl,
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
        shadowOpacity: 0.1,
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
        gap: spacing.xs,
    },
    globalError: {
        color: colors.error,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    footerContainer: {
        marginTop: spacing.xl,
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
