import { Request, Response } from 'express';
import Producto, { IProducto } from '../models/Producto';
import { uploadImage } from '../utils/imageUpload';

// Crear un nuevo producto
export const crearProducto = async (req: Request, res: Response) => {
    try {
        const { nombre, descripcion, precio, categoria, disponible, imagen } = req.body;

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
            imagen: imagenUrl
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

        const productos = await Producto.find(filtro).sort({ categoria: 1, nombre: 1 });
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
        const producto = await Producto.findById(id);

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
        const { nombre, descripcion, precio, categoria, disponible, imagen } = req.body;

        // Subir imagen a Cloudinary si es nueva (base64)
        let imagenUrl = imagen;
        if (imagen && imagen.startsWith('data:image')) {
            imagenUrl = await uploadImage(imagen) || undefined;
        }

        const producto = await Producto.findByIdAndUpdate(
            id,
            { nombre, descripcion, precio, categoria, disponible, imagen: imagenUrl },
            { new: true, runValidators: true }
        );

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
