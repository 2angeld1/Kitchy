import axios from 'axios';
import User from '../../models/User';
import Producto from '../../models/Producto';
import Venta from '../../models/Venta';
import Inventario from '../../models/Inventario';
import MovimientoInventario from '../../models/MovimientoInventario';
import { getLatestContext } from '../../services/marketContextService';

const CAITLYN_URL = process.env.CAITLYN_URL || 'http://localhost:8000';

export const obtenerConsejoNegocioService = async (productName: string, currentData: any, negocioId: string, userId: string, userRole: string) => {
    const user = await User.findById(userId).select('nombre');
    const userName = user?.nombre || 'Socio/a';

    let marketContext: any = {};
    try {
        marketContext = await getLatestContext();
    } catch (ctxErr: any) {
        console.warn(`⚠️ [NODE] No se pudo obtener contexto: ${ctxErr.message}`);
    }

    let businessStats: any = {};

    if (productName || currentData) {
        const searchName = currentData?.nombre || productName;
        const producto = await Producto.findOne({ nombre: new RegExp(searchName, 'i'), negocioId })
            .populate('ingredientes.inventario');

        if (currentData) {
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

            const invIds = businessStats.ingredientes
                .map((i: any) => i.inventario?._id || i.idInventario)
                .filter(Boolean);

            const movimientosRecientes = await MovimientoInventario.find({
                inventario: { $in: invIds },
                negocioId,
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            });

            businessStats.audit_movimientos = {
                entradas: movimientosRecientes.filter((m: any) => m.tipo === 'entrada').length,
                mermas: movimientosRecientes.filter((m: any) => m.tipo === 'merma').length,
                ajustes: movimientosRecientes.filter((m: any) => m.tipo === 'ajuste').length,
                total_cantidad_merma: movimientosRecientes.filter((m: any) => m.tipo === 'merma').reduce((acc: number, m: any) => acc + m.cantidad, 0)
            };
        }
    } else {
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

    const payload = {
        negocio_id: negocioId,
        product_name: productName,
        market_context: marketContext,
        business_data: businessStats,
        user_name: userName,
        config: {
            tipo_negocio: userRole || 'GASTRONOMIA'
        }
    };

    const response = await axios.post(`${CAITLYN_URL}/agent/business/advice`, payload, { timeout: 45000 });
    
    if (response.data.success) {
        return {
            success: true,
            message: response.data.message,
            caitlyn_reasoning: response.data.caitlyn_reasoning || response.data.data,
            contextUsed: {
                clima: !!marketContext.WEATHER,
                gasolina: !!marketContext.FUEL,
                merca: !!marketContext.MERCA
            }
        };
    } else {
        throw new Error(response.data.error || response.data.message || 'La IA falló sin mandar motivo.');
    }
};

export const analizarAlertasDashboardService = async (alerts: any[], negocioId: string, userId: string) => {
    const user = await User.findById(userId).select('nombre');
    const userName = user?.nombre || 'Socio/a';

    const response = await axios.post(`${CAITLYN_URL}/agent/business/dashboard-alerts`, { 
        alerts,
        negocio_id: negocioId,
        user_name: userName
    });

    if (response.data.success) {
        return {
            success: true,
            message: response.data.message,
            source: response.data.source
        };
    } else {
        throw new Error(response.data.message || 'Error analizando alertas con Caitlyn.');
    }
};
