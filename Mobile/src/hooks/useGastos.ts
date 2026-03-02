import { useState, useCallback } from 'react';
import { createGasto, getGastos, deleteGasto } from '../services/api';

export interface GastoItem {
    _id: string;
    descripcion: string;
    monto: number;
    categoria: string;
    fecha: string;
}

export const useGastos = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const registrarGasto = async (data: {
        descripcion: string;
        monto: number;
        categoria: string;
        fecha?: string;
    }) => {
        setLoading(true);
        setError('');
        try {
            const res = await createGasto(data);
            setSuccess('Gasto registrado');
            return res.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al registrar gasto');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const clearStatus = () => {
        setError('');
        setSuccess('');
    };

    return {
        loading,
        error,
        success,
        registrarGasto,
        clearStatus
    };
};
