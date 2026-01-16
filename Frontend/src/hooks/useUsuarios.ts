import { useState, useEffect } from 'react';
import { getUsers, updateUserRole, deleteUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export interface Usuario {
    _id: string;
    email: string;
    nombre: string;
    rol: string;
    activo?: boolean;
    createdAt?: string;
}

export const useUsuarios = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const { user: currentUser } = useAuth();

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        setLoading(true);
        try {
            const response = await getUsers();
            setUsuarios(response.data);
        } catch (err) {
            setError('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async (event: CustomEvent) => {
        await cargarUsuarios();
        event.detail.complete();
    };

    const handleChangeRole = async (userId: string, newRole: string) => {
        setLoading(true);
        try {
            await updateUserRole(userId, newRole);
            setSuccess('Rol actualizado');
            cargarUsuarios();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al actualizar rol');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (id === currentUser?.id) {
            setError('No puedes eliminarte a ti mismo');
            return;
        }

        setLoading(true);
        try {
            await deleteUser(id);
            setSuccess('Usuario eliminado');
            cargarUsuarios();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al eliminar');
        } finally {
            setLoading(false);
        }
    };

    const usuariosFiltrados = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase())
    );

    const clearError = () => setError('');
    const clearSuccess = () => setSuccess('');

    return {
        usuarios,
        loading,
        error, clearError,
        success, clearSuccess,
        busqueda, setBusqueda,
        handleRefresh,
        handleChangeRole,
        handleDelete,
        usuariosFiltrados,
        currentUser
    };
};
