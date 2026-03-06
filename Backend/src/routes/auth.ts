import { Router } from 'express';
import { login, register, forgotPassword, resetPassword, getProfile } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Aliases para compatibilidad con AgroLink Admin
router.post('/admin/login', login);
router.get('/admin/profile', auth, getProfile);
router.put('/admin/profile', auth, (req, res) => res.json({ success: true })); // Dummy para evitar errores en update perfil por ahora

export default router;