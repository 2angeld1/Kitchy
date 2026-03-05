import { Response } from 'express';
import Inventario, { IInventario } from '../models/Inventario';
import MovimientoInventario from '../models/MovimientoInventario';
import { AuthRequest } from '../middleware/auth';
import csvParser from 'csv-parser';
import fs from 'fs';

// ==================== INVENTARIO ====================

// Crear un nuevo item de inventario
export const crearInventario = async (req: AuthRequest, res: Response) => {
    try {
        const { nombre, descripcion, cantidad, unidad, cantidadMinima, costoUnitario, categoria, proveedor, codigoBarras, fechaVencimiento } = req.body;
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
            codigoBarras,
            fechaVencimiento,
            usuario: userId,
            negocioId: req.negocioId
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
                usuario: userId,
                negocioId: req.negocioId
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
        const { categoria, stockBajo, busqueda, codigoBarras } = req.query;
        const filtro: any = { negocioId: req.negocioId };

        if (codigoBarras) {
            filtro.codigoBarras = codigoBarras;
        }

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
        const inventario = await Inventario.findOne({ _id: id, negocioId: req.negocioId }).populate('usuario', 'nombre email');

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
        const { nombre, descripcion, unidad, cantidadMinima, costoUnitario, categoria, proveedor, codigoBarras, fechaVencimiento } = req.body;
        const userId = req.userId;

        const inventario = await Inventario.findOneAndUpdate(
            { _id: id, negocioId: req.negocioId },
            {
                nombre,
                descripcion,
                unidad,
                cantidadMinima,
                costoUnitario,
                categoria,
                proveedor,
                codigoBarras,
                fechaVencimiento,
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

        // Eliminar movimientos asociados (opcional, podrías querer mantener historial o asegurar que el negocio sea el mismo)
        // Pero primero verificamos que el item exista y sea del negocio
        const itemCheck = await Inventario.findOne({ _id: id, negocioId: req.negocioId });
        if (!itemCheck) {
            return res.status(404).json({ message: 'Item de inventario no encontrado' });
        }

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

        const inventario = await Inventario.findOne({ _id: id, negocioId: req.negocioId });
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
            usuario: userId,
            negocioId: req.negocioId
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

        const inventario = await Inventario.findOne({ _id: id, negocioId: req.negocioId });
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
            usuario: userId,
            negocioId: req.negocioId
        });
        await movimiento.save();

        res.json({ inventario, movimiento });
    } catch (error: any) {
        console.error('Error al registrar salida:', error);
        res.status(500).json({ message: 'Error al registrar salida', error: error.message });
    }
};

// Registrar merma de inventario (desperdicio)
export const registrarMerma = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { cantidad, motivo } = req.body;
        const userId = req.userId;

        if (!cantidad || cantidad <= 0) {
            return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
        }

        const inventario = await Inventario.findOne({ _id: id, negocioId: req.negocioId });
        if (!inventario) {
            return res.status(404).json({ message: 'Item de inventario no encontrado' });
        }

        if (inventario.cantidad < cantidad) {
            return res.status(400).json({ message: 'No hay suficiente stock para reportar merma' });
        }

        // Actualizar cantidad
        inventario.cantidad -= cantidad;
        inventario.usuario = userId as any;
        await inventario.save();

        // Registrar movimiento de merma
        const movimiento = new MovimientoInventario({
            inventario: id,
            tipo: 'merma',
            cantidad,
            motivo: motivo || 'Merma/Desperdicio',
            usuario: userId,
            negocioId: req.negocioId
        });
        await movimiento.save();

        res.json({ inventario, movimiento });
    } catch (error: any) {
        console.error('Error al registrar merma:', error);
        res.status(500).json({ message: 'Error al registrar merma', error: error.message });
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

        const inventario = await Inventario.findOne({ _id: id, negocioId: req.negocioId });
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
            usuario: userId,
            negocioId: req.negocioId
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

        const movimientos = await MovimientoInventario.find({ inventario: id, negocioId: req.negocioId })
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
            negocioId: req.negocioId,
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
        const inventario = await Inventario.find({ negocioId: req.negocioId });

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

// Importar inventario desde CSV
export const importarInventarioCsv = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se subió ningún archivo CSV.' });
        }

        const userId = req.userId;
        const results: any[] = [];
        const errores: string[] = [];
        let creados = 0;
        let actualizados = 0;

        fs.createReadStream(req.file.path)
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    for (const row of results) {
                        const { nombre, descripcion, cantidad, unidad, cantidadMinima, costoUnitario, categoria, proveedor } = row;

                        if (!nombre || costoUnitario === undefined) {
                            errores.push(`Fila ignorada: Faltan campos requeridos (nombre o costoUnitario) en la fila: ${JSON.stringify(row)}`);
                            continue;
                        }

                        const parsedCantidad = parseFloat(cantidad) || 0;
                        const parsedCantidadMinima = parseFloat(cantidadMinima) || 0;
                        const parsedCostoUnitario = parseFloat(costoUnitario) || 0;

                        // Buscar si el item ya existe
                        const itemExistente = await Inventario.findOne({
                            nombre: { $regex: new RegExp(`^${nombre}$`, 'i') },
                            negocioId: req.negocioId
                        });

                        if (itemExistente) {
                            // Actualizar
                            const cantidadAnterior = itemExistente.cantidad;
                            itemExistente.cantidad += parsedCantidad;
                            itemExistente.descripcion = descripcion || itemExistente.descripcion;
                            itemExistente.unidad = unidad || itemExistente.unidad;
                            itemExistente.cantidadMinima = parsedCantidadMinima || itemExistente.cantidadMinima;

                            // Si el costo viene distinto a 0 en el CSV y mayor que cero, actualiza el promedio o reemplázalo
                            if (parsedCostoUnitario > 0 && parsedCantidad > 0) {
                                // Promedio ponderado básico
                                const valorActual = cantidadAnterior * itemExistente.costoUnitario;
                                const valorNuevo = parsedCantidad * parsedCostoUnitario;
                                itemExistente.costoUnitario = (valorActual + valorNuevo) / itemExistente.cantidad;
                            }

                            itemExistente.categoria = categoria || itemExistente.categoria;
                            itemExistente.proveedor = proveedor || itemExistente.proveedor;
                            itemExistente.usuario = userId as any;

                            await itemExistente.save();

                            if (parsedCantidad > 0) {
                                const movimiento = new MovimientoInventario({
                                    inventario: itemExistente._id,
                                    tipo: 'entrada',
                                    cantidad: parsedCantidad,
                                    costoTotal: parsedCantidad * parsedCostoUnitario,
                                    motivo: 'Importación CSV (Suma al stock)',
                                    usuario: userId,
                                    negocioId: req.negocioId
                                });
                                await movimiento.save();
                            }
                            actualizados++;
                        } else {
                            // Crear nuevo
                            const nuevoItem = new Inventario({
                                nombre,
                                descripcion,
                                cantidad: parsedCantidad,
                                unidad: unidad || 'unidades',
                                cantidadMinima: parsedCantidadMinima,
                                costoUnitario: parsedCostoUnitario,
                                categoria: categoria || 'ingrediente',
                                proveedor,
                                usuario: userId,
                                negocioId: req.negocioId
                            });

                            await nuevoItem.save();

                            if (parsedCantidad > 0) {
                                const movimiento = new MovimientoInventario({
                                    inventario: nuevoItem._id,
                                    tipo: 'entrada',
                                    cantidad: parsedCantidad,
                                    costoTotal: parsedCantidad * parsedCostoUnitario,
                                    motivo: 'Importación CSV (Creación inicial)',
                                    usuario: userId,
                                    negocioId: req.negocioId
                                });
                                await movimiento.save();
                            }
                            creados++;
                        }
                    }

                    // Eliminar el archivo temporal
                    fs.unlinkSync(req.file!.path);

                    res.status(200).json({
                        message: 'Importación finalizada',
                        detalles: {
                            creados,
                            actualizados,
                            errores
                        }
                    });

                } catch (error: any) {
                    // En caso de error dentro del stream, intentar limpiar archivo
                    if (fs.existsSync(req.file!.path)) {
                        fs.unlinkSync(req.file!.path);
                    }
                    console.error('Error procesando CSV:', error);
                    res.status(500).json({ message: 'Error procesando los datos del CSV', error: error.message });
                }
            });

    } catch (error: any) {
        console.error('Error al importar CSV:', error);
        res.status(500).json({ message: 'Error general en la importación', error: error.message });
    }
};
// Buscar producto por código de barras (local y global)
export const buscarProductoGlobal = async (req: AuthRequest, res: Response) => {
    try {
        const { codigo } = req.params;
        const negocioId = req.negocioId;

        // 1. Buscar en el inventario local del negocio
        const localItem = await Inventario.findOne({
            codigoBarras: codigo,
            negocioId
        });

        if (localItem) {
            return res.json({
                isLocal: true,
                producto: localItem
            });
        }

        // 2. Si no existe localmente, buscar en Open Food Facts
        try {
            const globalResponse = await fetch(`https://world.openfoodfacts.org/api/v0/product/${codigo}.json`);
            const globalData: any = await globalResponse.json();

            if (globalData.status === 1) {
                const p = globalData.product;
                return res.json({
                    isLocal: false,
                    producto: {
                        nombre: p.product_name || p.generic_name || '',
                        descripcion: p.brands ? `Marca: ${p.brands}` : 'Producto encontrado en catálogo global',
                        categoria: 'ingrediente',
                        unidad: 'unidades', // Default
                        codigoBarras: codigo,
                        costoUnitario: 0 // Usuario debe proveerlo
                    }
                });
            }
        } catch (fetchError) {
            console.warn('Error llamando a Open Food Facts:', fetchError);
        }

        // 3. No se encontró en ningún lado
        return res.json({
            isLocal: false,
            producto: {
                nombre: '',
                descripcion: '',
                codigoBarras: codigo,
                isNew: true
            }
        });

    } catch (error: any) {
        console.error('Error en buscarProductoGlobal:', error);
        res.status(500).json({ message: 'Error al buscar el producto', error: error.message });
    }
};
// Procesar un lote de productos (usado por Caitlyn / Importaciones rápidas)
export const procesarLoteInventario = async (req: AuthRequest, res: Response) => {
    try {
        const { items } = req.body;
        const userId = req.userId;
        const negocioId = req.negocioId;

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ message: 'Se requiere un array de items' });
        }

        let creados = 0;
        let actualizados = 0;
        const errores: any[] = [];

        for (const item of items) {
            try {
                const { nombre, cantidad, unidad, precioUnitario, categoria } = item;
                const qty = parseFloat(cantidad) || 0;
                const price = parseFloat(precioUnitario) || 0;

                // Buscar si existe (insensible a mayúsculas/minúsculas)
                let producto = await Inventario.findOne({
                    nombre: { $regex: new RegExp(`^${nombre.trim()}$`, 'i') },
                    negocioId
                });

                if (producto) {
                    // Actualizar Stock
                    const cantidadAnterior = producto.cantidad;
                    producto.cantidad += qty;

                    // Actualizar costo unitario (promedio simple o reemplazo si el anterior era 0)
                    if (price > 0) {
                        if (producto.costoUnitario === 0) {
                            producto.costoUnitario = price;
                        } else {
                            // Promedio ponderado básico
                            producto.costoUnitario = ((cantidadAnterior * producto.costoUnitario) + (qty * price)) / (producto.cantidad || 1);
                        }
                    }

                    producto.usuario = userId as any;
                    await producto.save();

                    // Registrar movimiento
                    const movimiento = new MovimientoInventario({
                        inventario: producto._id,
                        tipo: 'entrada',
                        cantidad: qty,
                        costoTotal: qty * price,
                        motivo: 'Carga masiva desde factura (Caitlyn)',
                        usuario: userId,
                        negocioId
                    });
                    await movimiento.save();
                    actualizados++;
                } else {
                    // Crear Nuevo
                    const nuevoProducto = new Inventario({
                        nombre: nombre.trim(),
                        cantidad: qty,
                        unidad: unidad || 'unidades',
                        costoUnitario: price,
                        categoria: categoria || 'comida',
                        cantidadMinima: 1,
                        usuario: userId,
                        negocioId
                    });
                    await nuevoProducto.save();

                    const movimiento = new MovimientoInventario({
                        inventario: nuevoProducto._id,
                        tipo: 'entrada',
                        cantidad: qty,
                        costoTotal: qty * price,
                        motivo: 'Carga inicial desde factura (Caitlyn)',
                        usuario: userId,
                        negocioId
                    });
                    await movimiento.save();
                    creados++;
                }
            } catch (err: any) {
                errores.push({ item: item.nombre, error: err.message });
            }
        }

        res.json({
            message: 'Procesamiento de lote finalizado',
            detalles: { creados, actualizados, errores }
        });

    } catch (error: any) {
        console.error('Error en procesarLoteInventario:', error);
        res.status(500).json({ message: 'Error interno al procesar lote', error: error.message });
    }
};
