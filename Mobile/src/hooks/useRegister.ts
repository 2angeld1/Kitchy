import { useState } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

export const useRegister = () => {
    const [step, setStep] = useState(1);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [negocioNombre, setNegocioNombre] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [logo, setLogo] = useState('');
    const [categoriaNegocio, setCategoriaNegocio] = useState<'COMIDA' | 'BELLEZA'>('COMIDA');
    const [loading, setLoading] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();

    const nextStep = () => {
        if (step === 1) {
            if (!negocioNombre) {
                Toast.show({ type: 'error', text1: 'Atención', text2: 'El nombre del negocio es obligatorio' });
                return;
            }
        }
        if (step === 2) {
            if (!direccion) {
                Toast.show({ type: 'error', text1: 'Atención', text2: 'La ubicación es importante para tus clientes' });
                return;
            }
        }
        setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev - 1);

    const seleccionarImagen = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Se necesitan permisos para acceder a la galería');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setLogo(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const obtenerUbicacionGps = async () => {
        setGpsLoading(true);
        console.log('Iniciando detección de GPS...');
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Toast.show({
                    type: 'error',
                    text1: 'Permiso denegado',
                    text2: 'Necesitamos acceso al GPS para detectar tu ubicación'
                });
                return;
            }

            console.log('Obteniendo posición actual...');
            const location = await Location.getCurrentPositionAsync({
                accuracy: Platform.OS === 'web' ? Location.Accuracy.Balanced : Location.Accuracy.High,
            });

            console.log('Coordenadas obtenidas:', location.coords);

            // Reverse geocoding para obtener la dirección texto
            try {
                console.log('Iniciando reverse geocoding...');
                const addresses = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });

                if (addresses && addresses.length > 0) {
                    const address = addresses[0];
                    console.log('Dirección encontrada:', address);
                    const formattedAddress = [
                        address.street,
                        address.name,
                        address.district || address.city,
                        address.region
                    ].filter(Boolean).join(', ').trim();

                    setDireccion(formattedAddress || `Coords: ${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`);
                    Toast.show({
                        type: 'success',
                        text1: 'Ubicación detectada',
                        text2: formattedAddress ? 'Hemos actualizado tu dirección' : 'Coordenadas guardadas'
                    });
                } else {
                    console.warn('No se encontró dirección para estas coordenadas');
                    setDireccion(`${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`);
                }
            } catch (geoError) {
                console.warn('Error en reverse geocoding, usando coordenadas:', geoError);
                setDireccion(`${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`);
            }
        } catch (err) {
            console.error('Error obteniendo GPS:', err);
            Toast.show({
                type: 'error',
                text1: 'Error de GPS',
                text2: 'No pudimos obtener tu ubicación. Verifica tu conexión y permisos.'
            });
        } finally {
            setGpsLoading(false);
            console.log('Detección de GPS finalizada.');
        }
    };

    const handleTelefonoChange = (text: string) => {
        // Solo dejar números
        const cleaned = text.replace(/\D/g, '');

        if (cleaned.startsWith('6')) {
            // Celular Panamá: 8 dígitos -> 0000-0000
            const limited = cleaned.slice(0, 8);
            if (limited.length > 4) {
                setTelefono(`${limited.slice(0, 4)}-${limited.slice(4)}`);
            } else {
                setTelefono(limited);
            }
        } else if (cleaned.length > 0) {
            // Teléfono Fijo (u otros): 7 dígitos -> 000-0000
            const limited = cleaned.slice(0, 7);
            if (limited.length > 3) {
                setTelefono(`${limited.slice(0, 3)}-${limited.slice(3)}`);
            } else {
                setTelefono(limited);
            }
        } else {
            setTelefono('');
        }
    };

    const handleNombreChange = (text: string) => {
        // Solo letras (incluyendo acentos y ñ), espacios y guiones
        const filtered = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]/g, '');
        setNombre(filtered);
    };

    const handleRegister = async () => {
        if (!nombre || !email || !password) {
            setError('Por favor completa tus datos personales');
            Toast.show({
                type: 'error',
                text1: 'Atención',
                text2: 'Todos los campos son obligatorios'
            });
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            Toast.show({
                type: 'error',
                text1: 'Error en registro',
                text2: 'Las contraseñas no coinciden'
            });
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            Toast.show({
                type: 'info',
                text1: 'Contraseña insegura',
                text2: 'Usa al menos 6 caracteres'
            });
            return;
        }

        setLoading(true);
        setError('');
        try {
            await register({
                email,
                password,
                nombre,
                negocioNombre,
                direccion,
                telefono,
                logo,
                categoriaNegocio
            });
            Toast.show({
                type: 'success',
                text1: '¡Cuenta creada!',
                text2: 'Bienvenido a Kitchy, ' + nombre
            });
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al registrar';
            setError(errorMsg);
            Toast.show({
                type: 'error',
                text1: 'Error al registrar',
                text2: errorMsg
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        step,
        nextStep,
        prevStep,
        nombre,
        handleNombreChange,
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        negocioNombre,
        setNegocioNombre,
        direccion,
        setDireccion,
        telefono,
        handleTelefonoChange,
        logo,
        setLogo,
        seleccionarImagen,
        obtenerUbicacionGps,
        gpsLoading,
        categoriaNegocio,
        setCategoriaNegocio,
        loading,
        error,
        setError,
        handleRegister
    };
};
