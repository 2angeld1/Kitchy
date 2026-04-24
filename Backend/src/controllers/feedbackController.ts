import { Request, Response } from 'express';
import Feedback from '../models/Feedback';
import Venta from '../models/Venta';
import { getFeedbackPage } from '../templates/web/feedbackPage';
import { AuthRequest } from '../middleware/auth';
import { emitToBusiness } from '../config/socket';

/**
 * Renderiza la página de captura de feedback (HTML Público)
 */
export const renderFeedbackPage = async (req: Request, res: Response) => {
    try {
        const { ventaId } = req.params;
        const { stars } = req.query;

        const venta = await Venta.findById(ventaId).populate('negocioId');
        if (!venta) {
            return res.status(404).send('Enlace no válido o expirado.');
        }

        const negocio: any = venta.negocioId;
        const html = getFeedbackPage(ventaId, negocio, stars);

        res.send(html);
    } catch (error: any) {
        res.status(500).send('Error al cargar la página de feedback.');
    }
};

/**
 * Recibe y guarda el feedback enviado por el cliente
 */
export const submitFeedback = async (req: Request, res: Response) => {
    try {
        const { ventaId, negocioId, puntuacion, comentario, sugerencias } = req.body;

        const feedback = new Feedback({
            ventaId,
            negocioId,
            puntuacion,
            comentario,
            sugerencias
        });

        await feedback.save();

        // Notificar al dashboard que hay nuevo feedback
        emitToBusiness(negocioId, 'dashboard_update', { tipo: 'NUEVO_FEEDBACK', puntuacion });

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ message: 'Error al guardar feedback', error: error.message });
    }
};

/**
 * Obtiene todos los feedbacks de un negocio para el App
 */
export const getFeedbacks = async (req: AuthRequest, res: Response) => {
    try {
        const negocioId = req.negocioId;
        const feedbacks = await Feedback.find({ negocioId })
            .populate('ventaId', 'cliente createdAt')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(feedbacks);
    } catch (error: any) {
        res.status(500).json({ message: 'Error al obtener feedbacks', error: error.message });
    }
};
