import express from 'express';
import { getProducerReport, getFiscalBalance } from '../controllers/statsController';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';

const router = express.Router();

router.use(auth);

// Reporte de productor (negocio) para el admin global o el propio admin del negocio
router.get('/producer/:id/report', checkRole(['admin']), getProducerReport);
router.get('/fiscal-balance', getFiscalBalance);

export default router;
