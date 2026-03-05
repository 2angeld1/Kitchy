import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { uploadImage } from '../utils/imageUpload';
import Gasto from '../models/Gasto';
import axios from 'axios';

/**
 * Controller para manejar las peticiones a Caitlyn (IA)
 * Flujo: Kitchy Backend → Cloudinary (guardar) → Caitlyn (analizar) → Frontend (revisar)
 */

const CAITLYN_URL = process.env.CAITLYN_URL || 'http://localhost:8000';

export const procesarFactura = async (req: AuthRequest, res: Response) => {
    try {
        const { imagen } = req.body;
        const userId = req.userId;
        const negocioId = req.negocioId;

        if (!imagen) {
            return res.status(400).json({ message: 'No se recibió ninguna imagen de factura' });
        }

        // 1. Guardar en Cloudinary (Histórico)
        console.log('📸 Subiendo factura a Cloudinary...');
        const imageUrl = await uploadImage(imagen, 'facturas_caitlyn');

        // 2. Crear un registro en Gastos como histórico
        const nuevoGasto = new Gasto({
            descripcion: 'Factura procesada por Caitlyn',
            categoria: 'otro',
            monto: 0,
            fecha: new Date(),
            comprobante: imageUrl,
            usuario: userId,
            negocioId: negocioId
        });
        await nuevoGasto.save();

        // 3. Enviar imagen a Caitlyn (microservicio) para análisis con Gemini
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
            }
        } catch (caitlynErr: any) {
            caitlynError = caitlynErr.message || 'No se pudo contactar a Caitlyn';
            console.warn('⚠️ Error contactando a Caitlyn:', caitlynError);
        }

        // 4. Actualizar monto del gasto si Caitlyn detectó productos
        if (productosDetectados.length > 0) {
            const montoTotal = productosDetectados.reduce((sum: number, p: any) => {
                return sum + ((p.precioUnitario || 0) * (p.cantidad || 1));
            }, 0);

            nuevoGasto.monto = montoTotal;
            nuevoGasto.descripcion = `Factura: ${productosDetectados.length} productos detectados por Caitlyn`;
            await nuevoGasto.save();
        }

        res.json({
            message: productosDetectados.length > 0
                ? `Caitlyn detectó ${productosDetectados.length} productos en tu factura`
                : 'Factura guardada. Caitlyn no pudo detectar productos automáticamente.',
            imageUrl,
            gastoId: nuevoGasto._id,
            items: productosDetectados,
            caitlynError
        });

    } catch (error: any) {
        console.error('Error al procesar factura con Caitlyn:', error);
        res.status(500).json({ message: 'Error interno al procesar la factura', error: error.message });
    }
};
