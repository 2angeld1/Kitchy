import { useState, useEffect, useCallback } from 'react';
import { getComisiones, updateComisionConfig } from '../services/api';
import Toast from 'react-native-toast-message';

interface ComisionConfig {
    porcentajeBarbero: number;
    porcentajeDueno: number;
    cortesPorCiclo: number;
}

export const useComisiones = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [form, setForm] = useState({
        porcentajeBarbero: '50',
        porcentajeDueno: '50',
        cortesPorCiclo: '5'
    });

    const cargarComisiones = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getComisiones();
            setData(res.data);
            if (res.data.config) {
                setForm({
                    porcentajeBarbero: res.data.config.porcentajeBarbero.toString(),
                    porcentajeDueno: res.data.config.porcentajeDueno.toString(),
                    cortesPorCiclo: res.data.config.cortesPorCiclo.toString(),
                });
            }
        } catch (err: any) {
            console.error(err);
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar las comisiones' });
        } finally {
            setLoading(false);
        }
    }, []);

    const handleUpdateConfig = async () => {
        const pb = parseInt(form.porcentajeBarbero);
        const pd = parseInt(form.porcentajeDueno);
        const cc = parseInt(form.cortesPorCiclo);

        if (isNaN(pb) || isNaN(pd) || isNaN(cc)) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Ingresa valores numéricos válidos' });
            return;
        }

        if (pb + pd !== 100) {
            Toast.show({ type: 'error', text1: 'Atención', text2: 'La suma de porcentajes debe ser 100%' });
            return;
        }

        setIsSaving(true);
        try {
            await updateComisionConfig({
                porcentajeBarbero: pb,
                porcentajeDueno: pd,
                cortesPorCiclo: cc
            });
            Toast.show({ type: 'success', text1: 'Éxito', text2: 'Configuración actualizada' });
            setShowConfigModal(false);
            cargarComisiones();
        } catch (err: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo actualizar la configuración' });
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        cargarComisiones();
    }, [cargarComisiones]);

    return {
        loading,
        data,
        showConfigModal,
        setShowConfigModal,
        isSaving,
        form,
        setForm,
        cargarComisiones,
        handleUpdateConfig
    };
};
