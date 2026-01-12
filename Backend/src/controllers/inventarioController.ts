import { Response } from 'express';
import Inventario, { IInventario } from '../models/Inventario';
import MovimientoInventario from '../models/MovimientoInventario';
import { AuthRequest } from '../middleware/auth';

// ==================== INVENTARIO ====================

// Crear un nuevo item de inventario
export const crearInventario = async (req: AuthRequest, res: Response) => {
    try {
        const { nombre, descripcion, cantidad, unidad, cantidadMinima, costoUnitario, categoria, proveedor } = req.body;
        const userId = req.userId;

        const inventario = new Inventario({
            nombre,
            descripcion,
            cantidad: cantidad || 0,
            unidad: unidad || 'unidades',
            cantidadMinima: cantidadMinima || 0,
            costoUnitario,
            categoria: categoria || 'ingrediente',
            proveedor,
            usuario: userId
        });

        await inventario.save();

        // Registrar movimiento inicial si hay cantidad
        if (cantidad > 0) {
            const movimiento = new MovimientoInventario({
                inventario: inventario._id,
                tipo: 'entrada',
                cantidad,
                costoTotal: cantidad * costoUnitario,
                motivo: 'Inventario inicial',
                usuario: userId
            });
            await movimiento.save();
        }

        res.status(201).json(inventario);
    } catch (error: any) {
        console.error('Error al crear inventario:', error);
        res.status(500).json({ message: 'Error al crear el inventario', error: error.message });
    }
};

// Obtener todo el inventario
export const obtenerInventario = async (req: AuthRequest, res: Response) => {
    try {
        const { categoria, stockBajo, busqueda } = req.query;
        const filtro: any = {};

        if (categoria) {
            filtro.categoria = categoria;
        }
        if (busqueda) {
            filtro.nombre = new RegExp(busqueda as string, 'i');
        }

        let inventario = await Inventario.find(filtro)
            .populate('usuario', 'nombre email')
            .sort({ categoria: 1, nombre: 1 });

        // Filtrar por stock bajo si se solicita
        if (stockBajo === 'true') {
            inventario = inventario.filter(item => item.cantidad <= item.cantidadMinima);
        }

        res.json(inventario);
    } catch (error: any) {
        console.error('Error al obtener inventario:', error);
        res.status(500).json({ message: 'Error al obtener inventario', error: error.message });
    }
};

// Obtener un item de inventario por ID
export const obtenerInventarioPorId = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const inventario = await Inventario.findById(id).populate('usuario', 'nombre email');

        if (!inventario) {
            return res.status(404).json({ message: 'Item de inventario no encontrado' });
        }

        res.json(inventario);
    } catch (error: any) {
        console.error('Error al obtener inventario:', error);
        res.status(500).json({ message: 'Error al obtener el inventario', error: error.message });
    }
};

// Actualizar item de inventario
export const actualizarInventario = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, unidad, cantidadMinima, costoUnitario, categoria, proveedor } = req.body;
        const userId = req.userId;

        const inventario = await Inventario.findByIdAndUpdate(
            id,
            { 
                nombre, 
                descripcion, 
                unidad, 
                cantidadMinima, 
                costoUnitario, 
                categoria, 
                proveedor,
                usuario: userId 
            },
            { new: true, runValidators: true }
        );

        if (!inventario) {
            return res.status(404).json({ message: 'Item de inventario no encontrado' });
        }

        res.json(inventario);
    } catch (error: any) {
        console.error('Error al actualizar inventario:', error);
        res.status(500).json({ message: 'Error al actualizar el inventario', error: error.message });
    }
};

// Eliminar item de inventario
export const eliminarInventario = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Eliminar movimientos asociados
        await MovimientoInventario.deleteMany({ inventario: id });

        const inventario = await Inventario.findByIdAndDelete(id);
        if (!inventario) {
            return res.status(404).json({ message: 'Item de inventario no encontrado' });
        }

        res.json({ message: 'Item de inventario eliminado correctamente' });
    } catch (error: any) {
        console.error('Error al eliminar inventario:', error);
        res.status(500).json({ message: 'Error al eliminar el inventario', error: error.message });
    }
};

// ==================== MOVIMIENTOS ====================

// Registrar entrada de inventario (compra)
export const registrarEntrada = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { cantidad, costoTotal, motivo } = req.body;
        const userId = req.userId;

        if (!cantidad || cantidad <= 0) {
            return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
        }

        const inventario = await Inventario.findById(id);
        if (!inventario) {
            return res.status(404).json({ message: 'Item de inventario no encontrado' });
        }

        // Actualizar cantidad
        inventario.cantidad += cantidad;
        if (costoTotal && cantidad > 0) {
            inventario.costoUnitario = costoTotal / cantidad;
        }
        inventario.usuario = userId as any;
        await inventario.save();

        // Registrar movimiento
        const movimiento = new MovimientoInventario({
            inventario: id,
            tipo: 'entrada',
            cantidad,
            costoTotal,
            motivo: motivo || 'Compra/reposición',
            usuario: userId
        });
        await movimiento.save();

        res.json({ inventario, movimiento });
    } catch (error: any) {
        console.error('Error al registrar entrada:', error);
        res.status(500).json({ message: 'Error al registrar entrada', error: error.message });
    }
};

// Registrar salida de inventario
export const registrarSalida = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { cantidad, motivo } = req.body;
        const userId = req.userId;

        if (!cantidad || cantidad <= 0) {
            return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
        }

        const inventario = await Inventario.findById(id);
        if (!inventario) {
            return res.status(404).json({ message: 'Item de inventario no encontrado' });
        }

        if (inventario.cantidad < cantidad) {
            return res.status(400).json({ message: 'No hay suficiente stock disponible' });
        }

        // Actualizar cantidad
        inventario.cantidad -= cantidad;
        inventario.usuario = userId as any;
        await inventario.save();

        // Registrar movimiento
        const movimiento = new MovimientoInventario({
            inventario: id,
            tipo: 'salida',
            cantidad,
            motivo: motivo || 'Uso/consumo',
            usuario: userId
        });
        await movimiento.save();

        res.json({ inventario, movimiento });
    } catch (error: any) {
        console.error('Error al registrar salida:', error);
        res.status(500).json({ message: 'Error al registrar salida', error: error.message });
    }
};

// Ajustar inventario (corrección)
export const ajustarInventario = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { cantidadReal, motivo } = req.body;
        const userId = req.userId;

        if (cantidadReal === undefined || cantidadReal < 0) {
            return res.status(400).json({ message: 'La cantidad real debe ser 0 o mayor' });
        }

        const inventario = await Inventario.findById(id);
        if (!inventario) {
            return res.status(404).json({ message: 'Item de inventario no encontrado' });
        }

        const diferencia = cantidadReal - inventario.cantidad;

        // Actualizar cantidad
        inventario.cantidad = cantidadReal;
        inventario.usuario = userId as any;
        await inventario.save();

        // Registrar movimiento de ajuste
        const movimiento = new MovimientoInventario({
            inventario: id,
            tipo: 'ajuste',
            cantidad: diferencia,
            motivo: motivo || 'Ajuste de inventario',
            usuario: userId
        });
        await movimiento.save();

        res.json({ inventario, movimiento, diferencia });
    } catch (error: any) {
        console.error('Error al ajustar inventario:', error);
        res.status(500).json({ message: 'Error al ajustar inventario', error: error.message });
    }
};

// Obtener historial de movimientos de un item
export const obtenerMovimientos = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { limite = 50 } = req.query;

        const movimientos = await MovimientoInventario.find({ inventario: id })
            .sort({ createdAt: -1 })
            .limit(Number(limite))
            .populate('usuario', 'nombre email');

        res.json(movimientos);
    } catch (error: any) {
        console.error('Error al obtener movimientos:', error);
        res.status(500).json({ message: 'Error al obtener movimientos', error: error.message });
    }
};

// Obtener items con stock bajo
export const obtenerStockBajo = async (req: AuthRequest, res: Response) => {
    try {
        const inventario = await Inventario.find({
            $expr: { $lte: ['$cantidad', '$cantidadMinima'] }
        }).sort({ cantidad: 1 });

        res.json(inventario);
    } catch (error: any) {
        console.error('Error al obtener stock bajo:', error);
        res.status(500).json({ message: 'Error al obtener stock bajo', error: error.message });
    }
};

// Obtener resumen de inventario
export const obtenerResumenInventario = async (req: AuthRequest, res: Response) => {
    try {
        const inventario = await Inventario.find();

        const totalItems = inventario.length;
        const valorTotal = inventario.reduce((sum, item) => sum + (item.cantidad * item.costoUnitario), 0);
        const itemsStockBajo = inventario.filter(item => item.cantidad <= item.cantidadMinima).length;

        const porCategoria: { [key: string]: { cantidad: number; valor: number } } = {};
        inventario.forEach(item => {
            if (!porCategoria[item.categoria]) {
                porCategoria[item.categoria] = { cantidad: 0, valor: 0 };
            }
            porCategoria[item.categoria].cantidad++;
            porCategoria[item.categoria].valor += item.cantidad * item.costoUnitario;
        });

        res.json({
            totalItems,
            valorTotal: valorTotal.toFixed(2),
            itemsStockBajo,
            porCategoria
        });
    } catch (error: any) {
        console.error('Error al obtener resumen:', error);
        res.status(500).json({ message: 'Error al obtener resumen', error: error.message });
    }
};
