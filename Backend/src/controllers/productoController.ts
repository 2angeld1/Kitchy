import { Request, Response } from 'express';
import Producto, { IProducto } from '../models/Producto';
import Inventario from '../models/Inventario';
import { uploadImage } from '../utils/imageUpload';
import csvParser from 'csv-parser';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth';

// Crear un nuevo producto
export const crearProducto = async (req: Request, res: Response) => {
    try {
        const { nombre, descripcion, precio, categoria, disponible, imagen, ingredientes } = req.body;

        // Subir imagen a Cloudinary si existe (y es base64)
        let imagenUrl = imagen;
        if (imagen && imagen.startsWith('data:image')) {
            imagenUrl = await uploadImage(imagen) || undefined;
        }

        const producto = new Producto({
            nombre,
            descripcion,
            precio,
            categoria: categoria || 'comida',
            disponible: disponible !== undefined ? disponible : true,
            imagen: imagenUrl,
            ingredientes: ingredientes || []
        });

        await producto.save();
        res.status(201).json(producto);
    } catch (error: any) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ message: 'Error al crear el producto', error: error.message });
    }
};

// Obtener todos los productos (con filtros opcionales)
export const obtenerProductos = async (req: Request, res: Response) => {
    try {
        const { disponible, categoria, busqueda } = req.query;
        const filtro: any = {};

        if (disponible !== undefined) {
            filtro.disponible = disponible === 'true';
        }
        if (categoria) {
            filtro.categoria = categoria;
        }
        if (busqueda) {
            filtro.nombre = new RegExp(busqueda as string, 'i');
        }

        const productos = await Producto.find(filtro)
            .populate('ingredientes.inventario', 'nombre unidad')
            .sort({ categoria: 1, nombre: 1 });
        res.json(productos);
    } catch (error: any) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
};

// Obtener un producto por ID
export const obtenerProductoPorId = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findById(id).populate('ingredientes.inventario', 'nombre unidad');

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json(producto);
    } catch (error: any) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
    }
};

// Actualizar un producto
export const actualizarProducto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, categoria, disponible, imagen, ingredientes } = req.body;

        // Subir imagen a Cloudinary si es nueva (base64)
        let imagenUrl = imagen;
        if (imagen && imagen.startsWith('data:image')) {
            imagenUrl = await uploadImage(imagen) || undefined;
        }

        const producto = await Producto.findByIdAndUpdate(
            id,
            { nombre, descripcion, precio, categoria, disponible, imagen: imagenUrl, ingredientes },
            { new: true, runValidators: true }
        ).populate('ingredientes.inventario', 'nombre unidad');

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json(producto);
    } catch (error: any) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
    }
};

// Eliminar un producto
export const eliminarProducto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findByIdAndDelete(id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error: any) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
    }
};

// Cambiar disponibilidad de un producto
export const toggleDisponibilidad = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        producto.disponible = !producto.disponible;
        await producto.save();

        res.json(producto);
    } catch (error: any) {
        console.error('Error al cambiar disponibilidad:', error);
        res.status(500).json({ message: 'Error al cambiar disponibilidad', error: error.message });
    }
};

// Obtener categorías disponibles
export const obtenerCategorias = async (req: Request, res: Response) => {
    try {
        const categorias = ['comida', 'bebida', 'postre', 'otro'];
        res.json(categorias);
    } catch (error: any) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
    }
};

// Importar productos desde CSV
export const importarProductosCsv = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se subió ningún archivo CSV.' });
        }

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
                        const { nombre, descripcion, precio, categoria, disponible, receta } = row;

                        if (!nombre || precio === undefined) {
                            errores.push(`Fila ignorada: Faltan campos requeridos (nombre o precio) en la fila: ${JSON.stringify(row)}`);
                            continue;
                        }

                        const parsedPrecio = parseFloat(precio) || 0;
                        const parsedDisponible = disponible ? String(disponible).toLowerCase() === 'true' : true;

                        let ingredientesParsed: any[] = [];

                        if (receta && typeof receta === 'string' && receta.trim() !== '') {
                            // Example format: "Pan:1|Tomate:0.5|Queso:2"
                            const parts = receta.split('|');
                            for (const part of parts) {
                                const [ingName, ingQtyStr] = part.split(':');
                                if (ingName && ingQtyStr) {
                                    const qty = parseFloat(ingQtyStr);
                                    if (!isNaN(qty) && qty > 0 && req.userId) {
                                        const cleanIngName = ingName.trim();

                                        // Buscar o crear en el inventario
                                        let invItem = await Inventario.findOne({
                                            nombre: { $regex: new RegExp(`^${cleanIngName}$`, 'i') }
                                        });

                                        if (!invItem) {
                                            invItem = new Inventario({
                                                nombre: cleanIngName,
                                                cantidad: 0,
                                                unidad: 'unidades', // default simple
                                                costoUnitario: 0,
                                                categoria: 'ingrediente',
                                                usuario: req.userId
                                            });
                                            await invItem.save();
                                        }

                                        ingredientesParsed.push({
                                            inventario: invItem._id,
                                            cantidad: qty
                                        });
                                    }
                                }
                            }
                        }

                        // Buscar si el producto ya existe
                        const productoExistente = await Producto.findOne({ nombre: { $regex: new RegExp(`^${nombre}$`, 'i') } });

                        if (productoExistente) {
                            // Actualizar
                            productoExistente.precio = parsedPrecio;
                            productoExistente.descripcion = descripcion || productoExistente.descripcion;
                            productoExistente.categoria = categoria || productoExistente.categoria;
                            productoExistente.disponible = parsedDisponible;

                            if (ingredientesParsed.length > 0) {
                                // Sobrescribir receta si se proveyó una en el CSV
                                productoExistente.ingredientes = ingredientesParsed;
                            }

                            await productoExistente.save();
                            actualizados++;
                        } else {
                            // Crear nuevo
                            const nuevoProducto = new Producto({
                                nombre,
                                descripcion,
                                precio: parsedPrecio,
                                categoria: categoria || 'comida',
                                disponible: parsedDisponible,
                                ingredientes: ingredientesParsed
                            });

                            await nuevoProducto.save();
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
                    if (fs.existsSync(req.file!.path)) {
                        fs.unlinkSync(req.file!.path);
                    }
                    console.error('Error procesando CSV de productos:', error);
                    res.status(500).json({ message: 'Error procesando los datos del CSV', error: error.message });
                }
            });

    } catch (error: any) {
        console.error('Error al importar CSV de productos:', error);
        res.status(500).json({ message: 'Error general en la importación', error: error.message });
    }
};
