import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
    procesarFactura,
    consultarCosteoPorNombre,
    obtenerConsejoNegocio,
    guardarGastoFactura,
    sugerirReceta,
    analizarAlertasDashboard
} from '../controllers/agenteController';

const router = Router();

// Todas las rutas requieren autenticaci\u00f3n
router.use(auth);

/**
 * @route POST /api/agente/factura
 * @desc Sube una foto de factura para que Caitlyn la analice
 */
router.post('/factura', procesarFactura);
router.post('/advice', auth, obtenerConsejoNegocio);
router.post('/dashboard-alerts', auth, analizarAlertasDashboard);
router.post('/invoice', auth, procesarFactura);
router.post('/invoice/confirm', auth, guardarGastoFactura);
router.post('/recipe/suggest', auth, sugerirReceta);

export default router;
