import { Router } from 'express';
import { auth } from '../middleware/auth';
import multer from 'multer';
import {
    crearInventario,
    obtenerInventario,
    obtenerInventarioPorId,
    actualizarInventario,
    eliminarInventario,
    registrarEntrada,
    registrarSalida,
    ajustarInventario,
    obtenerMovimientos,
    obtenerStockBajo,
    obtenerResumenInventario,
    importarInventarioCsv
} from '../controllers/inventarioController';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Todas las rutas requieren autenticación
router.use(auth);

// Rutas de inventario
router.get('/resumen', obtenerResumenInventario);
router.get('/stock-bajo', obtenerStockBajo);
router.post('/importar', upload.single('archivo'), importarInventarioCsv);
router.post('/', crearInventario);
router.get('/', obtenerInventario);
router.get('/:id', obtenerInventarioPorId);
router.put('/:id', actualizarInventario);
router.delete('/:id', eliminarInventario);

// Rutas de movimientos
router.post('/:id/entrada', registrarEntrada);
router.post('/:id/salida', registrarSalida);
router.post('/:id/ajuste', ajustarInventario);
router.get('/:id/movimientos', obtenerMovimientos);

export default router;
