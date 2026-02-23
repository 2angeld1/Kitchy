import { Router } from 'express';
import { auth } from '../middleware/auth';
import multer from 'multer';
import {
    crearProducto,
    obtenerProductos,
    obtenerProductoPorId,
    actualizarProducto,
    eliminarProducto,
    toggleDisponibilidad,
    obtenerCategorias,
    importarProductosCsv
} from '../controllers/productoController';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Rutas públicas (para ver menú)
router.get('/', obtenerProductos);
router.get('/categorias', obtenerCategorias);
router.get('/:id', obtenerProductoPorId);

// Rutas protegidas (requieren autenticación - admin)
router.post('/importar', auth, upload.single('archivo'), importarProductosCsv);
router.post('/', auth, crearProducto);
router.put('/:id', auth, actualizarProducto);
router.delete('/:id', auth, eliminarProducto);
router.patch('/:id/disponibilidad', auth, toggleDisponibilidad);

export default router;
