import express from 'express';
import { getUserNegocios, createNegocio, switchNegocio, updateConfig, updateComisionConfig, updateOnboardingStep } from '../controllers/NegocioController';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';

const router = express.Router();

router.use(auth);

router.get('/', getUserNegocios);
router.post('/', checkRole(['admin']), createNegocio);
router.put('/switch/:negocioId', switchNegocio);
router.put('/config', updateConfig);
router.put('/config-comisiones', updateComisionConfig);
router.put('/onboarding', updateOnboardingStep);

export default router;
