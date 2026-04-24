import { Response } from 'express';
import Inventario from '../models/Inventario';
import MovimientoInventario from '../models/MovimientoInventario';
import { AuthRequest } from '../middleware/auth';
import { 
    importarCsvService, 
    buscarProductoGlobalService, 
    procesarLoteInventarioService,
    registrarMovimientoService,
    obtenerResumenInventarioService,
    obtenerComparativaService
} from '../services/inventarioService';
import { emitToBusiness } from '../config/socket';

// ==================== INVENTARIO ====================

// Crear un nuevo item de inventario
export const crearInventario = async (req: AuthRequest, res: Response) => {
    try {
        const { nombre, descripcion, cantidad, unidad, cantidadMinima, costoUnitario, precioVenta, comisionEspecialista, categoria, proveedor, codigoBarras, fechaVencimiento } = req.body;
        const userId = req.userId;

        const inventario = new Inventario({
            nombre,
            descripcion,
            cantidad: cantidad || 0,
            unidad: unidad || 'unidades',
            cantidadMinima: cantidadMinima || 0,
            costoUnitario,
            precioVenta,
            comisionEspecialista,
            categoria: categoria || 'ingrediente',
            proveedor,
            codigoBarras,
            fechaVencimiento,
            usuario: userId,
            negocioId: req.negocioId
        });

        await inventario.save();
        
        emitToBusiness(req.negocioId as string, 'dashboard_update', { tipo: 'INVENTARIO_NUEVO', item: nombre });
        
        res.status(201).json(inventario);
    } catch (error: any) {
        res.status(500).json({ message: 'Error al crear item de inventario', error: error.message });
    }
};

// Obtener todos los items del negocio
export const obtenerInventario = async (req: AuthRequest, res: Response) => {
    try {
        const inventario = await Inventario.find({ negocioId: req.negocioId }).sort({ nombre: 1 });
        res.json(inventario);
    } catch (error: any) {
        res.status(500).json({ message: 'Error al obtener inventario', error: error.message });
    }
};

// Obtener un item por ID
export const obtenerInventarioPorId = async (req: AuthRequest, res: Response) => {
    try {
        const inventario = await Inventario.findOne({ _id: req.params.id, negocioId: req.negocioId });
        if (!inventario) {
            return res.status(404).json({ message: 'Item no encontrado' });
        }
        res.json(inventario);
    } catch (error: any) {
        res.status(500).json({ message: 'Error al obtener el item', error: error.message });
    }
};

// Actualizar un item
export const actualizarInventario = async (req: AuthRequest, res: Response) => {
    try {
        const inventario = await Inventario.findOneAndUpdate(
            { _id: req.params.id, negocioId: req.negocioId },
            { ...req.body, usuario: req.userId },
            { new: true }
        );

        if (!inventario) {
            return res.status(404).json({ message: 'Item no encontrado' });
        }

        emitToBusiness(req.negocioId as string, 'dashboard_update', { tipo: 'INVENTARIO_ACTUALIZADO', item: inventario.nombre });
        
        res.json(inventario);
    } catch (error: any) {
        res.status(500).json({ message: 'Error al actualizar inventario', error: error.message });
    }
};

// Eliminar item de inventario
export const eliminarInventario = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const itemCheck = await Inventario.findOne({ _id: id, negocioId: req.negocioId });
        if (!itemCheck) {
            return res.status(404).json({ message: 'Item de inventario no encontrado' });
        }

        await MovimientoInventario.deleteMany({ inventario: id });
        await Inventario.findByIdAndDelete(id);

        res.json({ message: 'Item de inventario eliminado correctamente' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error al eliminar el inventario', error: error.message });
    }
};

// ==================== MOVIMIENTOS ====================

// Registrar entrada
export const registrarEntrada = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { cantidad, costoTotal, motivo } = req.body;
        const { producto } = await registrarMovimientoService({
            inventarioId: id, tipo: 'entrada', cantidad, motivo, costoTotal,
            usuarioId: req.userId as string, negocioId: req.negocioId as string
        });
        emitToBusiness(req.negocioId as string, 'dashboard_update', { tipo: 'INVENTARIO_ENTRADA', item: producto.nombre });
        res.json(producto);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Registrar salida
export const registrarSalida = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { cantidad, motivo } = req.body;
        const { producto } = await registrarMovimientoService({
            inventarioId: id, tipo: 'salida', cantidad, motivo,
            usuarioId: req.userId as string, negocioId: req.negocioId as string
        });
        emitToBusiness(req.negocioId as string, 'dashboard_update', { tipo: 'INVENTARIO_SALIDA', item: producto.nombre });
        res.json(producto);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Registrar merma
export const registrarMerma = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { cantidad, motivo } = req.body;
        const { producto } = await registrarMovimientoService({
            inventarioId: id, tipo: 'merma', cantidad, motivo,
            usuarioId: req.userId as string, negocioId: req.negocioId as string
        });
        emitToBusiness(req.negocioId as string, 'dashboard_update', { tipo: 'INVENTARIO_MERMA', item: producto.nombre });
        res.json(producto);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Ajustar inventario
export const ajustarInventario = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { cantidadReal, motivo } = req.body;
        const { producto } = await registrarMovimientoService({
            inventarioId: id, tipo: 'ajuste', cantidad: cantidadReal, motivo,
            usuarioId: req.userId as string, negocioId: req.negocioId as string
        });
        emitToBusiness(req.negocioId as string, 'dashboard_update', { tipo: 'INVENTARIO_AJUSTE', item: producto.nombre });
        res.json(producto);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener historial de movimientos
export const obtenerMovimientos = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { limite = 50 } = req.query;
        const movimientos = await MovimientoInventario.find({ inventario: id, negocioId: req.negocioId })
            .sort({ createdAt: -1 }).limit(Number(limite)).populate('usuario', 'nombre email');
        res.json(movimientos);
    } catch (error: any) {
        res.status(500).json({ message: 'Error al obtener movimientos', error: error.message });
    }
};

// Obtener items con stock bajo
export const obtenerStockBajo = async (req: AuthRequest, res: Response) => {
    try {
        const inventario = await Inventario.find({
            negocioId: req.negocioId,
            $expr: { $lte: ['$cantidad', '$cantidadMinima'] }
        }).sort({ cantidad: 1 });
        res.json(inventario);
    } catch (error: any) {
        res.status(500).json({ message: 'Error al obtener stock bajo', error: error.message });
    }
};

// Obtener resumen de inventario
export const obtenerResumenInventario = async (req: AuthRequest, res: Response) => {
    try {
        const resumen = await obtenerResumenInventarioService(req.negocioId as string);
        res.json(resumen);
    } catch (error: any) {
        res.status(500).json({ message: 'Error al obtener resumen', error: error.message });
    }
};

export const importarInventarioCsv = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No se subió ningún archivo CSV.' });
        const result = await importarCsvService(req.file.path, req.negocioId as string, req.userId as string);
        res.status(200).json({ message: 'Importación finalizada', detalles: result });
    } catch (error: any) {
        res.status(500).json({ message: 'Error general en la importación', error: error.message });
    }
};

// Buscar producto por código de barras
export const buscarProductoGlobal = async (req: AuthRequest, res: Response) => {
    try {
        const { codigo } = req.params;
        const result = await buscarProductoGlobalService(codigo, req.negocioId as string);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: 'Error al buscar el producto', error: error.message });
    }
};

// Procesar lote de inventario (Caitlyn AI)
export const procesarLoteInventario = async (req: AuthRequest, res: Response) => {
    try {
        const { items, imagen, metadata } = req.body;
        if (!items || !Array.isArray(items)) return res.status(400).json({ message: 'Se requiere un array de items' });
        const result = await procesarLoteInventarioService(items, imagen, metadata, req.negocioId as string, req.userId as string);
        emitToBusiness(req.negocioId as string, 'dashboard_update', { tipo: 'INVENTARIO_LOTE_CAITLYN' });
        res.json({
            message: 'Procesamiento de lote finalizado',
            detalles: { creados: result.creados, actualizados: result.actualizados, errores: result.errores },
            gastoId: result.gastoId
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error interno al procesar lote', error: error.message });
    }
};

// Obtener comparativa de inventario (Inicial vs Actual)
export const obtenerComparativaInventario = async (req: AuthRequest, res: Response) => {
    try {
        const { periodo = 'hoy' } = req.query;
        const data = await obtenerComparativaService(req.negocioId as string, periodo as string);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ message: 'Error al generar la comparativa', error: error.message });
    }
};
