import React from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useLogin } from '../hooks/useLogin';
import { KitchyInput } from '../components/KitchyInput';
import { KitchyButton } from '../components/KitchyButton';
import { styles } from '../styles/LoginScreen.styles';

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

                <View style={styles.blurCircle} />

                <View style={styles.headerContainer}>
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
