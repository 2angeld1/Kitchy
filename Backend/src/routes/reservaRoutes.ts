import express from 'express';
import { auth } from '../middleware/auth';
import { 
    crearReserva, 
    obtenerReservas, 
    cancelarReserva 
} from '../controllers/reservaController';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

router.post('/', crearReserva);
router.get('/', obtenerReservas);
router.patch('/:id/cancelar', cancelarReserva);

export default router;
