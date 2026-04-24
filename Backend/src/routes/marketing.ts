import { Router } from 'express';
import { obtenerVentasParaMarketing, enviarEncuestaVenta } from '../controllers/marketingController';
import { auth } from '../middleware/auth';

const router = Router();

router.use(auth);

router.get('/ventas-elegibles', obtenerVentasParaMarketing);
router.post('/enviar-encuesta', enviarEncuestaVenta);

export default router;
