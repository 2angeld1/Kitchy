import { useState } from 'react';
import axios from 'axios';
import { CAITLYN_URL } from '../config/api'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useCaitlyn = () => {
    const [loading, setLoading] = useState(false);
    const [advice, setAdvice] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getBusinessAdvice = async (productName: string) => {
        setLoading(true);
        setError(null);
        setAdvice(null);

        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${CAITLYN_URL}/agent/business/advice`, {
                params: { product_name: productName },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setAdvice(response.data.message);
            } else {
                setError(response.data.message || 'Caitlyn no pudo analizar este producto.');
            }
        } catch (err: any) {
            if (err.message === 'Network Error') {
                setError('Caitlyn está fuera de línea temporalmente. (Servicio no disponible)');
            } else {
                console.error('Error consultando a Caitlyn:', err);
                setError('No se pudo conectar con el cerebro de Caitlyn.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getDashboardAlertsAnalysis = async (alerts: any[]) => {
        setLoading(true);
        setError(null);
        setAdvice(null);

        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.post(`${CAITLYN_URL}/agent/business/dashboard-alerts`, 
                { alerts }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setAdvice(response.data.message);
            } else {
                setError(response.data.message || 'Caitlyn no pudo analizar las alertas.');
            }
        } catch (err: any) {
            if (err.message === 'Network Error') {
                setError('IA no disponible en este momento. Caitlyn está en un descanso.');
            } else {
                console.error('Error enviando alertas a Caitlyn:', err);
                setError('Caitlyn está teniendo dificultades técnicas.');
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        getBusinessAdvice,
        getDashboardAlertsAnalysis,
        advice,
        loading,
        error,
        setAdvice
    };
};
