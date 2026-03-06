import express from 'express';
import { getProducerReport } from '../controllers/statsController';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';

const router = express.Router();

router.use(auth);

// Reporte de productor (negocio) para el admin global o el propio admin del negocio
router.get('/producer/:id/report', checkRole(['admin']), getProducerReport);

export default router;
