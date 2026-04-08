import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
    procesarFacturaService,
    obtenerConsejoNegocioService,
    consultarCosteoPorNombreService,
    guardarGastoFacturaService,
    sugerirRecetaService,
    analizarAlertasDashboardService,
    sugerirMenuIdeasService,
    aprenderAliasVisualService,
    buscarMatchesVisualesService,
    parseShoppingListService,
    aprenderPrecioService,
    procesarCuadernoVentasService
} from '../services/caitlynBrokerService';

export const procesarFactura = async (req: AuthRequest, res: Response) => {
    try {
        const { imagen } = req.body;
        if (!imagen) {
            return res.status(400).json({ message: 'No se recibió ninguna imagen de factura' });
        }

        const result = await procesarFacturaService(imagen, req.negocioId as string);
        res.json(result);
    } catch (error: any) {
        console.error('Error al procesar factura con Caitlyn:', error);
        res.status(500).json({ message: 'Error interno al procesar la factura', error: error.message });
    }
};

export const obtenerConsejoNegocio = async (req: AuthRequest, res: Response) => {
    try {
        const { productName, currentData } = req.body;
        const result = await obtenerConsejoNegocioService(
            productName, 
            currentData, 
            req.negocioId as string, 
            req.userId as string, 
            (req as any).userRole || 'GASTRONOMIA'
        );
        res.json(result);
    } catch (error: any) {
        console.error('❌ Error GLOBAL en broker de Caitlyn Node:', error);
        res.status(500).json({ success: false, message: 'Falla total en el enlace con inteligencia artificial.', details: error.message });
    }
};

export const consultarCosteoPorNombre = async (req: AuthRequest, res: Response) => {
    try {
        const { nombre } = req.params;
        const result = await consultarCosteoPorNombreService(nombre, req.negocioId as string);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: 'Error de costeo', details: error.message });
    }
};

export const guardarGastoFactura = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.negocioId) return res.status(403).json({ message: 'No tienes negocio activo' });
        
        const result = await guardarGastoFacturaService(req.body, req.negocioId as string, req.userId as string);
        res.status(201).json(result);
    } catch (error: any) {
        console.error('Error al guardar gasto e inventario de factura:', error);
        res.status(500).json({ message: 'Error al procesar la confirmación', error: error.message });
    }
};

export const sugerirReceta = async (req: AuthRequest, res: Response) => {
    try {
        const { nombrePlato, servingSize, categoria } = req.body;
        if (!nombrePlato) return res.status(400).json({ message: 'Falta el nombre del plato' });

        const result = await sugerirRecetaService(nombrePlato, servingSize, categoria, req.negocioId as string);
        res.json(result);
    } catch (error: any) {
        console.error('Error sugiriendo receta con Caitlyn:', error);
        res.status(500).json({ message: 'Error de conexión con el Chef Caitlyn' });
    }
};

export const analizarAlertasDashboard = async (req: AuthRequest, res: Response) => {
    try {
        const { alerts } = req.body;
        if (!alerts || !Array.isArray(alerts)) {
            return res.status(400).json({ success: false, message: 'No se enviaron alertas válidas.' });
        }

        const result = await analizarAlertasDashboardService(alerts, req.negocioId as string, req.userId as string);
        res.json(result);
    } catch (error: any) {
        console.error('❌ Error en broker de alertas Caitlyn:', error.message);
        res.status(500).json({ success: false, message: 'Caitlyn no pudo procesar el resumen de alertas hoy.' });
    }
};

export const sugerirMenuIdeas = async (req: AuthRequest, res: Response) => {
    try {
        const negocioId = (req as any).negocioId || req.query.negocioId;
        if (!negocioId) return res.status(400).json({ message: 'Negocio ID requerido' });

        const result = await sugerirMenuIdeasService(negocioId as string, req.userId as string);
        res.json(result);
    } catch (error: any) {
        console.error('❌ Error pidiendo ideas de menú a Caitlyn:', error.message);
        res.status(500).json({ success: false, message: 'No se pudo conectar con Caitlyn para las ideas de menú.' });
    }
};

export const aprenderAliasVisual = async (req: AuthRequest, res: Response) => {
    try {
        const { invoice_text, product_id } = req.body;
        if (!invoice_text || !product_id) return res.status(400).json({ success: false, message: 'Faltan datos' });

        const result = await aprenderAliasVisualService(invoice_text, product_id, req.negocioId as string);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error de aprendizaje visual' });
    }
};

export const buscarMatchesVisuales = async (req: AuthRequest, res: Response) => {
    try {
        const { extracted_items } = req.body;
        if (!extracted_items || !Array.isArray(extracted_items)) {
            return res.status(400).json({ success: false, message: 'Datos de factura inválidos' });
        }

        const result = await buscarMatchesVisualesService(extracted_items, req.negocioId as string);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error cruzando productos con inventario' });
    }
};

export const parseShoppingList = async (req: AuthRequest, res: Response) => {
    try {
        const { text, image } = req.body;
        const result = await parseShoppingListService(text, image);
        res.json(result);
    } catch (error: any) {
        console.error('❌ Error pidiendo presupuesto a Caitlyn:', error.message);
        res.status(500).json({ success: false, message: 'Caitlyn no pudo parsear el presupuesto hoy.' });
    }
};

export const aprenderPrecio = async (req: AuthRequest, res: Response) => {
    try {
        const { item_name, price } = req.body;
        const result = await aprenderPrecioService(item_name, price, req.negocioId as string);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error en aprendizaje de precio' });
    }
};

export const procesarCuadernoVentas = async (req: AuthRequest, res: Response) => {
    try {
        const { imagen } = req.body;
        if (!imagen) {
            return res.status(400).json({ message: 'No se recibió ninguna imagen de cuaderno' });
        }

        const result = await procesarCuadernoVentasService(imagen);
        res.json(result);
    } catch (error: any) {
        console.error('❌ Error contactando a Caitlyn (Notebook):', error.message);
        res.status(500).json({ 
            success: false, 
            message: error.message.includes('timeout') 
                ? 'Caitlyn tardó demasiado. Intenta con una imagen más pequeña.'
                : 'Caitlyn no pudo procesar el cuaderno en este momento.' 
        });
    }
};
