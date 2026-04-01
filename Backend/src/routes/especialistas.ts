import express from 'express';
import { getEspecialistas, crearEspecialista, eliminarEspecialista, actualizarEspecialista } from '../controllers/especialistaController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/', auth, getEspecialistas);
router.post('/', auth, crearEspecialista);
router.put('/:id', auth, actualizarEspecialista);
router.delete('/:id', auth, eliminarEspecialista);

export default router;
