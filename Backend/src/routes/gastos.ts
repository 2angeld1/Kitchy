import { Router } from 'express';
import { crearGasto, obtenerGastos, eliminarGasto } from '../controllers/gastoController';
import { auth } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(auth);

// Rutas de Gastos
router.get('/', obtenerGastos);
router.post('/', crearGasto);
router.delete('/:id', eliminarGasto);

export default router;
