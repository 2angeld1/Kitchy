import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

export const useLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Por favor completa todos los campos');
            Toast.show({
                type: 'error',
                text1: 'Campos incompletos',
                text2: 'Debes llenar el correo y la contraseña'
            });
            return;
        }

        setLoading(true);
        setError('');
        try {
            await login(email, password);
            Toast.show({
                type: 'success',
                text1: '¡Bienvenido!',
                text2: 'Has iniciado sesión correctamente'
            });
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al iniciar sesión';
            setError(errorMsg);
            Toast.show({
                type: 'error',
                text1: 'Error de acceso',
                text2: errorMsg
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        loading,
        error,
        setError,
        handleLogin
    };
};
