import Producto from '../models/Producto';
import Inventario from '../models/Inventario';

export interface CSVProductoRow {
    nombre?: string;
    descripcion?: string;
    precio?: string | number;
    categoria?: string;
    disponible?: string | boolean;
    receta?: string;
    [key: string]: any;
}

export interface ImportResult {
    creados: number;
    actualizados: number;
    errores: string[];
}

export const procesarProductosImportados = async (
    filas: CSVProductoRow[],
    userId: string,
    negocioId: string
): Promise<ImportResult> => {
    const errores: string[] = [];
    let creados = 0;
    let actualizados = 0;

    for (const row of filas) {
        const { nombre, descripcion, precio, categoria, disponible, receta } = row;

        if (!nombre || precio === undefined) {
            errores.push(`Fila ignorada: Faltan campos requeridos (nombre o precio) en la fila: ${JSON.stringify(row)}`);
            continue;
        }

        const parsedPrecio = typeof precio === 'string' ? parseFloat(precio) : Number(precio) || 0;
        const parsedDisponible = disponible ? String(disponible).toLowerCase() === 'true' : true;

        let ingredientesParsed: any[] = [];

        if (receta && typeof receta === 'string' && receta.trim() !== '') {
            const parts = receta.split('|');
            for (const part of parts) {
                const [ingName, ingQtyStr] = part.split(':');
                if (ingName && ingQtyStr) {
                    const qty = parseFloat(ingQtyStr);
                    if (!isNaN(qty) && qty > 0) {
                        const cleanIngName = ingName.trim();

                        let invItem = await Inventario.findOne({
                            nombre: { $regex: new RegExp(`^${cleanIngName}$`, 'i') },
                            negocioId
                        });

                        if (!invItem) {
                            invItem = new Inventario({
                                nombre: cleanIngName,
                                cantidad: 0,
                                unidad: 'unidades',
                                costoUnitario: 0,
                                categoria: 'ingrediente',
                                usuario: userId,
                                negocioId
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

        const productoExistente = await Producto.findOne({
            nombre: { $regex: new RegExp(`^${nombre}$`, 'i') },
            negocioId
        });

        if (productoExistente) {
            productoExistente.precio = parsedPrecio;
            productoExistente.descripcion = descripcion || productoExistente.descripcion;
            productoExistente.categoria = (categoria as "otro" | "comida" | "bebida" | "postre") || productoExistente.categoria;
            productoExistente.disponible = parsedDisponible;

            if (ingredientesParsed.length > 0) {
                productoExistente.ingredientes = ingredientesParsed;
            }

            await productoExistente.save();
            actualizados++;
        } else {
            const nuevoProducto = new Producto({
                nombre,
                descripcion,
                precio: parsedPrecio,
                categoria: (categoria as "otro" | "comida" | "bebida" | "postre") || 'comida',
                disponible: parsedDisponible,
                ingredientes: ingredientesParsed,
                negocioId
            });

            await nuevoProducto.save();
            creados++;
        }
    }

    return { creados, actualizados, errores };
};
