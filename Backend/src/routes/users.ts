import express from 'express';
import { getUsers, updateUserRole, deleteUser } from '../controllers/UserController';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

// Rutas accesibles por superadmin
router.get('/', checkRole(['superadmin']), getUsers);
router.put('/:id/role', checkRole(['superadmin']), updateUserRole);
router.delete('/:id', checkRole(['superadmin']), deleteUser);

export default router;
