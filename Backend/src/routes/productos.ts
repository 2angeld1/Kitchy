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

// Todas las rutas de productos (para la app admin/cajero) requieren autenticación para obtener el negocioId
router.use(auth);

router.get('/', obtenerProductos);
router.get('/categorias', obtenerCategorias);
router.get('/:id', obtenerProductoPorId);

// Rutas de administración
router.post('/importar', upload.single('archivo'), importarProductosCsv);
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);
router.patch('/:id/disponibilidad', toggleDisponibilidad);

export default router;
