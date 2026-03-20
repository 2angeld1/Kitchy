import { useState, useCallback } from 'react';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Variables fuera del hook para caché en RAM (Dura mientras la app no se cierre)
let cachedInsight: string | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 horas (Ajustado por Angel)

export const useCaitlyn = () => {
    const [loading, setLoading] = useState(false);
    const [advice, setAdvice] = useState<string | null>(cachedInsight); // PARA EL DASHBOARD
    const [productAdvice, setProductAdvice] = useState<string | null>(null); // PARA PRODUCTOS/RECETAS
    const [error, setError] = useState<string | null>(null);

    // Insight Autom\u00e1tico del D\u00eda (Con Cach\u00e9!)
    const getDailyInsight = useCallback(async (force = false) => {
        const now = Date.now();
        
        // 1. Si tenemos caché en RAM y no ha pasado el tiempo, usarlo
        if (!force && cachedInsight && (now - lastFetchTime < CACHE_DURATION)) {
            setAdvice(cachedInsight);
            return;
        }

        // 2. Intentar recuperar de disco (AsyncStorage) antes de ir a Internet
        if (!force && !cachedInsight) {
            try {
                const stored = await AsyncStorage.getItem('caitlyn_insight');
                const storedTime = await AsyncStorage.getItem('caitlyn_insight_time');
                if (stored && storedTime && (now - Number(storedTime) < CACHE_DURATION)) {
                    cachedInsight = stored;
                    lastFetchTime = Number(storedTime);
                    setAdvice(stored);
                    return;
                }
            } catch (err) {
                console.error('Error leyendo caché de Caitlyn:', err);
            }
        }

        // 3. Si no hay caché o queremos forzar, consultar a la central (IA)
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/agente/advice', {});
            
            if (response.data.success) {
                const message = response.data.message;
                setAdvice(message);
                
                // Actualizar caché en RAM y Disco
                cachedInsight = message;
                lastFetchTime = now;
                await AsyncStorage.setItem('caitlyn_insight', message);
                await AsyncStorage.setItem('caitlyn_insight_time', now.toString());
            }
        } catch (err: any) {
            console.error('Error al obtener insight automático:', err);
        } finally {
            setLoading(false);
        }
    }, [advice]);

    const getBusinessAdvice = async (productName: string) => {
        setLoading(true);
        setError(null);
        setProductAdvice(null);
        try {
            const response = await api.post('/agente/advice', { productName });
            if (response.data.success) {
                setProductAdvice(response.data.message);
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
        setProductAdvice(null);
        try {
            const response = await api.post('/agente/dashboard-alerts', { alerts });
            if (response.data.success) {
                setProductAdvice(response.data.message);
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
        productAdvice,
        loading,
        error,
        setAdvice,
        setProductAdvice
    };
};
