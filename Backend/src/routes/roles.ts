import express from 'express';
import { getRoles, createRole, updateRole, deleteRole } from '../controllers/RoleController';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';

const router = express.Router();

router.use(auth);

// Solo admin puede gestionar roles
router.get('/', checkRole(['admin']), getRoles);
router.post('/', checkRole(['admin']), createRole);
router.put('/:id', checkRole(['admin']), updateRole);
router.delete('/:id', checkRole(['admin']), deleteRole);

export default router;
