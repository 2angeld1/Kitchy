import { Router } from 'express';
import { crearGasto, obtenerGastos, eliminarGasto, exportarGastosCsv } from '../controllers/gastoController';
import { auth } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(auth);

// Rutas de Gastos
router.get('/', obtenerGastos);
router.get('/export', exportarGastosCsv);
router.post('/', crearGasto);
router.delete('/:id', eliminarGasto);

export default router;
