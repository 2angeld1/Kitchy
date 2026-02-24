import React from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useRegister } from '../hooks/useRegister';
import { KitchyInput } from '../components/KitchyInput';
import { KitchyButton } from '../components/KitchyButton';
import { styles } from '../styles/RegisterScreen.styles';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';

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
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.innerContainer}>

                    <View style={[styles.blurCircle, isDark && { backgroundColor: 'rgba(225, 29, 72, 0.05)' }]} />

                    <View style={styles.headerContainer}>
                        <View style={[styles.logoContainer, { backgroundColor: colors.textPrimary }]}>
                            <Text style={[styles.logoText, { color: colors.card }]}>K<Text style={styles.logoDot}>.</Text></Text>
                        </View>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Crear cuenta</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Comienza a gestionar tu negocio hoy mismo.</Text>
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
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>¿Ya tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.footerLink}>Iniciar Sesión</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
