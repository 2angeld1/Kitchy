import axios from 'axios';
import User from '../../models/User';
import Negocio from '../../models/Negocio';
import Producto from '../../models/Producto';
import Inventario from '../../models/Inventario';
import { RecetaSugerida } from '../../models/RecetaSugerida';
import { getLatestContext } from '../../services/marketContextService';

const CAITLYN_URL = process.env.CAITLYN_URL || 'http://localhost:8000';

export const consultarCosteoPorNombreService = async (nombre: string, negocioId: string) => {
    const producto = await Producto.findOne({
        nombre: new RegExp(nombre, 'i'),
        negocioId
    }).populate('ingredientes.inventario');

    if (!producto) {
        throw new Error('No encontré ese producto.');
    }

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

    return {
        nombre: producto.nombre,
        precioActual: producto.precio,
        costoTotal: costoTotal.toFixed(2),
        margenActual: margenActual.toFixed(1) + '%',
        desglose,
        sugerencias: {
            ideal: (costoTotal / 0.30).toFixed(2),
            competitivo: (costoTotal / 0.40).toFixed(2)
        }
    };
};

export const sugerirRecetaService = async (nombrePlato: string, servingSize: string, categoria: string, negocioId: string) => {
    const negocio = await Negocio.findById(negocioId);
    const margenObjetivo = negocio?.config?.margenObjetivo || 65;

    const inventario = await Inventario.find({ negocioId }).select('nombre unidad cantidad costoUnitario _id');
    const marketContext = await getLatestContext();

    const recetaCache: any = await (RecetaSugerida as any).findOne({ nombrePlato: new RegExp(`^${nombrePlato}$`, 'i') });

    if (recetaCache) {
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

        return {
            success: true,
            recipe: recipeWithFreshCosts,
            costoTotal: costoTotalCache,
            precioSugerido: precioSugeridoCache,
            margenAplicado: margenObjetivo,
            faltantes: faltantesCache,
            from_cache: true
        };
    }

    const response = await axios.post(`${CAITLYN_URL}/agent/recipe/suggest`, {
        negocio_id: negocioId,
        dish_name: nombrePlato,
        serving_size: servingSize,
        category: categoria,
        inventory: inventario.map((i: any) => i.toObject()),
        market_context: marketContext,
        target_margin: margenObjetivo
    });

    if (response.data.success) {
        const recipeSuggestions = response.data.recipe || [];

        const faltantes = recipeSuggestions.filter((ingSuggested: any) => {
            const nombreSugerido = (ingSuggested.nombre || ingSuggested.insumo || "").toLowerCase();
            const enInventario = inventario.find((inv: any) => {
                const nombreInv = (inv.nombre || "").toLowerCase();
                return nombreInv.includes(nombreSugerido) || nombreSugerido.includes(nombreInv);
            });
            return !enInventario || enInventario.cantidad <= 0;
        }).map((f: any) => f.nombre || f.insumo);

        try {
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
        } catch (saveErr: any) {
            console.warn(`⚠️ [MEMORIA] Error al guardar en cache (${nombrePlato}):`, saveErr.message);
        }

        return {
            success: true,
            recipe: recipeSuggestions,
            costoTotal: response.data.costoTotal,
            precioSugerido: response.data.precioSugerido,
            margenAplicado: margenObjetivo,
            faltantes
        };
    } else {
        throw new Error(response.data.error || 'Caitlyn no pudo generar la receta');
    }
};

export const sugerirMenuIdeasService = async (negocioId: string, userId: string) => {
    const user = await User.findById(userId).select('nombre');
    const userName = user?.nombre || 'Socio/a';

    const negocio = await Negocio.findById(negocioId);
    const margenObjetivo = negocio?.config?.margenObjetivo || 65;

    const inventario = await Inventario.find({ negocioId });
    
    const response = await axios.post(`${CAITLYN_URL}/agent/menu-ideas/suggest`, {
        negocio_id: negocioId,
        inventory_list: inventario.map((i: any) => i.toObject()),
        target_margin: margenObjetivo,
        user_name: userName
    });

    if (response.data.success) {
        return {
            success: true,
            ideas: response.data.ideas,
            source: response.data.source,
            message: response.data.message
        };
    } else {
        throw new Error(response.data.error || response.data.message || 'Error consultando al Chef Maestro.');
    }
};
