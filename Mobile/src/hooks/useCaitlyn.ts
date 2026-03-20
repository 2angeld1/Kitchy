import { useState } from 'react';
import api from '../services/api'; // Usamos el servicio de la API de Node (Puerto 5000)
import { CAITLYN_URL } from '../config/api'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useCaitlyn = () => {
    const [loading, setLoading] = useState(false);
    const [advice, setAdvice] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Insight Automático del Día (Sin botones!)
    const getDailyInsight = async () => {
        setLoading(true);
        setError(null);
        try {
            // Llamamos a nuestro nuevo Broker en el Backend de Node (5000)
            const response = await api.post('/agente/advice', {});
            
            if (response.data.success) {
                setAdvice(response.data.message);
            }
        } catch (err: any) {
            console.error('Error al obtener insight automático:', err);
            // Si falla, no mostramos error al usuario para no interrumpir, 
            // simplemente Caitlyn se queda callada en el dashboard.
        } finally {
            setLoading(false);
        }
    };

    const getBusinessAdvice = async (productName: string) => {
        setLoading(true);
        setError(null);
        setAdvice(null);

        try {
            // Redirigimos la llamada al Broker (Backend Node 5000)
            const response = await api.post('/agente/advice', { productName });

            if (response.data.success) {
                setAdvice(response.data.message);
            } else {
                setError(response.data.message || 'Caitlyn no pudo analizar este producto.');
            }
        } catch (err: any) {
            console.error('Error consultando a Caitlyn Broker:', err);
            setError('No se pudo conectar con el cerebro de Caitlyn.');
        } finally {
            setLoading(false);
        }
    };

    const getDashboardAlertsAnalysis = async (alerts: any[]) => {
        setLoading(true);
        setError(null);
        setAdvice(null);

        try {
            // Este sigue yendo directo a la IA por ahora o podemos unificarlo luego
            const response = await api.post('/agente/dashboard-alerts', { alerts });

            if (response.data.success) {
                setAdvice(response.data.message);
            } else {
                setError(response.data.message || 'Caitlyn no pudo analizar las alertas.');
            }
        } catch (err: any) {
            console.error('Error enviando alertas a Caitlyn:', err);
            setError('Caitlyn está teniendo dificultades técnicas.');
        } finally {
            setLoading(false);
        }
    };

    return {
        getDailyInsight,
        getBusinessAdvice,
        getDashboardAlertsAnalysis,
        advice,
        loading,
        error,
        setAdvice
    };
};
