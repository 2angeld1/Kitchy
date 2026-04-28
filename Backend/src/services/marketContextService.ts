import MarketContext from '../models/MarketContext';
import dotenv from 'dotenv';
import { scrapeMarketVisual } from './brokers/marketScraperBroker';
import axios from 'axios';

dotenv.config();

const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const PANAMA_CITY_COORDS = { lat: 8.9833, lon: -79.5167 };

/**
 * 🌦️ CLIMA (A diario)
 */
export const updateWeatherContext = async () => {
    try {
        console.log('--- 🌦️ Consultando Pronóstico Semanal (OpenWeather) ---');
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${PANAMA_CITY_COORDS.lat}&lon=${PANAMA_CITY_COORDS.lon}&appid=${WEATHER_API_KEY}&units=metric&lang=es`);
        
        const dailyForecast: any[] = [];
        const seenDates = new Set();
        
        for (const item of response.data.list) {
            const date = item.dt_txt.split(' ')[0];
            if (!seenDates.has(date) && dailyForecast.length < 5) {
                seenDates.add(date);
                dailyForecast.push({
                    fecha: date,
                    temp: item.main.temp,
                    clima: item.weather[0].main,
                    descripcion: item.weather[0].description,
                    lluviaProb: item.pop * 100
                });
            }
        }

        await MarketContext.findOneAndUpdate(
            { tipo: 'WEATHER' },
            { data: { forecast: dailyForecast }, fecha: new Date(), region: 'PANAMA' },
            { upsert: true }
        );
        console.log('✅ Pronóstico de 5 días guardado.');
    } catch (error: any) {
        console.error('❌ Error clima:', error.message);
    }
};

/**
 * 🕵️‍♀️ CAITLYN EXPLORER (Sincronización de Mercado Autónoma)
 */
const syncMarketType = async (tipo: 'FUEL' | 'MERCA' | 'ACODECO') => {
    try {
        console.log(`--- 🔍 Caitlyn buscando datos de ${tipo} ---`);
        
        // Llamamos al modo explorador (la URL se ignora en el broker ahora)
        const result = await scrapeMarketVisual('', tipo);
        
        if (result.success) {
            console.log(`🧠 [CAITLYN AI] Resultado ${tipo}:`, JSON.stringify(result.data, null, 2));
            await MarketContext.findOneAndUpdate(
                { tipo },
                { 
                    data: result.data, 
                    fecha: new Date(), 
                    region: 'PANAMA' 
                },
                { upsert: true }
            );
            return true;
        }
        
        console.warn(`⚠️ Caitlyn no pudo encontrar datos frescos de ${tipo}.`);
        return false;
    } catch (error: any) {
        console.error(`❌ Error sincronizando ${tipo}:`, error.message);
        return false;
    }
};

export const updateFuelContext = () => syncMarketType('FUEL');
export const updateMarketPrices = () => syncMarketType('MERCA');
export const updateAcodecoContext = () => syncMarketType('ACODECO');

/**
 * 🏦 OBTENER RECUERDO (Helper para el Frontend)
 */
export const getRecuerdoCaitlyn = async (tipo: string) => {
    try {
        const lastEntry = await MarketContext.findOne({ tipo }).sort({ fecha: -1 });
        return lastEntry ? lastEntry.data : null;
    } catch (error) {
        return null;
    }
};
