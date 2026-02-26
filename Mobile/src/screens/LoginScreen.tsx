import React from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useLogin } from '../hooks/useLogin';
import { KitchyInput } from '../components/KitchyInput';
import { KitchyButton } from '../components/KitchyButton';
import { styles } from '../styles/LoginScreen.styles';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';

type LoginScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
    const { email, setEmail, password, setPassword, loading, error, handleLogin } = useLogin();
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <View style={styles.innerContainer}>

                <View style={[styles.blurCircle, isDark && { backgroundColor: 'rgba(225, 29, 72, 0.05)' }]} />

                <View style={styles.headerContainer}>
                    <View style={[styles.logoContainer, { backgroundColor: colors.textPrimary }]}>
                        <Text style={[styles.logoText, { color: colors.card }]}>K<Text style={styles.logoDot}>.</Text></Text>
                    </View>

                    <Text style={[styles.title, { color: colors.textPrimary }]}>¡Bienvenido!</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Ingresa a tu cuenta para continuar en Kitchy.</Text>
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
                    variant={isDark ? "primary" : "dark"}
                />

                <View style={styles.footerContainer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>¿No tienes cuenta? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.footerLink}>Regístrate aquí</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </KeyboardAvoidingView>
    );
}
