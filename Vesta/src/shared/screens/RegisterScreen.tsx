import { View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Image, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutLeft, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App';
import { useRegister } from '../hooks/useRegister';
import { VestaInput } from '../components/VestaInput';
import { VestaButton } from '../components/VestaButton';
import { styles } from '../styles/RegisterScreen.styles';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';

type RegisterScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
    const {
        step, nextStep, prevStep,
        nombre, handleNombreChange,
        email, setEmail,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        negocioNombre, setNegocioNombre,
        direccion, setDireccion,
        telefono, handleTelefonoChange,
        logo, setLogo, seleccionarImagen,
        obtenerUbicacionGps, gpsLoading,
        categoriaNegocio, setCategoriaNegocio,
        esLavadero, setEsLavadero,
        loading, error, handleRegister
    } = useRegister();

    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Animated.View
                        key="step1"
                        entering={FadeInRight.duration(400)}
                        exiting={FadeOutLeft.duration(400)}
                        style={styles.formContainer}
                    >
                        <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>El Negocio</Text>
                        <VestaInput
                            label="Nombre del Negocio"
                            value={negocioNombre}
                            onChangeText={setNegocioNombre}
                            placeholder="Ej. Burguer Truck"
                        />

                        <Text style={[styles.label, { color: colors.textSecondary }]}>Logo del Negocio</Text>
                        <TouchableOpacity
                            onPress={seleccionarImagen}
                            style={[
                                styles.imagePickerContainer,
                                { backgroundColor: colors.card, borderColor: colors.border }
                            ]}
                        >
                            {logo ? (
                                <Image source={{ uri: logo }} style={styles.imagePreview} />
                            ) : (
                                <View style={styles.pickerPlaceholder}>
                                    <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
                                    <Text style={{ color: colors.textSecondary, marginTop: 5 }}>Subir Logo</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 10 }]}>Tipo de Negocio</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                            {[
                                { value: 'BELLEZA' as const, label: 'Belleza', icon: 'cut-outline' as const, color: '#8b5cf6' },
                                { value: 'COMIDA' as const, label: 'Comida', icon: 'restaurant-outline' as const, color: '#059669' },
                                { value: 'FRUTERIA' as const, label: 'Frutería', icon: 'leaf-outline' as const, color: '#10b981' },
                                { value: 'LAVAUTOS' as const, label: 'Lavautos', icon: 'car-sport-outline' as const, color: '#38BDF8' },
                                { value: 'JARDINERIA' as const, label: 'Jardinería', icon: 'flower-outline' as const, color: '#f59e0b' },
                            ].map(cat => {
                                const isSelected = categoriaNegocio === cat.value;
                                return (
                                    <TouchableOpacity
                                        key={cat.value}
                                        onPress={() => setCategoriaNegocio(cat.value)}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 6,
                                            paddingHorizontal: 14,
                                            paddingVertical: 10,
                                            borderRadius: 14,
                                            backgroundColor: isSelected ? cat.color + '20' : colors.card,
                                            borderWidth: 1.5,
                                            borderColor: isSelected ? cat.color : colors.border,
                                        }}
                                    >
                                        <Ionicons name={cat.icon} size={18} color={isSelected ? cat.color : colors.textMuted} />
                                        <Text style={{ fontSize: 12, fontWeight: '800', color: isSelected ? cat.color : colors.textSecondary }}>
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {categoriaNegocio === 'LAVAUTOS' && (
                            <TouchableOpacity
                                onPress={() => setEsLavadero(!esLavadero)}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 10,
                                    backgroundColor: esLavadero ? '#38BDF820' : colors.card,
                                    padding: 12,
                                    borderRadius: 14,
                                    borderWidth: 1.5,
                                    borderColor: esLavadero ? '#38BDF8' : colors.border,
                                    marginBottom: 4,
                                }}
                            >
                                <Ionicons
                                    name={esLavadero ? 'checkbox' : 'square-outline'}
                                    size={22}
                                    color={esLavadero ? '#38BDF8' : colors.textMuted}
                                />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '800', color: esLavadero ? '#38BDF8' : colors.textPrimary }}>
                                        Soy lavadero
                                    </Text>
                                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>
                                        Crearás un usuario de lavadero vinculado a tu negocio
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}

                        <VestaButton
                            title="Siguiente"
                            onPress={nextStep}
                            variant="primary"
                        />
                    </Animated.View>
                );
            case 2:
                return (
                    <Animated.View
                        key="step2"
                        entering={FadeInRight.duration(400)}
                        exiting={FadeOutLeft.duration(400)}
                        style={styles.formContainer}
                    >
                        <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Ubicación y Contacto</Text>

                        <View style={styles.inputWithHelper}>
                            <View style={styles.labelRow}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Ubicación / Dirección</Text>
                                <TouchableOpacity
                                    onPress={obtenerUbicacionGps}
                                    disabled={gpsLoading}
                                    style={styles.gpsButtonInline}
                                >
                                    {gpsLoading ? (
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    ) : (
                                        <>
                                            <Ionicons name="location" size={14} color={colors.primary} />
                                            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold' }}>Detectar GPS</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                            <VestaInput
                                value={direccion}
                                onChangeText={setDireccion}
                                placeholder="Ej. Calle 50, Plaza X"
                                style={{ marginTop: 0 }}
                            />
                        </View>

                        <VestaInput
                            label="Teléfono de contacto"
                            value={telefono}
                            onChangeText={handleTelefonoChange}
                            placeholder="Ej. 6000-0000"
                            keyboardType="phone-pad"
                            maxLength={9}
                        />
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={{ flex: 1 }}>
                                <VestaButton
                                    title="Atrás"
                                    onPress={prevStep}
                                    variant="outline"
                                />
                            </View>
                            <View style={{ flex: 2 }}>
                                <VestaButton
                                    title="Siguiente"
                                    onPress={nextStep}
                                    variant="primary"
                                />
                            </View>
                        </View>
                    </Animated.View>
                );
            case 3:
                return (
                    <Animated.View
                        key="step3"
                        entering={FadeInRight.duration(400)}
                        exiting={FadeOutLeft.duration(400)}
                        style={styles.formContainer}
                    >
                        <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Tus Datos</Text>
                        <VestaInput
                            label="Tu Nombre"
                            value={nombre}
                            onChangeText={handleNombreChange}
                            placeholder="Nombre completo"
                        />
                        <VestaInput
                            label="Correo Electrónico"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="ejemplo@correo.com"
                        />
                        <VestaInput
                            label="Contraseña"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholder="••••••••"
                        />
                        <VestaInput
                            label="Confirmar Contraseña"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            placeholder="••••••••"
                        />
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={{ flex: 1 }}>
                                <VestaButton
                                    title="Atrás"
                                    onPress={prevStep}
                                    variant="outline"
                                />
                            </View>
                            <View style={{ flex: 2 }}>
                                <VestaButton
                                    title="Completar Registro"
                                    onPress={handleRegister}
                                    loading={loading}
                                    variant="primary"
                                />
                            </View>
                        </View>

                        {/* Aviso Legal */}
                        <TouchableOpacity
                            style={{ marginTop: 20, alignItems: 'center' }}
                            onPress={() => Linking.openURL(`${process.env.EXPO_PUBLIC_FRONTEND_URL}/legal/terms`)}
                        >
                            <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: 'center' }}>
                                Al completar el registro, confirmas que aceptas nuestros{' '}
                                <Text style={{ color: colors.primary, fontWeight: 'bold', textDecorationLine: 'underline' }}>
                                    Términos y Condiciones
                                </Text>
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                );
            default:
                return null;
        }
    };

    // Componente para los dots animados
    const AnimatedDot = ({ active }: { active: boolean }) => {
        const animatedStyle = useAnimatedStyle(() => ({
            width: withSpring(active ? 24 : 8),
            backgroundColor: withTiming(active ? colors.primary : colors.textMuted),
            opacity: withTiming(active ? 1 : 0.4),
        }));

        return <Animated.View style={[{ height: 8, borderRadius: 4 }, animatedStyle]} />;
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.innerContainer}>

                    <View style={[styles.blurCircle, isDark && { backgroundColor: 'rgba(225, 29, 72, 0.05)' }]} />

                    <View style={styles.headerContainer}>
                        <View style={[styles.logoContainer, { backgroundColor: '#FFFFFF', padding: 8 }]}>
                            <Image source={require('../../../assets/images/splash-icon.png')} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                        </View>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Empieza con Vesta</Text>

                        {/* Step Indicator */}
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 15, justifyContent: 'center' }}>
                            {[1, 2, 3].map((s) => (
                                <AnimatedDot key={s} active={step === s} />
                            ))}
                        </View>
                    </View>

                    {error ? <Text style={styles.globalError}>{error}</Text> : null}

                    {renderStep()}

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
