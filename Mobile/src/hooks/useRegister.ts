import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

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
            await register(email, password, nombre);
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
