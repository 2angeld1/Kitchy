import express from 'express';
import { getUserNegocios, createNegocio, switchNegocio, updateConfig, updateComisionConfig, updateComisionReventaConfig, updateOnboardingStep, obtenerNegocioActual } from '../controllers/NegocioController';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';

const router = express.Router();

router.use(auth);

router.get('/', getUserNegocios);
router.get('/me', obtenerNegocioActual);
router.post('/', checkRole(['admin']), createNegocio);
router.put('/switch/:negocioId', switchNegocio);
router.put('/config', updateConfig);
router.put('/config-comisiones', updateComisionConfig);
router.put('/config-comision-reventa', updateComisionReventaConfig);
router.put('/onboarding', updateOnboardingStep);

export default router;
