import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { uploadImage } from '../utils/imageUpload';
import Producto from '../models/Producto';
import Gasto from '../models/Gasto';
import Venta from '../models/Venta';
import Inventario from '../models/Inventario';
import Negocio from '../models/Negocio';
import MovimientoInventario from '../models/MovimientoInventario';
import User from '../models/User';
import { RecetaSugerida } from '../models/RecetaSugerida';
import axios from 'axios';
import { getLatestContext, updateFuelContext, updateMarketPrices, updateAcodecoPrices } from '../services/marketContextService';

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
        const { productName, currentData } = req.body;
        const negocioId = req.negocioId;
        const userId = req.userId;

        const user = await User.findById(userId).select('nombre');
        const userName = user?.nombre || 'Socio/a';

        console.log(`🧠 Caitlyn generando insight automático (Negocio: ${negocioId}, Usuario: ${userName})`);

        // 1. Recolectar Contexto del Mercado de Panamá
        let marketContext: any = {};
        try {
            console.log(`⏱️ [NODE] Recuperando contexto del mercado local de la DB...`);
            marketContext = await getLatestContext();
            console.log(`✅ [NODE] Contexto cargado exitosamente.`);
        } catch (ctxErr: any) {
            console.warn(`⚠️ [NODE] No se pudo obtener contexto, pero se seguirá el proceso: ${ctxErr.message}`);
        }

        let businessStats: any = {};

        if (productName || currentData) {
            // Caso específico de un producto (o simulación)
            const searchName = currentData?.nombre || productName;
            const producto = await Producto.findOne({ nombre: new RegExp(searchName, 'i'), negocioId })
                .populate('ingredientes.inventario');

            if (currentData) {
                 // Enriquecer ingredientes temporales con datos de inventario real
                 let enrichedIngredients = [];
                 if (currentData.ingredientes && Array.isArray(currentData.ingredientes)) {
                     const invIds = currentData.ingredientes
                         .map((i: any) => i.inventario)
                         .filter((id: any) => id && typeof id === 'string' && id.length === 24 && id !== 'NONE');
                     const invItems = await Inventario.find({ _id: { $in: invIds } });
                     
                            enrichedIngredients = currentData.ingredientes.map((ing: any) => {
                             const targetId = (ing.inventario?._id || ing.inventario)?.toString();
                             const invItem = targetId ? invItems.find((i: any) => i._id.toString() === targetId) : null;
                             return {
                              nombre: invItem?.nombre || 'Desconocido',
                              costo: invItem?.costoUnitario || 0,
                              unidad: invItem?.unidad || 'unid',
                              cantidad: ing.cantidad
                          };
                      });
                 }

                 businessStats = {
                     tipo: producto ? 'PRODUCTO_EDITADO' : 'PRODUCTO_SIMULADO',
                     nombre: searchName,
                     precioActual: currentData.precio || (producto?.precio || 0),
                     precioTargetMatematico: currentData.precioSugerido || null,
                     ventas30Dias: 0,
                     ingredientes: enrichedIngredients
                 };

                 if (producto) {
                     const ventasRecientes = await Venta.find({
                         negocioId,
                         'productos.producto': producto._id,
                         fecha: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                     });
                     businessStats.ventas30Dias = ventasRecientes.length;
                 }
                // 💡 PASO EXTRA: Consultar Movimientos de Inventario para AUDITORÍA
                const invIds = businessStats.ingredientes
                    .map((i: any) => i.inventario?._id || i.idInventario)
                    .filter(Boolean);

                const movimientosRecientes = await MovimientoInventario.find({
                    inventario: { $in: invIds },
                    negocioId,
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                });

                // Agrupar movimientos por tipo para Caitlyn
                businessStats.audit_movimientos = {
                    entradas: movimientosRecientes.filter(m => m.tipo === 'entrada').length,
                    mermas: movimientosRecientes.filter(m => m.tipo === 'merma').length,
                    ajustes: movimientosRecientes.filter(m => m.tipo === 'ajuste').length,
                    total_cantidad_merma: movimientosRecientes.filter(m => m.tipo === 'merma').reduce((acc, m) => acc + m.cantidad, 0)
                };

                console.log(`📊 [NODE] Auditoría de Movimientos integrada (${movimientosRecientes.length} registros).`);
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
                ingresosMes: ventasMes.reduce((acc, v) => acc + (v.total || 0), 0)
            };
        }

        // 3. Empaquetar y enviar al Microservicio de IA
        const payload = {
            negocio_id: negocioId,
            product_name: productName,
            market_context: marketContext,
            business_data: businessStats,
            user_name: userName,
            config: {
                tipo_negocio: (req as any).userRole || 'GASTRONOMIA'
            }
        };

        console.log(`🚀 [Node -> Python] Pidiendo consejo a ${CAITLYN_URL}/agent/business/advice ... (Timeout de 45s)`);
        
        try {
            const response = await axios.post(`${CAITLYN_URL}/agent/business/advice`, payload, { timeout: 45000 });
            console.log(`✅ [Node <- Python] IA Respondió OK con estatus ${response.status}`);

            if (response.data.success) {
                return res.json({
                    success: true,
                    message: response.data.message,
                    caitlyn_reasoning: response.data.caitlyn_reasoning || response.data.data,
                    contextUsed: {
                        clima: !!marketContext.WEATHER,
                        gasolina: !!marketContext.FUEL,
                        merca: !!marketContext.MERCA
                    }
                });
            } else {
                return res.status(400).json({ success: false, message: response.data.error || response.data.message || 'La IA falló sin mandar motivo.' });
            }
        } catch (axErr: any) {
            const errorMsg = axErr.response?.data?.message || axErr.message;
            console.error(`❌ [Node] Error o Timeout al llamar a Caitlyn en Python:`, errorMsg);
            return res.status(500).json({
                success: false,
                message: 'El cerebro de Caitlyn tomó más de lo esperado y cortamos la llamada.',
                details: errorMsg
            });
        }

    } catch (error: any) {
        console.error('❌ Error GLOBAL en broker de Caitlyn Node:', error);
        res.status(500).json({ success: false, message: 'Falla total en el enlace con inteligencia artificial.' });
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

        // 2. Obtener TODO el inventario con COSTOS y el contexto de mercado
        const inventario = await Inventario.find({ negocioId }).select('nombre unidad cantidad costoUnitario _id');
        const marketContext = await getLatestContext();

        // 💡 PASO EXTRA: MEMORIA MAESTRA - Consultar si ya existe esta receta en la DB
        const recetaCache: any = await (RecetaSugerida as any).findOne({ nombrePlato: new RegExp(`^${nombrePlato}$`, 'i') });

        if (recetaCache) {
            console.log(`🧠 [CACHE] Caitlyn recuperó "${nombrePlato}" de su Memoria Maestra (DB).`);
            
            // Recalcular costos con el inventario actual para que los precios sean frescos
            let costoTotalCache = 0;
            const recipeWithFreshCosts = recetaCache.ingredientes.map((ing: any) => {
                const itemInv: any = (ing.idInventario && typeof ing.idInventario === 'string' && ing.idInventario.length === 24)
                    ? inventario.find((i: any) => i._id.toString() === ing.idInventario.toString())
                    : null;
                
                const costoItem = itemInv ? itemInv.costoUnitario : (ing.costoEstimado || 0);
                const subtotal = (ing.cantidad || 0) * costoItem;
                costoTotalCache += subtotal;

                return {
                    nombre: ing.nombre,
                    cantidad: ing.cantidad,
                    unidad: ing.unidad,
                    inventario: ing.idInventario,
                    costo_estimado: costoItem,
                    stock_status: itemInv ? (itemInv.cantidad > 0 ? 'checkmark-circle' : 'alert-circle') : 'help-circle'
                };
            });

            const precioSugeridoCache = Math.ceil((costoTotalCache / (1 - (margenObjetivo / 100))));

            const faltantesCache = recipeWithFreshCosts
                .filter((i: any) => i.stock_status !== 'checkmark-circle')
                .map((i: any) => i.nombre);

            return res.json({
                success: true,
                recipe: recipeWithFreshCosts,
                costoTotal: costoTotalCache,
                precioSugerido: precioSugeridoCache,
                margenAplicado: margenObjetivo,
                faltantes: faltantesCache,
                from_cache: true
            });
        }

        // 3. Consultar a Caitlyn (IA) - Si no estaba en cache
        const response = await axios.post(`${CAITLYN_URL}/agent/recipe/suggest`, {
            negocio_id: negocioId,
            dish_name: nombrePlato,
            serving_size: servingSize,
            category: categoria,
            inventory: inventario.map(i => i.toObject()),
            market_context: marketContext,
            target_margin: margenObjetivo
        });

        if (response.data.success) {
            const recipeSuggestions = response.data.recipe || [];

            // 4. Identificar Faltantes (Insumos que no están en inventario o tienen stock 0)
            const faltantes = recipeSuggestions.filter((ingSuggested: any) => {
                const nombreSugerido = (ingSuggested.nombre || ingSuggested.insumo || "").toLowerCase();
                const enInventario = inventario.find((inv: any) => {
                    const nombreInv = (inv.nombre || "").toLowerCase();
                    return nombreInv.includes(nombreSugerido) || nombreSugerido.includes(nombreInv);
                });
                return !enInventario || enInventario.cantidad <= 0;
            }).map((f: any) => f.nombre || f.insumo);

            console.log(`✅ [NODE] Caitlyn respondió con éxito. Procediendo a guardar en Memoria Maestra...`);
            res.json({
                success: true,
                recipe: recipeSuggestions,
                costoTotal: response.data.costoTotal,
                precioSugerido: response.data.precioSugerido,
                margenAplicado: margenObjetivo,
                faltantes
            });

            // 💡 PASO EXTRA: GUARDAR EN MEMORIA MAESTRA para la próxima vez
            try {
                console.log(`💾 [MEMORIA] Intentando guardar receta para: ${nombrePlato}...`);
                await (RecetaSugerida as any).create({
                    nombrePlato: nombrePlato,
                    categoria: categoria,
                    servingSize: servingSize,
                    ingredientes: recipeSuggestions.map((ing: any) => ({
                        nombre: ing.nombre,
                        cantidad: ing.cantidad,
                        unidad: ing.unidad,
                        idInventario: ing.inventario && ing.inventario !== 'null' && ing.inventario !== 'NONE' ? ing.inventario : null,
                        costoEstimado: ing.costo_estimado
                    })),
                    costoTotal: response.data.costoTotal,
                    precioSugerido: response.data.precioSugerido,
                    negocioId: negocioId
                });
                console.log(`✨ [MEMORIA] ¡Receta de "${nombrePlato}" guardada exitosamente en DB!`);
            } catch (saveErr: any) {
                console.warn(`⚠️ [MEMORIA] Error al guardar en cache (${nombrePlato}):`, saveErr.message);
                if (saveErr.code === 11000) {
                    console.log(`ℹ️ [MEMORIA] La receta ya existía en la base de datos.`);
                }
            }
        } else {
            console.warn(`❌ [NODE] Caitlyn respondió con error:`, response.data.error);
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
        const user = await User.findById(req.userId).select('nombre');
        const userName = user?.nombre || 'Socio/a';
        if (!alerts || !Array.isArray(alerts)) {
            return res.status(400).json({ success: false, message: 'No se enviaron alertas válidas.' });
        }

        // 1. Delegar a Caitlyn en Python (8000)
        console.log(`🤖 Caitlyn analizando ${alerts.length} alertas del Dashboard (Negocio: ${req.negocioId})...`);
        const response = await axios.post(`${CAITLYN_URL}/agent/business/dashboard-alerts`, { 
            alerts,
            negocio_id: req.negocioId,
            user_name: userName
        });

        if (response.data.success) {
            res.json({
                success: true,
                message: response.data.message,
                source: response.data.source // <--- Nuevo: Pasar la fuente (MEMORY/AI)
            });
        } else {
            res.status(400).json({ success: false, message: response.data.message || 'Error analizando alertas con Caitlyn.' });
        }
    } catch (error: any) {
        console.error('❌ Error en broker de alertas Caitlyn:', error.message);
        res.status(500).json({ success: false, message: 'Caitlyn no pudo procesar el resumen de alertas hoy.' });
    }
};

/**
 * Pide a Caitlyn ideas de menú basadas en el inventario actual.
 */
export const sugerirMenuIdeas = async (req: AuthRequest, res: Response) => {
    try {
        const negocioId = (req as any).negocioId || req.query.negocioId;
        const user = await User.findById(req.userId).select('nombre');
        const userName = user?.nombre || 'Socio/a';

        if (!negocioId) {
            return res.status(400).json({ message: 'Negocio ID requerido' });
        }

        const negocio = await Negocio.findById(negocioId);
        const margenObjetivo = negocio?.config?.margenObjetivo || 65;

        // Obtener inventario
        const inventario = await Inventario.find({ negocioId });
        
        console.log(`🤖 Caitlyn analizando inventario (${inventario.length} items) para sugerir nuevas recetas...`);
        const response = await axios.post(`${CAITLYN_URL}/agent/menu-ideas/suggest`, {
            negocio_id: negocioId,
            inventory_list: inventario.map(i => i.toObject()), // Pasamos crudo
            target_margin: margenObjetivo,
            user_name: userName
        });

        if (response.data.success) {
            res.json({
                success: true,
                ideas: response.data.ideas, // <--- CAMBIO: Python ahora devuelve 'ideas'
                source: response.data.source,
                message: response.data.message
            });
        } else {
            console.error('❌ Error devuelto por Caitlyn Python:', response.data.error || response.data.message);
            res.status(400).json({ 
                success: false, 
                message: response.data.message || 'Error consultando al Chef Maestro.',
                detail: response.data.error
            });
        }
    } catch (error: any) {
        console.error('❌ Error pidiendo ideas de menú a Caitlyn:', error.message);
        res.status(500).json({ success: false, message: 'No se pudo conectar con Caitlyn para las ideas de menú.' });
    }
};
/**
 * Permite que Caitlyn aprenda la relación entre un texto de factura y un ID de inventario.
 */
export const aprenderAliasVisual = async (req: AuthRequest, res: Response) => {
    try {
        const { invoice_text, product_id } = req.body;
        if (!invoice_text || !product_id) return res.status(400).json({ success: false, message: 'Faltan datos' });

        const response = await axios.post(`${CAITLYN_URL}/agent/vision/learn-alias`, { 
            invoice_text, 
            product_id,
            negocio_id: req.negocioId 
        });
        return res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error de aprendizaje visual' });
    }
};

/**
 * Cruza los productos extraídos de una factura con el inventario real del negocio.
 */
export const buscarMatchesVisuales = async (req: AuthRequest, res: Response) => {
    try {
        const { extracted_items } = req.body;
        const negocioId = req.negocioId;

        if (!extracted_items || !Array.isArray(extracted_items)) {
            return res.status(400).json({ success: false, message: 'Datos de factura inválidos' });
        }

        // Obtener inventario actual para comparar
        const inventario = await Inventario.find({ negocioId }).select('nombre unidad _id');

        const response = await axios.post(`${CAITLYN_URL}/agent/vision/match-products`, {
            extracted_items,
            inventory_items: inventario,
            negocio_id: negocioId
        });

        return res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error cruzando productos con inventario' });
    }
};

/**
 * M\u00d3DULO PRESUPUESTARIO: Procesa una lista de compras y estima precios (Node Proxy)
 */
export const parseShoppingList = async (req: AuthRequest, res: Response) => {
    try {
        const { text, image } = req.body;
        console.log(`🤖 Caitlyn analizando lista de compras para el presupuesto...`);
        
        const response = await axios.post(`${CAITLYN_URL}/agent/shopping/parse`, {
            text,
            image
        });

        if (response.data.success) {
            res.json(response.data);
        } else {
            res.status(400).json({ success: false, message: response.data.error || 'Error procesando presupuesto.' });
        }
    } catch (error: any) {
        console.error('❌ Error pidiendo presupuesto a Caitlyn:', error.message);
        res.status(500).json({ success: false, message: 'Caitlyn no pudo parsear el presupuesto hoy.' });
    }
};

/**
 * Reportar un precio real para que Caitlyn aprenda (Node Proxy)
 */
export const aprenderPrecio = async (req: AuthRequest, res: Response) => {
    try {
        const { item_name, price } = req.body;
        const negocioId = req.negocioId;

        const response = await axios.post(`${CAITLYN_URL}/agent/shopping/learn-price`, {
            item_name,
            price,
            negocio_id: negocioId
        });

        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error en aprendizaje de precio' });
    }
};
