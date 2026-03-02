import express from 'express';
import { getUserNegocios, createNegocio, switchNegocio } from '../controllers/NegocioController';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';

const router = express.Router();

router.use(auth);

router.get('/', getUserNegocios);
router.post('/', checkRole(['admin']), createNegocio);
router.put('/switch/:negocioId', switchNegocio);

export default router;
