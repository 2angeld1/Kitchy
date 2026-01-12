import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
    crearInventario,
    obtenerInventario,
    obtenerInventarioPorId,
    actualizarInventario,
    eliminarInventario,
    registrarEntrada,
    registrarSalida,
    ajustarInventario,
    obtenerMovimientos,
    obtenerStockBajo,
    obtenerResumenInventario
} from '../controllers/inventarioController';

const router = Router();

// Todas las rutas requieren autenticación
router.use(auth);

// Rutas de inventario
router.get('/resumen', obtenerResumenInventario);
router.get('/stock-bajo', obtenerStockBajo);
router.post('/', crearInventario);
router.get('/', obtenerInventario);
router.get('/:id', obtenerInventarioPorId);
router.put('/:id', actualizarInventario);
router.delete('/:id', eliminarInventario);

// Rutas de movimientos
router.post('/:id/entrada', registrarEntrada);
router.post('/:id/salida', registrarSalida);
router.post('/:id/ajuste', ajustarInventario);
router.get('/:id/movimientos', obtenerMovimientos);

export default router;
