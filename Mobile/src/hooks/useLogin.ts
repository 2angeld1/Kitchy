import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';

export const useLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Por favor completa todos los campos');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await login(email, password);
            // La navegación aquí se delega usualmente a un AuthNavigator basado en 'isAuthenticated'.
            // Pero por defecto el state de logueo cambiara el App.tsx a Dashboard.
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al iniciar sesión';
            setError(errorMsg);
            Alert.alert('Error', errorMsg); // Pop un nativo
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
