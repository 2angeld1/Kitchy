import express from 'express';
import { getEspecialistas, crearEspecialista, eliminarEspecialista, actualizarEspecialista, enviarReportesMasivos } from '../controllers/especialistaController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/', auth, getEspecialistas);
router.post('/', auth, crearEspecialista);
router.put('/:id', auth, actualizarEspecialista);
router.delete('/:id', auth, eliminarEspecialista);

router.post('/enviar-reportes', auth, enviarReportesMasivos);

export default router;
