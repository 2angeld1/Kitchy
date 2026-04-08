import Gasto from '../models/Gasto';
import Inventario from '../models/Inventario';

export const guardarGastoFacturaService = async (payload: any, negocioId: string, userId: string) => {
    const { proveedor, ruc, dv, total, subtotal, itbms, nroFactura, receptor, fecha, items } = payload;
    
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

    let actualizados = 0;
    if (items && Array.isArray(items)) {
        for (const item of items) {
            const itemInv = await Inventario.findOne({
                negocioId,
                nombre: new RegExp(`^${item.nombre}$`, 'i')
            });

            if (itemInv) {
                const multi = item.unidadesPorEmpaque || 1;
                const cantidadRealAAgregar = item.cantidad * multi;
                itemInv.cantidad += cantidadRealAAgregar;
                const nuevoCostoReportado = item.precioUnitario || 0;
                itemInv.costoUnitario = nuevoCostoReportado / multi;

                await itemInv.save();
                actualizados++;
            }
        }
    }

    return {
        success: true,
        message: `Factura procesada. Gasto registrado y ${actualizados} productos actualizados en stock.`,
        gasto: nuevoGasto
    };
};
