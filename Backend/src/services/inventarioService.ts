import fs from 'fs';
import csvParser from 'csv-parser';
import Inventario from '../models/Inventario';
import MovimientoInventario from '../models/MovimientoInventario';
import Gasto from '../models/Gasto';
import { uploadImage } from '../utils/imageUpload';

export const importarCsvService = async (filePath: string, negocioId: string, userId: string) => {
    const results: any[] = [];
    const errores: string[] = [];
    let creados = 0;
    let actualizados = 0;

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
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
                            negocioId
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
                                itemExistente.costoUnitario = (valorActual + valorNuevo) / (itemExistente.cantidad || 1);
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
                                    negocioId
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
                                negocioId
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
                                    negocioId
                                });
                                await movimiento.save();
                            }
                            creados++;
                        }
                    }

                    // Eliminar el archivo temporal
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }

                    resolve({
                        creados,
                        actualizados,
                        errores
                    });

                } catch (error: any) {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                    console.error('Error procesando CSV:', error);
                    reject(new Error(error.message));
                }
            })
            .on('error', (error) => {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                reject(error);
            });
    });
};

export const buscarProductoGlobalService = async (codigo: string, negocioId: string) => {
    // 1. Buscar en el inventario local del negocio
    const localItem = await Inventario.findOne({
        codigoBarras: codigo,
        negocioId
    });

    if (localItem) {
        return {
            isLocal: true,
            producto: localItem
        };
    }

    // 2. Si no existe localmente, buscar en Open Food Facts
    try {
        const globalResponse = await fetch(`https://world.openfoodfacts.org/api/v0/product/${codigo}.json`);
        const globalData: any = await globalResponse.json();

        if (globalData.status === 1) {
            const p = globalData.product;
            return {
                isLocal: false,
                producto: {
                    nombre: p.product_name || p.generic_name || '',
                    descripcion: p.brands ? `Marca: ${p.brands}` : 'Producto encontrado en catálogo global',
                    categoria: 'ingrediente',
                    unidad: 'unidades', // Default
                    codigoBarras: codigo,
                    costoUnitario: 0 // Usuario debe proveerlo
                }
            };
        }
    } catch (fetchError) {
        console.warn('Error llamando a Open Food Facts:', fetchError);
    }

    // 3. No se encontró en ningún lado
    return {
        isLocal: false,
        producto: {
            nombre: '',
            descripcion: '',
            codigoBarras: codigo,
            isNew: true
        }
    };
};

export const procesarLoteInventarioService = async (items: any[], imagen: string | null, metadata: any, negocioId: string, userId: string) => {
    let creados = 0;
    let actualizados = 0;
    const errores: any[] = [];

    let imageUrl = null;
    let nuevoGasto: any = null;

    // Subir imagen a Cloudinary y Gasto solo si viene la imagen
    if (imagen) {
        console.log('📸 Subiendo factura a Cloudinary (Lote)...');
        try {
            imageUrl = await uploadImage(imagen, 'facturas_caitlyn');
            
            // Si hay metadata la usamos, si no calculamos del lote
            const montoTotal = metadata?.total || items.reduce((sum: number, p: any) => sum + ((parseFloat(p.precioUnitario) || 0) * (parseFloat(p.cantidad) || 0)), 0);
            
            nuevoGasto = new Gasto({
                descripcion: metadata?.proveedor ? `Compra en ${metadata.proveedor}` : `Factura: ${items.length} productos ingresados`,
                categoria: 'compras',
                monto: montoTotal,
                subtotal: metadata?.subtotal || montoTotal,
                itbms: metadata?.itbms || 0,
                proveedor: metadata?.proveedor,
                ruc: metadata?.ruc,
                dv: metadata?.dv,
                nroFactura: metadata?.nroFactura,
                fecha: metadata?.fecha ? new Date(metadata.fecha) : new Date(),
                comprobante: imageUrl,
                usuario: userId,
                negocioId
            });
            await nuevoGasto.save();
            console.log('✅ Gasto creado con metadata:', metadata?.proveedor || 'Sin proveedor');
        } catch (imgError: any) {
            console.error('Error al subir imagen o crear registro de gasto:', imgError);
            errores.push({ item: 'Imagen/Gasto', error: imgError.message || 'Error desconocido' });
        }
    }

    const normalizeUnit = (u: string = '') => {
        const unit = u.toLowerCase().trim();
        if (['kg', 'kilo', 'kilos', 'kilogramo', 'kilogramos'].includes(unit)) return 'kg';
        if (['lb', 'libra', 'libras'].includes(unit)) return 'lb';
        if (['l', 'litro', 'litros'].includes(unit)) return 'litros';
        if (['ml', 'mililitro', 'mililitros'].includes(unit)) return 'ml';
        if (['g', 'gramo', 'gramos'].includes(unit)) return 'gramos';
        return 'unidades'; // Map 'unidad', 'empaque', 'caja', etc. to 'unidades' Default
    };

    for (const item of items) {
        try {
            const { nombre, cantidad, unidad: rawUnidad, precioUnitario, categoria, precioVenta } = item;
            const unidad = normalizeUnit(rawUnidad);
            
            // GUARD: Saltar items sin nombre válido (pueden venir del OCR fallback)
            if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
                console.warn('⚠️ [Lote] Item ignorado por nombre vacío o inválido:', JSON.stringify(item));
                errores.push({ item: JSON.stringify(item), error: 'Nombre vacío o inválido' });
                continue;
            }
            
            const nombreLimpio = nombre.trim();
            const qty = parseFloat(cantidad) || 0;
            const price = parseFloat(precioUnitario) || 0;

            // Escapar caracteres especiales de regex para evitar errores con nombres como "Sodas (12 pack)"
            const nombreEscapado = nombreLimpio.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            let producto = await Inventario.findOne({
                nombre: { $regex: new RegExp(`^${nombreEscapado}$`, 'i') },
                negocioId
            });

            if (producto) {
                const cantidadAnterior = producto.cantidad;
                producto.cantidad += qty;

                if (price > 0) {
                    if (producto.costoUnitario === 0) {
                        producto.costoUnitario = price;
                    } else {
                        producto.costoUnitario = ((cantidadAnterior * producto.costoUnitario) + (qty * price)) / (producto.cantidad || 1);
                    }
                }

                if (precioVenta) producto.precioVenta = parseFloat(precioVenta);

                producto.usuario = userId as any;
                await producto.save();

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
                console.log(`✅ [Lote] Actualizado: "${nombreLimpio}" (+${qty})`);
            } else {
                const nuevoProducto = new Inventario({
                    nombre: nombreLimpio,
                    cantidad: qty,
                    unidad: unidad || 'unidades',
                    costoUnitario: price,
                    precioVenta: precioVenta ? parseFloat(precioVenta) : undefined,
                    categoria: categoria || 'ingrediente',
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
                console.log(`🆕 [Lote] Creado: "${nombreLimpio}" (qty: ${qty}, precio: ${price})`);
            }
        } catch (err: any) {
            console.error(`❌ [Lote] Error procesando item "${item?.nombre}":`, err.message);
            errores.push({ item: item?.nombre || 'desconocido', error: err.message });
        }
    }

    return { creados, actualizados, errores, gastoId: nuevoGasto ? nuevoGasto._id : null };
};
