import { Router } from 'express';
import { auth } from '../middleware/auth';
import { procesarFactura, consultarCosteoPorNombre, obtenerConsejoNegocio, guardarGastoFactura, sugerirReceta, analizarAlertasDashboard, sugerirMenuIdeas, aprenderAliasVisual, buscarMatchesVisuales, procesarCuadernoVentas } from '../controllers/agenteController';

const router = Router();

// Todas las rutas requieren autenticació
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

// --- Notebook (Ventas Manuscritas) ---
router.post('/notebook', procesarCuadernoVentas);

export default router;
