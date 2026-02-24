import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';

export const useRegister = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();

    const handleRegister = async () => {
        if (!nombre || !email || !password) {
            setError('Por favor completa todos los campos');
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await register(email, password, nombre);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al registrar';
            setError(errorMsg);
            Alert.alert('Error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return {
        nombre,
        setNombre,
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        loading,
        error,
        setError,
        handleRegister
    };
};
