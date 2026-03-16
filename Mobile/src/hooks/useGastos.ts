import { useState, useCallback } from 'react';
import { createGasto, getGastos, deleteGasto, exportGastosCsv } from '../services/api';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';

export interface GastoItem {
    _id: string;
    descripcion: string;
    monto: number;
    subtotal?: number;
    itbms?: number;
    categoria: string;
    fecha: string;
    proveedor?: string;
    ruc?: string;
    dv?: string;
    nroFactura?: string;
    comprobante?: string;
}

export const useGastos = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [gastos, setGastos] = useState<GastoItem[]>([]);

    const cargarGastos = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getGastos();
            setGastos(res.data);
        } catch (err: any) {
            setError('Error al cargar gastos');
        } finally {
            setLoading(false);
        }
    }, []);

    const registrarGasto = useCallback(async (data: any) => {
        setLoading(true);
        setError('');
        try {
            const res = await createGasto(data);
            setSuccess('Gasto registrado');
            cargarGastos();
            return res.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al registrar gasto');
            return null;
        } finally {
            setLoading(false);
        }
    }, [cargarGastos]);

    const eliminarGastoItem = useCallback(async (id: string) => {
        try {
            await deleteGasto(id);
            setSuccess('Gasto eliminado');
            cargarGastos();
        } catch (err: any) {
            setError('No se pudo eliminar el gasto');
        }
    }, [cargarGastos]);

    const exportarReporte = async (fechaDesde?: string, fechaHasta?: string) => {
        try {
            Toast.show({ 
                type: 'info', 
                text1: 'Generando Reporte', 
                text2: 'Preparando el archivo para el contador...' 
            });
            
            const params: any = {};
            if (fechaDesde) params.fechaDesde = fechaDesde;
            if (fechaHasta) params.fechaHasta = fechaHasta;
            
            const response = await exportGastosCsv(params);
            
            if (Platform.OS === 'web') {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Kitchy_Facturas_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            } else {
                Toast.show({ 
                    type: 'success', 
                    text1: '¡Reporte Listo!', 
                    text2: 'El CSV se ha generado correctamente.' 
                });
            }
        } catch (err: any) {
            console.error('Error exportando reporte:', err);
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo generar el reporte' });
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
        gastos,
        cargarGastos,
        registrarGasto,
        eliminarGastoItem,
        exportarReporte,
        clearStatus
    };
};
