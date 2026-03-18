import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { getUsers, updateUserRole, deleteUser, createUser } from '../services/api';

export interface User {
    _id: string;
    email: string;
    nombre: string;
    rol: 'admin' | 'usuario';
    activo: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export const useUsuarios = () => {
    const [usuarios, setUsuarios] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const cargarUsuarios = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const response = await getUsers();
            setUsuarios(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar usuarios');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        cargarUsuarios();
    }, [cargarUsuarios]);

    const handleRefresh = async () => {
        await cargarUsuarios(true);
    };

    const handleChangeRole = async (id: string, nuevoRol: string) => {
        setLoading(true);
        try {
            const response = await updateUserRole(id, { rol: nuevoRol });
            setUsuarios(prev => prev.map(u => u._id === id ? response.data : u));
            setSuccess('Rol actualizado correctamente');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al actualizar rol');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (data: any) => {
        setLoading(true);
        try {
            const response = await createUser(data);
            setUsuarios(prev => [...prev, response.data]);
            setSuccess('Usuario creado correctamente');
            return true;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear usuario');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = (id: string) => {
        Alert.alert(
            "Eliminar Usuario",
            "¿Estás seguro? Esta acción no se puede deshacer.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await deleteUser(id);
                            setSuccess('Usuario eliminado');
                            setUsuarios(prev => prev.filter(u => u._id !== id));
                        } catch (err: any) {
                            setError(err.response?.data?.message || 'Error al eliminar usuario');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const clearError = () => setError('');
    const clearSuccess = () => setSuccess('');

    const [isSubmittingNegocio, setIsSubmittingNegocio] = useState(false);

    const handleCreateNegocio = async (data: { nombre: string, categoria: 'COMIDA' | 'BELLEZA' }) => {
        setIsSubmittingNegocio(true);
        try {
            const { createNegocio } = await import('../services/api');
            const res = await createNegocio(data);
            setSuccess('Negocio creado correctamente');
            return res.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear negocio');
            return null;
        } finally {
            setIsSubmittingNegocio(false);
        }
    };

    const getRoleInfo = (rol: string) => {
        switch (rol) {
            case 'admin': return { label: 'Administrador', color: '#3b82f6', icon: 'options' };
            default: return { label: 'Cajero/Mesero', color: '#10b981', icon: 'person' };
        }
    };

    return {
        usuarios,
        loading,
        refreshing,
        isSubmittingNegocio,
        error, clearError,
        success, clearSuccess,
        handleRefresh,
        handleChangeRole,
        handleDeleteUser,
        handleCreateUser,
        handleCreateNegocio,
        getRoleInfo
    };
};
