import { View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutLeft, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
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
                        <KitchyInput
                            label="Nombre del Negocio"
                            value={negocioNombre}
                            onChangeText={setNegocioNombre}
                            placeholder="Ej. Burguer Truck"
                        />

                        <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 8 }]}>¿Qué tipo de negocio es?</Text>
                        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                            <TouchableOpacity
                                onPress={() => setCategoriaNegocio('COMIDA')}
                                style={{
                                    flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center',
                                    backgroundColor: categoriaNegocio === 'COMIDA' ? 'rgba(225, 29, 72, 0.1)' : colors.card,
                                    borderWidth: 2,
                                    borderColor: categoriaNegocio === 'COMIDA' ? colors.primary : colors.border
                                }}
                            >
                                <Ionicons name="restaurant-outline" size={28} color={categoriaNegocio === 'COMIDA' ? colors.primary : colors.textMuted} />
                                <Text style={{ color: categoriaNegocio === 'COMIDA' ? colors.primary : colors.textSecondary, fontWeight: '700', marginTop: 4, fontSize: 13 }}>Comida</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setCategoriaNegocio('BELLEZA')}
                                style={{
                                    flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center',
                                    backgroundColor: categoriaNegocio === 'BELLEZA' ? 'rgba(139, 92, 246, 0.1)' : colors.card,
                                    borderWidth: 2,
                                    borderColor: categoriaNegocio === 'BELLEZA' ? '#8b5cf6' : colors.border
                                }}
                            >
                                <Ionicons name="cut-outline" size={28} color={categoriaNegocio === 'BELLEZA' ? '#8b5cf6' : colors.textMuted} />
                                <Text style={{ color: categoriaNegocio === 'BELLEZA' ? '#8b5cf6' : colors.textSecondary, fontWeight: '700', marginTop: 4, fontSize: 13 }}>Salud y Belleza</Text>
                            </TouchableOpacity>
                        </View>

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

                        <KitchyButton
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
                            <KitchyInput
                                value={direccion}
                                onChangeText={setDireccion}
                                placeholder="Ej. Calle 50, Plaza X"
                                style={{ marginTop: 0 }}
                            />
                        </View>

                        <KitchyInput
                            label="Teléfono de contacto"
                            value={telefono}
                            onChangeText={handleTelefonoChange}
                            placeholder="Ej. 6000-0000"
                            keyboardType="phone-pad"
                            maxLength={9}
                        />
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={{ flex: 1 }}>
                                <KitchyButton
                                    title="Atrás"
                                    onPress={prevStep}
                                    variant="outline"
                                />
                            </View>
                            <View style={{ flex: 2 }}>
                                <KitchyButton
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
                        <KitchyInput
                            label="Tu Nombre"
                            value={nombre}
                            onChangeText={handleNombreChange}
                            placeholder="Nombre completo"
                        />
                        <KitchyInput
                            label="Correo Electrónico"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="ejemplo@correo.com"
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
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={{ flex: 1 }}>
                                <KitchyButton
                                    title="Atrás"
                                    onPress={prevStep}
                                    variant="outline"
                                />
                            </View>
                            <View style={{ flex: 2 }}>
                                <KitchyButton
                                    title="Completar Registro"
                                    onPress={handleRegister}
                                    loading={loading}
                                    variant="primary"
                                />
                            </View>
                        </View>
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
                        <View style={[styles.logoContainer, { backgroundColor: colors.textPrimary }]}>
                            <Text style={[styles.logoText, { color: colors.card }]}>K<Text style={styles.logoDot}>.</Text></Text>
                        </View>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Empieza con Kitchy</Text>

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
