import { useState, useEffect, useCallback } from 'react';
import { getEspecialistas, createEspecialista, deleteEspecialista, updateEspecialista } from '../services/api';
import Toast from 'react-native-toast-message';

export const useEspecialistas = () => {
    const [especialistas, setEspecialistas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Create/Edit State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    
    const [form, setForm] = useState<{
        nombre: string;
        comision: string;
        tipoComision: 'fijo' | 'escalonado' | null;
        turnoActual: 'mañana' | 'tarde' | 'ambos';
    }>({
        nombre: '',
        comision: '50',
        tipoComision: null, // null = hereda del local
        turnoActual: 'ambos'
    });

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

    const resetForm = () => {
        setForm({ nombre: '', comision: '50', tipoComision: null, turnoActual: 'ambos' });
        setSelectedId(null);
        setIsEditing(false);
    };

    const handleAbrirCrear = () => {
        resetForm();
        setIsEditing(false);
        setShowModal(true);
    };

    const handleAbrirEditar = (esp: any) => {
        setForm({
            nombre: esp.nombre,
            comision: (esp.comision || 50).toString(),
            tipoComision: esp.tipoComision || null,
            turnoActual: esp.turnoActual || 'ambos'
        });
        setSelectedId(esp._id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleGuardar = async () => {
        if (!form.nombre.trim()) {
            Toast.show({ type: 'info', text1: 'Atención', text2: 'El nombre es obligatorio' });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                nombre: form.nombre,
                comision: parseInt(form.comision),
                tipoComision: form.tipoComision || undefined,
                turnoActual: form.turnoActual
            };

            if (isEditing && selectedId) {
                await updateEspecialista(selectedId, payload);
                Toast.show({ type: 'success', text1: 'Éxito', text2: 'Especialista actualizado' });
            } else {
                await createEspecialista(payload);
                Toast.show({ type: 'success', text1: 'Éxito', text2: 'Especialista añadido' });
            }

            setShowModal(false);
            resetForm();
            cargar();
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar el especialista' });
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
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar the especialista' });
        }
    };

    useEffect(() => {
        cargar();
    }, [cargar]);

    return {
        especialistas,
        loading,
        showModal,
        setShowModal,
        isEditing,
        form,
        setForm,
        handleAbrirCrear,
        handleAbrirEditar,
        handleGuardar,
        handleEliminar,
        cargar
    };
};
