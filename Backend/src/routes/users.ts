import express from 'express';
import { getUsers, updateUserRole, deleteUser, createUser, getBillingSummary } from '../controllers/UserController';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

// Rutas de administración global (Plataforma)
router.get('/billing-summary', checkRole(['admin']), getBillingSummary);

// Rutas accesibles por admin (gestiona usuarios de su negocio)
router.get('/', checkRole(['admin']), getUsers);
router.post('/', checkRole(['admin']), createUser);
router.put('/:id/role', checkRole(['admin']), updateUserRole);
router.delete('/:id', checkRole(['admin']), deleteUser);

export default router;
