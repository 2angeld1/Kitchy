import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { uploadImage } from '../utils/imageUpload';
import Producto from '../models/Producto';
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
                productosDetectados = caitlynResponse.data.productos || [];
                const fiscal = caitlynResponse.data.fiscal || {};
                const metadata = {
                    proveedor: fiscal.proveedor,
                    ruc: fiscal.ruc,
                    dv: fiscal.dv,
                    fecha: fiscal.fecha,
                    receptor: fiscal.receptor,
                    nroFactura: fiscal.nroFactura,
                    subtotal: fiscal.subtotal,
                    itbms: fiscal.itbms,
                    total: fiscal.total
                };
                console.log(`✅ Caitlyn detectó ${productosDetectados.length} productos y metadata de ${metadata.proveedor || 'proveedor desconocido'}`);
                
                return res.json({
                    message: productosDetectados.length > 0
                        ? `Caitlyn detectó ${productosDetectados.length} productos en tu factura`
                        : 'Caitlyn detectó la factura pero no productos específicos.',
                    items: productosDetectados,
                    metadata
                });
            } else {
                caitlynError = caitlynResponse.data.error || 'Caitlyn no pudo procesar la factura';
                console.warn('⚠️ Caitlyn respondió sin éxito:', caitlynError);
                return res.status(400).json({ message: caitlynError });
            }
        } catch (caitlynErr: any) {
            caitlynError = caitlynErr.message || 'No se pudo contactar a Caitlyn';
            console.warn('⚠️ Error contactando a Caitlyn:', caitlynError);
            return res.status(500).json({ message: 'Error de conexión con IA', error: caitlynError });
        }

    } catch (error: any) {
        console.error('Error al procesar factura con Caitlyn:', error);
        res.status(500).json({ message: 'Error interno al procesar la factura', error: error.message });
    }
};

/**
 * Endpoint para que Caitlyn consulte el costeo de un producto por nombre
 */
export const consultarCosteoPorNombre = async (req: AuthRequest, res: Response) => {
    try {
        const { nombre } = req.params;
        const negocioId = req.negocioId;

        // Buscar producto por nombre (regex para flexibilidad)
        const producto = await Producto.findOne({ 
            nombre: new RegExp(nombre, 'i'), 
            negocioId 
        }).populate('ingredientes.inventario');

        if (!producto) {
            return res.status(404).json({ message: 'No encontré ese producto en tu menú.' });
        }

        // Lógica de cálculo (reutilizando la del productoController)
        let costoTotal = 0;
        const desglose = [];

        if (producto.ingredientes && producto.ingredientes.length > 0) {
            for (const ing of producto.ingredientes) {
                const inv = ing.inventario as any;
                if (inv) {
                    const costoIngrediente = inv.costoUnitario * ing.cantidad;
                    costoTotal += costoIngrediente;
                    desglose.push({
                        insumo: inv.nombre,
                        cantidad: ing.cantidad,
                        unidad: inv.unidad,
                        subtotal: costoIngrediente
                    });
                }
            }
        }

        const margenActual = producto.precio > 0 ? ((producto.precio - costoTotal) / producto.precio) * 100 : 0;

        res.json({
            nombre: producto.nombre,
            precioActual: producto.precio,
            costoTotal: costoTotal.toFixed(2),
            margenActual: margenActual.toFixed(1) + '%',
            desglose,
            sugerencias: {
                ideal: (costoTotal / 0.35).toFixed(2), // 65% margen
                competitivo: (costoTotal / 0.40).toFixed(2) // 60% margen
            }
        });

    } catch (error: any) {
        console.error('Error en consulta de costeo para Caitlyn:', error);
        res.status(500).json({ message: 'Error al obtener costeo del producto', error: error.message });
    }
};
