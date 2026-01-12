import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
    obtenerDashboard,
    reporteVentas,
    reporteGanancias
} from '../controllers/dashboardController';

const router = Router();

// Todas las rutas requieren autenticación
router.use(auth);

// Dashboard y reportes
router.get('/', obtenerDashboard);
router.get('/ventas', reporteVentas);
router.get('/ganancias', reporteGanancias);

export default router;
