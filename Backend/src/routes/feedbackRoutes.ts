import { Router } from 'express';
import { renderFeedbackPage, submitFeedback, getFeedbacks } from '../controllers/feedbackController';
import { auth } from '../middleware/auth';

const router = Router();

// RUTAS PÚBLICAS (Para los clientes vía Email)
router.get('/view/:ventaId', renderFeedbackPage);
router.post('/submit', submitFeedback);

// RUTAS PRIVADAS (Para el App Administrativo)
router.get('/list', auth, getFeedbacks);

export default router;
