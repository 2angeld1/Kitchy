import { Router } from 'express';
import { auth } from '../middleware/auth';
import { procesarFactura, consultarCosteoPorNombre, obtenerConsejoNegocio, guardarGastoFactura, sugerirReceta, analizarAlertasDashboard, sugerirMenuIdeas, aprenderAliasVisual, buscarMatchesVisuales } from '../controllers/agenteController';

const router = Router();

// Todas las rutas requieren autenticaci\u00f3n
router.use(auth);

/**
 * @route POST /api/agente/factura
 * @desc Sube una foto de factura para que Caitlyn la analice
 */
router.post('/factura', procesarFactura);
router.post('/advice', obtenerConsejoNegocio);
router.post('/dashboard-alerts', analizarAlertasDashboard);
router.post('/invoice', procesarFactura);
router.post('/invoice/confirm', guardarGastoFactura);
router.post('/recipe/suggest', sugerirReceta);
router.post('/menu/ideas', sugerirMenuIdeas);
router.post('/vision/learn-alias', aprenderAliasVisual);
router.post('/vision/match-products', buscarMatchesVisuales);

// --- Presupuestario ---
router.post('/shopping/parse', require('../controllers/agenteController').parseShoppingList);
router.post('/shopping/learn-price', require('../controllers/agenteController').aprenderPrecio);

export default router;
