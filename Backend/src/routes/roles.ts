import express from 'express';
import { getRoles, createRole, updateRole, deleteRole } from '../controllers/RoleController';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';

const router = express.Router();

router.use(auth);

// Solo superadmin puede gestionar roles
router.get('/', checkRole(['superadmin']), getRoles);
router.post('/', checkRole(['superadmin']), createRole);
router.put('/:id', checkRole(['superadmin']), updateRole);
router.delete('/:id', checkRole(['superadmin']), deleteRole);

export default router;
