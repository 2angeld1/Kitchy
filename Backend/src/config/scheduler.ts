import cron from 'node-cron';
import { updateWeatherContext, updateFuelContext, updateMarketPrices } from '../services/marketContextService';

export const initScheduler = () => {
    console.log('--- 🚀 Inicializando Cron Jobs del Radar Kitchy ---');

    // Clima: Todos los días a las 6 AM (Caitlyn mira al cielo)
    cron.schedule('0 6 * * *', async () => {
        console.log('[Scheduler] Hora de revisar el clima...');
        await updateWeatherContext();
    });

    // Merca / ACODECO: Todos los lunes a las 6:30 AM
    cron.schedule('30 6 * * 1', async () => {
        console.log('[Scheduler] Revisando precios de mercado semanal...');
        await updateMarketPrices();
    });

    // Gasolina: Los días 1 y 15 de cada mes (Quincena panameña) a las 7:00 AM
    cron.schedule('0 7 1,15 * *', async () => {
        console.log('[Scheduler] Revisando tabla de combustible SNE...');
        await updateFuelContext();
    });

    // EJECUCIÓN INICIAL: Corremos una vez al arrancar el servidor para poblar datos iniciales
    console.log('[Scheduler] Poblando datos iniciales del mercado de Panamá...');
    runInitialSync();
};

const runInitialSync = async () => {
    try {
        await Promise.allSettled([
            updateWeatherContext(),
            updateMarketPrices(),
            updateFuelContext()
        ]);
        console.log('✅ Sincronización inicial completada con éxito.');
    } catch (error) {
        console.error('❌ Error en sincronización inicial:', error);
    }
};
