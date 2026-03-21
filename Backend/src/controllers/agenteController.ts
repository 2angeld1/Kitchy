import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { uploadImage } from '../utils/imageUpload';
import Producto from '../models/Producto';
import Gasto from '../models/Gasto';
import Venta from '../models/Venta';
import Inventario from '../models/Inventario';
import Negocio from '../models/Negocio';
import axios from 'axios';
import { getLatestContext } from '../services/marketContextService';

/**
 * Controller para manejar las peticiones a Caitlyn (IA)
 * Flujo: Kitchy Backend (Broker) → Caitlyn (IA) → Mobile
 */

const CAITLYN_URL = process.env.CAITLYN_URL || 'http://localhost:8000';

export const procesarFactura = async (req: AuthRequest, res: Response) => {
    try {
        const { imagen } = req.body;

        if (!imagen) {
            return res.status(400).json({ message: 'No se recibió ninguna imagen de factura' });
        }

        // 1. Enviar imagen a Caitlyn (microservicio) para análisis con Gemini
        console.log('🤖 Enviando factura a Caitlyn para análisis...');
        let productosDetectados: any[] = [];
        let caitlynError: string | null = null;

        try {
            const caitlynResponse = await axios.post(
                `${CAITLYN_URL}/agent/invoice`,
                { imagen },
                { timeout: 60000 } // 60 segundos por si Gemini tarda
            );

            if (caitlynResponse.data.success) {
                productosDetectados = caitlynResponse.data.productos || [];
                const fiscal = caitlynResponse.data.fiscal || {};
                const metadata = {
                    proveedor: fiscal.proveedor,
                    ruc: fiscal.ruc,
                    dv: fiscal.dv,
                    fecha: fiscal.fecha,
                    receptor: fiscal.receptor,
                    nroFactura: fiscal.nroFactura,
                    subtotal: fiscal.subtotal,
                    itbms: fiscal.itbms,
                    total: fiscal.total
                };
                console.log(`✅ Caitlyn detectó ${productosDetectados.length} productos y metadata de ${metadata.proveedor || 'proveedor desconocido'}`);
                
                return res.json({
                    message: productosDetectados.length > 0
                        ? `Caitlyn detectó ${productosDetectados.length} productos en tu factura`
                        : 'Caitlyn detectó la factura pero no productos específicos.',
                    items: productosDetectados,
                    metadata
                });
            } else {
                caitlynError = caitlynResponse.data.error || 'Caitlyn no pudo procesar la factura';
                console.warn('⚠️ Caitlyn respondió sin éxito:', caitlynError);
                return res.status(400).json({ message: caitlynError });
            }
        } catch (caitlynErr: any) {
            caitlynError = caitlynErr.message || 'No se pudo contactar a Caitlyn';
            console.warn('⚠️ Error contactando a Caitlyn:', caitlynError);
            return res.status(500).json({ message: 'Error de conexión con IA', error: caitlynError });
        }

    } catch (error: any) {
        console.error('Error al procesar factura con Caitlyn:', error);
        res.status(500).json({ message: 'Error interno al procesar la factura', error: error.message });
    }
};

/**
 * ENDPOINT MAESTRO: Obtener consejo estratégico con contexto de PANAMÁ (Caitlyn)
 */
export const obtenerConsejoNegocio = async (req: AuthRequest, res: Response) => {
    try {
        const { productName } = req.body;
        const negocioId = req.negocioId;

        console.log(`🧠 Caitlyn generando insight automático (Negocio: ${negocioId})`);

        // 1. Recolectar Contexto del Mercado de Panamá
        const marketContext = await getLatestContext();

        let businessStats: any = {};
        
        if (productName) {
            // Caso específico de un producto (como antes)
            const producto = await Producto.findOne({ nombre: new RegExp(productName, 'i'), negocioId })
                .populate('ingredientes.inventario');

            if (producto) {
                const ventasRecientes = await Venta.find({
                    negocioId,
                    'productos.producto': producto._id,
                    fecha: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                });

                businessStats = {
                    tipo: 'PRODUCTO',
                    nombre: producto.nombre,
                    precioActual: producto.precio,
                    ventas30Dias: ventasRecientes.length,
                    ingredientes: (producto.ingredientes || []).map((ing: any) => ({
                        nombre: ing.inventario?.nombre,
                        costo: ing.inventario?.costoUnitario,
                        unidad: ing.inventario?.unidad,
                        cantidad: ing.cantidad
                    }))
                };
            }
        } else {
            // CASO AUTOMÁTICO (Dashboard): Buscar el producto más vendido del mes
            const ventasMes = await Venta.find({
                negocioId,
                fecha: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            });

            businessStats = {
                tipo: 'GENERAL',
                totalVentasMes: ventasMes.length,
                ingresosMes: ventasMes.reduce((acc, v) => acc + v.total, 0)
            };
        }

        // 3. Empaquetar y enviar al Microservicio de IA
        const payload = {
            product_name: productName,
            market_context: marketContext,
            business_data: businessStats,
            config: {
                tipo_negocio: (req as any).user?.negocioActivo?.categoria || 'GASTRONOMIA'
            }
        };

        const response = await axios.post(`${CAITLYN_URL}/agent/business/advice`, payload);

        if (response.data.success) {
            res.json({
                success: true,
                message: response.data.message,
                contextUsed: {
                    clima: !!marketContext.WEATHER,
                    gasolina: !!marketContext.FUEL,
                    merca: !!marketContext.MERCA
                }
            });
        } else {
            res.status(400).json({ success: false, message: response.data.error || 'Caitlyn no pudo procesar el consejo.' });
        }

    } catch (error: any) {
        console.error('❌ Error en broker de Caitlyn:', error.message);
        res.status(500).json({ success: false, message: 'Error de conexión con IA' });
    }
};

export const consultarCosteoPorNombre = async (req: AuthRequest, res: Response) => {
    try {
        const { nombre } = req.params;
        const negocioId = req.negocioId;

        const producto = await Producto.findOne({ 
            nombre: new RegExp(nombre, 'i'), 
            negocioId 
        }).populate('ingredientes.inventario');

        if (!producto) return res.status(404).json({ message: 'No encontré ese producto.' });

        let costoTotal = 0;
        const desglose = [];

        if (producto.ingredientes && producto.ingredientes.length > 0) {
            for (const ing of producto.ingredientes) {
                const inv = ing.inventario as any;
                if (inv) {
                    const costoIngrediente = inv.costoUnitario * ing.cantidad;
                    costoTotal += costoIngrediente;
                    desglose.push({
                        insumo: inv.nombre,
                        cantidad: ing.cantidad,
                        unidad: inv.unidad,
                        subtotal: costoIngrediente
                    });
                }
            }
        }

        const margenActual = producto.precio > 0 ? ((producto.precio - costoTotal) / producto.precio) * 100 : 0;

        res.json({
            nombre: producto.nombre,
            precioActual: producto.precio,
            costoTotal: costoTotal.toFixed(2),
            margenActual: margenActual.toFixed(1) + '%',
            desglose,
            sugerencias: {
                ideal: (costoTotal / 0.30).toFixed(2), // 70% margen
                competitivo: (costoTotal / 0.40).toFixed(2) // 60% margen
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error de costeo' });
    }
};

/**
 * Guarda los datos de la factura confirmados por el usuario como un Gasto real
 * Y ADEMÁS actualiza el stock en el Inventario basándose en el desglose (uds/pack).
 */
export const guardarGastoFactura = async (req: AuthRequest, res: Response) => {
    try {
        const { proveedor, ruc, dv, total, subtotal, itbms, nroFactura, receptor, fecha, items } = req.body;
        const negocioId = req.negocioId;
        const userId = req.userId;

        if (!negocioId) return res.status(403).json({ message: 'No tienes negocio activo' });

        // 1. Guardar el registro de GASTO (Para Balance Fiscal e ITBMS)
        const nuevoGasto = new Gasto({
            descripcion: `Compra a ${proveedor || 'Proveedor'} (Factura #${nroFactura || 'S/N'})`,
            categoria: 'compras',
            monto: total,
            subtotal: subtotal || (total - (itbms || 0)),
            itbms: itbms || 0,
            fecha: fecha ? new Date(fecha) : new Date(),
            proveedor,
            ruc,
            dv,
            nroFactura,
            receptor,
            usuario: userId,
            negocioId
        });

        await nuevoGasto.save();

        // 2. Actualizar el INVENTARIO (Si vienen productos vinculados)
        let actualizados = 0;
        if (items && Array.isArray(items)) {
            for (const item of items) {
                // Buscamos si el item ya existe en el inventario por nombre (o si tiene un ID vinculado)
                // En el futuro Kitchy usará IDs, por ahora buscamos por nombre exacto en el negocio
                const itemInv = await Inventario.findOne({ 
                    negocioId, 
                    nombre: new RegExp(`^${item.nombre}$`, 'i') 
                });

                if (itemInv) {
                    const multi = item.unidadesPorEmpaque || 1;
                    const cantidadRealAAgregar = item.cantidad * multi;
                    
                    // Actualizar Stock
                    itemInv.cantidad += cantidadRealAAgregar;
                    
                    // Actualizar Costo Unitario (Nuevo costo / Multiplicador)
                    const nuevoCostoReportado = item.precioUnitario || 0;
                    itemInv.costoUnitario = nuevoCostoReportado / multi;

                    await itemInv.save();
                    actualizados++;
                }
            }
        }

        res.status(201).json({
            success: true,
            message: `Factura procesada. Gasto registrado y ${actualizados} productos actualizados en stock.`,
            gasto: nuevoGasto
        });

    } catch (error: any) {
        console.error('Error al guardar gasto e inventario de factura:', error);
        res.status(500).json({ message: 'Error al procesar la confirmación', error: error.message });
    }
};

/**
 * Pide a Caitlyn una sugerencia de receta basada en el inventario actual.
 */
export const sugerirReceta = async (req: AuthRequest, res: Response) => {
    try {
        const { nombrePlato, servingSize, categoria } = req.body;
        const negocioId = req.negocioId;

        if (!nombrePlato) return res.status(400).json({ message: 'Falta el nombre del plato' });

        // 1. Obtener margen objetivo del negocio
        const negocio = await Negocio.findById(negocioId);
        const margenObjetivo = negocio?.config?.margenObjetivo || 65;

        // 2. Obtener TODO el inventario con COSTOS
        const inventario = await Inventario.find({ negocioId }).select('nombre unidad cantidad costoUnitario _id');
        
        // 3. Consultar a Caitlyn (IA)
        const response = await axios.post(`${CAITLYN_URL}/agent/recipe/suggest`, {
            dish_name: nombrePlato,
            serving_size: servingSize,
            category: categoria, // Pasamos la categoría (ej. 'bebida')
            inventory: inventario,
            target_margin: margenObjetivo
        });

        if (response.data.success) {
            const recipeSuggestions = response.data.recipe || [];
            
            // 4. Identificar Faltantes (Insumos que no están en inventario o tienen stock 0)
            const faltantes = recipeSuggestions.filter((ingSuggested: any) => {
                const nombreSugerido = (ingSuggested.nombre || ingSuggested.insumo || "").toLowerCase();
                const enInventario = inventario.find(inv => {
                    const nombreInv = (inv.nombre || "").toLowerCase();
                    return nombreInv.includes(nombreSugerido) || nombreSugerido.includes(nombreInv);
                });
                return !enInventario || enInventario.cantidad <= 0;
            }).map((f: any) => f.nombre || f.insumo);

            res.json({
                success: true,
                recipe: recipeSuggestions,
                costoTotal: response.data.costoTotal,
                precioSugerido: response.data.precioSugerido,
                margenAplicado: margenObjetivo,
                faltantes 
            });
        } else {
            res.status(400).json({ success: false, error: response.data.error || 'Caitlyn no pudo generar la receta' });
        }

    } catch (error: any) {
        console.error('Error sugiriendo receta con Caitlyn:', error);
        res.status(500).json({ message: 'Error de conexión con el Chef Caitlyn' });
    }
};
/**
 * Pide a Caitlyn un resumen de las alertas del dashboard.
 */
export const analizarAlertasDashboard = async (req: AuthRequest, res: Response) => {
    try {
        const { alerts } = req.body;
        if (!alerts || !Array.isArray(alerts)) {
            return res.status(400).json({ success: false, message: 'No se enviaron alertas válidas.' });
        }

        // 1. Delegar a Caitlyn en Python (8000)
        console.log(`🤖 Caitlyn analizando ${alerts.length} alertas del Dashboard...`);
        const response = await axios.post(`${CAITLYN_URL}/agent/business/dashboard-alerts`, { alerts });

        if (response.data.success) {
            res.json({
                success: true,
                message: response.data.message
            });
        } else {
            res.status(400).json({ success: false, message: response.data.message || 'Error analizando alertas con Caitlyn.' });
        }
    } catch (error: any) {
        console.error('❌ Error en broker de alertas Caitlyn:', error.message);
        res.status(500).json({ success: false, message: 'Caitlyn no pudo procesar el resumen de alertas hoy.' });
    }
};
