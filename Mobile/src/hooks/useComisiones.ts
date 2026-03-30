import { useState, useEffect, useCallback } from 'react';
import { getComisiones, updateComisionConfig } from '../services/api';
import Toast from 'react-native-toast-message';
import { getPeriodRanges } from '../utils/date-helpers';

interface ComisionConfig {
    porcentajeBarbero: number;
    porcentajeDueno: number;
    cortesPorCiclo: number;
}

export const useComisiones = () => {
    const [loading, setLoading] = useState(true);
    const [periodo, setPeriodo] = useState<'hoy' | 'semana' | 'quincena' | 'mes'>('mes');
    const [data, setData] = useState<any>(null);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [form, setForm] = useState<any>({
        tipo: 'escalonado',
        porcentajeBarbero: '50',
        porcentajeDueno: '50',
        cortesPorCiclo: '5',
        escalonado: [
            { desde: 1, hasta: 4, porcentajeBarbero: 50, porcentajeDueno: 50 },
            { desde: 5, hasta: 8, porcentajeBarbero: 60, porcentajeDueno: 40 },
            { desde: 9, hasta: 99, porcentajeBarbero: 70, porcentajeDueno: 30 }
        ]
    });

    const cargarComisiones = useCallback(async (p?: string) => {
        setLoading(true);
        try {
            const activePeriod = p || periodo;
            const { inicio, fin } = getPeriodRanges(activePeriod as any);

            const res = await getComisiones({ 
                periodo: activePeriod,
                fechaInicio: inicio.toISOString(),
                fechaFin: fin.toISOString()
            });
            setData(res.data);
            if (res.data.config) {
                setForm({
                    tipo: res.data.config.tipo || 'fijo',
                    porcentajeBarbero: (res.data.config.fijo?.porcentajeBarbero || res.data.config.porcentajeBarbero || 50).toString(),
                    porcentajeDueno: (res.data.config.fijo?.porcentajeDueno || res.data.config.porcentajeDueno || 50).toString(),
                    cortesPorCiclo: (res.data.config.cortesPorCiclo || 5).toString(),
                    escalonado: res.data.config.escalonado || []
                });
            }
        } catch (err: any) {
            console.error(err);
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar las comisiones' });
        } finally {
            setLoading(false);
        }
    }, [periodo]);

    const handleUpdateConfig = async () => {
        const pb = parseInt(form.porcentajeBarbero);
        const pd = parseInt(form.porcentajeDueno);
        const cc = parseInt(form.cortesPorCiclo);

        if (isNaN(cc)) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Ingresa valores numéricos válidos' });
            return;
        }

        setIsSaving(true);
        try {
            await updateComisionConfig({
                tipo: 'escalonado',
                fijo: {
                    porcentajeBarbero: pb,
                    porcentajeDueno: pd
                },
                escalonado: form.escalonado,
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
    }, [periodo, cargarComisiones]);

    const changePeriodo = (p: any) => {
        setPeriodo(p);
    };

    return {
        data,
        loading,
        periodo,
        setPeriodo: changePeriodo,
        cargarComisiones,
        handleUpdateConfig,
        isSaving,
        showConfigModal,
        setShowConfigModal,
        form,
        setForm
    };
};
