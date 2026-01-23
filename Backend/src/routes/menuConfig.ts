import { Router } from 'express';
import { auth, adminOnly } from '../middleware/auth';
import { getMenuConfig, updateMenuConfig } from '../controllers/menuConfigController';

const router = Router();

// Public route - anyone can view menu config
router.get('/', getMenuConfig);

// Protected route - only admin can update
router.put('/', auth, adminOnly, updateMenuConfig);

export default router;
