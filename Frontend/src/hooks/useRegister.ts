import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const useRegister = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const history = useHistory();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
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
        try {
            await register(email, password, nombre);
            history.replace('/ventas');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al registrar');
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
