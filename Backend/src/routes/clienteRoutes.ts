import { Router } from 'express';
import { buscarClientes, obtenerClientesRecientes } from '../controllers/clienteController';
import { auth } from '../middleware/auth';

const router = Router();

router.use(auth);

router.get('/buscar', buscarClientes);
router.get('/recientes', obtenerClientesRecientes);

export default router;
