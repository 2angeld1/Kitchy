import { chromium } from 'playwright';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const CAITLYN_URL = process.env.CAITLYN_URL || 'http://localhost:8000';

export interface MarketScrapeResult {
    success: boolean;
    data?: any;
    error?: string;
}

/**
 * 🕵️‍♂️ Caitlyn Visual Scraper Broker
 * Entra a las webs, toma foto y le pregunta a la IA qué vió.
 */
export const scrapeMarketVisual = async (url: string, marketType: 'FUEL' | 'MERCA' | 'ACODECO'): Promise<MarketScrapeResult> => {
    // ⚡️ MODO AGENTE PURO (Angel: Solo búsqueda autónoma vía Gemini Search Grounding)
    console.log(`🕵️‍♂️ Caitlyn investigando ${marketType} en internet (Modo Agente)...`);
    
    try {
        const response = await axios.post(`${CAITLYN_URL}/agent/market/parse`, {
            tipo: marketType,
            imagen: null // No mandamos imagen, confiamos en el buscador de la IA
        }, { timeout: 60000 });

        if (response.data.success) {
            console.log(`✅ Caitlyn encontró los datos de ${marketType} exitosamente.`);
            return { success: true, data: response.data.data };
        }
    } catch (err: any) {
        console.error(`❌ Falla en la investigación de ${marketType}: ${err.message}`);
    }

    return { success: false, data: null, error: `No se pudo obtener información de ${marketType}` };
};

/* 
// 🎬 MODO EXPLORADOR (PLAYWRIGHT) - COMENTADO TEMPORALMENTE POR SI ACASO
// ... El código anterior se puede recuperar del historial ...
*/
