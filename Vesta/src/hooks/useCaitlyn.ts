import { useState, useCallback } from 'react';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Variables fuera del hook para caché en RAM (Dura mientras la app no se cierre)
let cachedInsight: string | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 horas (Ajustado por Angel)

// Cache para consejos de productos (Mismo producto, misma configuración = instantáneo)
let productAdviceCache: Record<string, { message: string, reasoning: string | null, hash: string }> = {};

// Cache global para las alertas del Dashboard (Evita Rate Limit al navegar entre pestañas)
let dashboardAlertsCache: { hash: string, message: string } | null = null;

export const useCaitlyn = () => {
    const [loading, setLoading] = useState(false);
    const [advice, setAdvice] = useState<string | null>(cachedInsight); // PARA EL DASHBOARD
    const [productAdvice, setProductAdvice] = useState<string | null>(null); // PARA PRODUCTOS/RECETAS
    const [productReasoning, setProductReasoning] = useState<string | null>(null); // DETALLE DEL RAZONAMIENTO ESTRATEGICO
    const [error, setError] = useState<string | null>(null);

    // Insight Autom\u00e1tico del Dí (Con Cach\u00e9!)
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

    const getBusinessAdvice = async (productName: string, currentData?: any) => {
        // Generar hash simple para detectar cambios en los datos que ameriten re-análisis
        const currentHash = JSON.stringify({ productName, ...currentData });

        if (productAdviceCache[productName] && productAdviceCache[productName].hash === currentHash) {
            setProductAdvice(productAdviceCache[productName].message);
            setProductReasoning(productAdviceCache[productName].reasoning);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/agente/advice', { productName, currentData });
            if (response.data.success) {
                const message = response.data.message;
                const reasoning = response.data.caitlyn_reasoning || null;
                setProductAdvice(message);
                setProductReasoning(reasoning);

                // Guardar en caché
                productAdviceCache[productName] = { message, reasoning, hash: currentHash };
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
        // Generar hash de las alertas actuales
        const currentHash = JSON.stringify(alerts.map(a => a.id + a.margenActual));

        // 1. ¿Ya tenemos este análisis específico en la memoria global de RAM?
        if (dashboardAlertsCache && dashboardAlertsCache.hash === currentHash) {
            setProductAdvice(dashboardAlertsCache.message);
            return;
        }

        setLoading(true);
        setError(null);
        setProductAdvice(null);
        try {
            const response = await api.post('/agente/dashboard-alerts', { alerts });
            if (response.data.success) {
                const msg = response.data.message;
                setProductAdvice(msg);

                // Guardar en caché global
                dashboardAlertsCache = { hash: currentHash, message: msg };
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

    const [menuIdeas, setMenuIdeas] = useState<any[]>([]);
    const [menuSource, setMenuSource] = useState<string | null>(null);

    const generateMenuIdeas = async () => {
        setLoading(true);
        setError(null);
        setMenuIdeas([]);
        try {
            const response = await api.post('/agente/menu/ideas');
            if (response.data.success) {
                setMenuIdeas(response.data.ideas);
                setMenuSource(response.data.source || 'GEMINI_CHEF_AI');
            } else {
                setError(response.data.message || 'No se pudieron generar ideas de menú.');
            }
        } catch (err: any) {
            console.error('Error obteniendo ideas de menú de Caitlyn:', err);
            setError('Error de conexión con el Asistente.');
        } finally {
            setLoading(false);
        }
    };

    const learnInvoiceAlias = async (invoiceText: string, productId: string) => {
        try {
            await api.post('/agente/vision/learn-alias', {
                invoice_text: invoiceText,
                product_id: productId
            });
            return true;
        } catch (err) {
            console.error('Error enseñando alias a Caitlyn:', err);
            return false;
        }
    };

    const matchInvoiceProducts = async (extractedItems: any[], inventoryItems: any[]) => {
        setLoading(true);
        try {
            const response = await api.post('/agente/vision/match-products', {
                extracted_items: extractedItems,
                inventory_items: inventoryItems
            });
            return response.data.matches || [];
        } catch (err) {
            console.error('Error en match visual de productos:', err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    return {
        getDailyInsight,
        getBusinessAdvice,
        getDashboardAlertsAnalysis,
        generateMenuIdeas,
        learnInvoiceAlias,
        matchInvoiceProducts,
        advice,
        productAdvice,
        productReasoning,
        menuIdeas,
        menuSource,
        loading,
        error,
        setAdvice,
        setProductAdvice,
        setProductReasoning,
        setMenuIdeas
    };
};
