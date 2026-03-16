import { Router } from 'express';
import { auth } from '../middleware/auth';
import { calcularComisiones } from '../controllers/comisionController';

const router = Router();

// GET /comisiones — Calcula comisiones del mes actual o del mes/año indicado
router.get('/', auth, calcularComisiones);

export default router;
