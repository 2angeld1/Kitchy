import { Router } from 'express';
import { auth } from '../middleware/auth';
import { procesarFactura } from '../controllers/agenteController';

const router = Router();

// Todas las rutas requieren autenticación
router.use(auth);

/**
 * @route POST /api/agente/factura
 * @desc Sube una foto de factura para que Caitlyn la analice
 */
router.post('/factura', procesarFactura);

export default router;
