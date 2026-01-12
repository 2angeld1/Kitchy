import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
    crearProducto,
    obtenerProductos,
    obtenerProductoPorId,
    actualizarProducto,
    eliminarProducto,
    toggleDisponibilidad,
    obtenerCategorias
} from '../controllers/productoController';

const router = Router();

// Rutas públicas (para ver menú)
router.get('/', obtenerProductos);
router.get('/categorias', obtenerCategorias);
router.get('/:id', obtenerProductoPorId);

// Rutas protegidas (requieren autenticación - admin)
router.post('/', auth, crearProducto);
router.put('/:id', auth, actualizarProducto);
router.delete('/:id', auth, eliminarProducto);
router.patch('/:id/disponibilidad', auth, toggleDisponibilidad);

export default router;
