import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { uploadImage } from '../utils/imageUpload';
import Gasto from '../models/Gasto';
import axios from 'axios';

/**
 * Controller para manejar las peticiones a Caitlyn (IA)
 * Flujo: Kitchy Backend → Caitlyn (analizar) → Frontend (revisar)
 */

const CAITLYN_URL = process.env.CAITLYN_URL || 'http://localhost:8000';

export const procesarFactura = async (req: AuthRequest, res: Response) => {
    try {
        const { imagen } = req.body;

        if (!imagen) {
            return res.status(400).json({ message: 'No se recibió ninguna imagen de factura' });
        }

        // 1. Enviar imagen a Caitlyn (microservicio) para análisis con Gemini
        console.log('🤖 Enviando factura a Caitlyn para análisis...');
        let productosDetectados: any[] = [];
        let caitlynError: string | null = null;

        try {
            const caitlynResponse = await axios.post(
                `${CAITLYN_URL}/agent/invoice`,
                { imagen },
                { timeout: 60000 } // 60 segundos por si Gemini tarda
            );

            if (caitlynResponse.data.success) {
                productosDetectados = caitlynResponse.data.productos;
                console.log(`✅ Caitlyn detectó ${productosDetectados.length} productos`);
            } else {
                caitlynError = caitlynResponse.data.error || 'Caitlyn no pudo procesar la factura';
                console.warn('⚠️ Caitlyn respondió sin éxito:', caitlynError);
                return res.status(400).json({ message: caitlynError }); // Fallar rapido si hay error
            }
        } catch (caitlynErr: any) {
            caitlynError = caitlynErr.message || 'No se pudo contactar a Caitlyn';
            console.warn('⚠️ Error contactando a Caitlyn:', caitlynError);
            return res.status(500).json({ message: 'Error de conexión con IA', error: caitlynError });
        }

        res.json({
            message: productosDetectados.length > 0
                ? `Caitlyn detectó ${productosDetectados.length} productos en tu factura`
                : 'Caitlyn no detectó productos válidos.',
            items: productosDetectados
        });

    } catch (error: any) {
        console.error('Error al procesar factura con Caitlyn:', error);
        res.status(500).json({ message: 'Error interno al procesar la factura', error: error.message });
    }
};
