import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
    crearVenta,
    obtenerVentas,
    obtenerVentaPorId,
    obtenerVentasHoy,
    obtenerEstadisticas,
    eliminarVenta
} from '../controllers/ventaController';

const router = Router();

// Todas las rutas requieren autenticación
router.use(auth);

// Rutas de ventas
router.post('/', crearVenta);
router.get('/', obtenerVentas);
router.get('/hoy', obtenerVentasHoy);
router.get('/estadisticas', obtenerEstadisticas);
router.get('/:id', obtenerVentaPorId);
router.delete('/:id', eliminarVenta);

export default router;
