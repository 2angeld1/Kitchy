import { useState, useEffect, useCallback } from 'react';
import { getEspecialistas, createEspecialista, deleteEspecialista } from '../services/api';
import Toast from 'react-native-toast-message';

export const useEspecialistas = () => {
    const [especialistas, setEspecialistas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState('');

    const cargar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getEspecialistas();
            setEspecialistas(res.data);
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar los especialistas' });
        } finally {
            setLoading(false);
        }
    }, []);

    const handleCrear = async () => {
        if (!nuevoNombre.trim()) {
            Toast.show({ type: 'info', text1: 'Atención', text2: 'El nombre es obligatorio' });
            return;
        }
        setLoading(true);
        try {
            await createEspecialista({ nombre: nuevoNombre });
            Toast.show({ type: 'success', text1: 'Éxito', text2: 'Especialista añadido' });
            setShowCreateModal(false);
            setNuevoNombre('');
            cargar();
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo crear el especialista' });
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (id: string) => {
        try {
            await deleteEspecialista(id);
            Toast.show({ type: 'success', text1: 'Eliminado', text2: 'Especialista dado de baja' });
            cargar();
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar el especialista' });
        }
    };

    useEffect(() => {
        cargar();
    }, [cargar]);

    return {
        especialistas,
        loading,
        showCreateModal,
        setShowCreateModal,
        nuevoNombre,
        setNuevoNombre,
        cargar,
        handleCrear,
        handleEliminar
    };
};
