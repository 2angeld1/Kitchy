import { Request, Response } from 'express';
import Producto, { IProducto } from '../models/Producto';
import Inventario from '../models/Inventario';
import { uploadImage } from '../utils/imageUpload';
import csvParser from 'csv-parser';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth';
import { parseCsvFile } from '../utils/csvAdapter';
import { procesarProductosImportados, CSVProductoRow } from '../services/productoService';

// Crear un nuevo producto
export const crearProducto = async (req: AuthRequest, res: Response) => {
    try {
        const { nombre, descripcion, precio, categoria, disponible, imagen, ingredientes } = req.body;
        const negocioId = req.negocioId;

        if (!negocioId) {
            return res.status(403).json({ message: 'No tienes un negocio asociado' });
        }

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
            ingredientes: ingredientes || [],
            negocioId
        });

        await producto.save();
        res.status(201).json(producto);
    } catch (error: any) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ message: 'Error al crear el producto', error: error.message });
    }
};

// Obtener todos los productos (con filtros opcionales)
export const obtenerProductos = async (req: AuthRequest, res: Response) => {
    try {
        const { disponible, categoria, busqueda } = req.query;
        const filtro: any = { negocioId: req.negocioId };

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
            .populate('ingredientes.inventario', 'nombre unidad cantidad cantidadMinima')
            .sort({ categoria: 1, nombre: 1 });

        // Verificar disponibilidad real basada en ingredientes
        const productosConEstado = productos.map(p => {
            const prodObj = p.toObject();
            let insuficiente = false;
            let faltantes: string[] = [];

            if (prodObj.ingredientes && prodObj.ingredientes.length > 0) {
                for (const ing of prodObj.ingredientes) {
                    if (ing.inventario && typeof ing.inventario === 'object') {
                        const inv: any = ing.inventario;
                        if (inv.cantidad < ing.cantidad) {
                            insuficiente = true;
                            faltantes.push(inv.nombre);
                        }
                    }
                }
            }

            return {
                ...prodObj,
                insuficiente,
                faltantes
            };
        });

        res.json(productosConEstado);
    } catch (error: any) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
};

// Obtener un producto por ID
export const obtenerProductoPorId = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findOne({ _id: id, negocioId: req.negocioId }).populate('ingredientes.inventario', 'nombre unidad');

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
export const actualizarProducto = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, categoria, disponible, imagen, ingredientes } = req.body;

        // Subir imagen a Cloudinary si es nueva (base64)
        let imagenUrl = imagen;
        if (imagen && imagen.startsWith('data:image')) {
            imagenUrl = await uploadImage(imagen) || undefined;
        }

        const producto = await Producto.findOneAndUpdate(
            { _id: id, negocioId: req.negocioId },
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
export const eliminarProducto = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findOneAndDelete({ _id: id, negocioId: req.negocioId });
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
export const toggleDisponibilidad = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findOne({ _id: id, negocioId: req.negocioId });
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
export const obtenerCategorias = async (req: AuthRequest, res: Response) => {
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

        if (!req.userId || !req.negocioId) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(401).json({ message: 'Usuario o negocio no autenticado correctamente.' });
        }

        try {
            // 1. Adapter: Parsear CSV a Array
            const filas = await parseCsvFile<CSVProductoRow>(req.file.path);
            
            // 2. Service: Procesar reglas de negocio
            const resultado = await procesarProductosImportados(filas, req.userId, req.negocioId);

            // 3. Limpieza
            fs.unlinkSync(req.file.path);

            // 4. Response
            res.status(200).json({
                message: 'Importación finalizada',
                detalles: resultado
            });

        } catch (error: any) {
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            console.error('Error procesando CSV de productos:', error);
            res.status(500).json({ message: 'Error procesando los datos del CSV', error: error.message });
        }

    } catch (error: any) {
        console.error('Error al importar CSV de productos:', error);
        res.status(500).json({ message: 'Error general en la importación', error: error.message });
    }
};
