import Venta from '../models/Venta';
import Producto from '../models/Producto';
import Inventario from '../models/Inventario';
import Negocio from '../models/Negocio';
import Cliente from '../models/Cliente';

export const crearVentaService = async (
    items: any[],
    metodoPago: string,
    cliente: any,
    notas: string,
    especialista: any,
    userId: string,
    negocioId: string,
    pagoCombinado?: any[]
) => {
    // Procesar items y calcular totales
    const itemsProcesados = [];
    let total = 0;

    // Array para guardar las deducciones necesarias del inventario
    const deduccionesInventario: { inventarioId: any, cantidadADescontar: number }[] = [];

    for (const item of items) {
        let itemData = null;
        const isManual = String(item.productoId).startsWith('manual-');

        // Solo buscar en DB si es un ID de Mongo válido y no es un item manual
        if (!isManual && item.productoId && item.productoId.length === 24) {
            itemData = await Producto.findOne({ _id: item.productoId, negocioId });
        }

        let nombreProducto = item.nombre || '';
        let precioUnitario = item.precio || 0;
        let finalId = isManual ? null : item.productoId;

        if (itemData) {
            if (!itemData.disponible) {
                throw new Error(`Producto no disponible: ${itemData.nombre}`);
            }
            nombreProducto = itemData.nombre;
            precioUnitario = itemData.precio;
            finalId = itemData._id;

            // Si tiene receta, descontar ingredientes
            if (itemData.ingredientes && itemData.ingredientes.length > 0) {
                for (const ingrediente of itemData.ingredientes) {
                    deduccionesInventario.push({
                        inventarioId: ingrediente.inventario,
                        cantidadADescontar: ingrediente.cantidad * item.cantidad
                    });
                }
            }
        } else if (!isManual) {
            // Si no es manual y no se encontró en Producto, buscamos en Inventario directamente (para reventa)
            const itemInv = await Inventario.findOne({ _id: item.productoId, negocioId });
            if (itemInv) {
                nombreProducto = itemInv.nombre;
                precioUnitario = itemInv.precioVenta || itemInv.costoUnitario;
                finalId = itemInv._id;
                
                // Descontar el item mismo del inventario
                deduccionesInventario.push({
                    inventarioId: itemInv._id,
                    cantidadADescontar: item.cantidad
                });
            } else {
                // Si llegamos aquí y no es manual, es que el ID era basura o de otro negocio
                throw new Error(`Item no encontrado: ${item.productoId}`);
            }
        }

        const subtotal = precioUnitario * item.cantidad;
        itemsProcesados.push({
            producto: finalId,
            nombreProducto,
            cantidad: item.cantidad,
            precioUnitario,
            subtotal
        });
        total += subtotal;
    }

    // Procesar identificación de Cliente para Loyalty
    let clienteFinalId = null;
    let nombreClienteDisplay = '';

    if (cliente) {
        // cliente puede ser un string (viejo) o un objeto {nombre, telefono, email...}
        if (typeof cliente === 'object') {
            const { nombre, telefono, email, esFrecuente, especialistaFrecuente } = cliente;
            nombreClienteDisplay = nombre;

            // Intentar encontrar cliente por teléfono o email en este negocio
            let clienteDoc = null;
            if (telefono) {
                clienteDoc = await Cliente.findOne({ negocioId, telefono });
            }
            if (!clienteDoc && email) {
                clienteDoc = await Cliente.findOne({ negocioId, email });
            }

            if (clienteDoc) {
                // Actualizar cliente existente
                clienteDoc.conteoVisitas += 1;
                clienteDoc.totalGastado += total;
                clienteDoc.ultimaVisita = new Date();
                // Si viene como frecuente en esta venta, lo marcamos
                if (esFrecuente) {
                    clienteDoc.esFrecuente = true;
                    if (especialistaFrecuente) clienteDoc.especialistaFrecuente = especialistaFrecuente;
                }
                await clienteDoc.save();
                clienteFinalId = clienteDoc._id;
            } else if (nombre && nombre !== 'Anónimo') {
                // Crear nuevo cliente
                const nuevoCliente = new Cliente({
                    nombre,
                    telefono,
                    email,
                    esFrecuente: esFrecuente || false,
                    especialistaFrecuente: esFrecuente ? especialistaFrecuente : null,
                    conteoVisitas: 1,
                    totalGastado: total,
                    ultimaVisita: new Date(),
                    negocioId
                });
                await nuevoCliente.save();
                clienteFinalId = nuevoCliente._id;
            }
        } else {
            nombreClienteDisplay = cliente;
        }
    }

    const venta = new Venta({
        items: itemsProcesados,
        total,
        metodoPago: (metodoPago as any) || 'efectivo',
        usuario: userId,
        negocioId: negocioId,
        cliente: nombreClienteDisplay || 'Anónimo',
        clienteId: clienteFinalId,
        notas,
        especialista,
        pagoCombinado
    });

    await venta.save();

    // Actualizar ventas acumuladas del negocio para el pilotaje/facturación
    const negocio = await Negocio.findById(negocioId);
    if (negocio) {
        const ahora = new Date();
        const fechaLimite = new Date(negocio.billingCycleStart);
        fechaLimite.setMonth(fechaLimite.getMonth() + 1);

        if (ahora > fechaLimite) {
            // Reiniciar ciclo si pasó un mes
            negocio.accumulatedSalesMonth = total;
            negocio.billingCycleStart = ahora;
        } else {
            negocio.accumulatedSalesMonth += total;
        }

        // Calcular comisión de esta venta basada en el acumulado mensual
        // Tiers: <700: 5%, 701-2000: 3%, >2000: 2%
        let porcentajeComision = 0.05;
        if (negocio.accumulatedSalesMonth > 2000) {
            porcentajeComision = 0.02;
        } else if (negocio.accumulatedSalesMonth > 700) {
            porcentajeComision = 0.03;
        }

        const comisionEstaVenta = total * porcentajeComision;

        // Actualizar balance y estadísticas de vida
        negocio.billing.balance += comisionEstaVenta;
        negocio.totalSalesLifetime += total;
        negocio.totalCommissionLifetime += comisionEstaVenta;

        // Actualizar estado de pago si tiene deuda considerable
        if (negocio.billing.balance > 50 && negocio.billing.paymentStatus === 'al_dia') {
            negocio.billing.paymentStatus = 'pendiente';
        }

        await negocio.save();
    }

    // Aplicar todas las deducciones del inventario (FILTRADO POR NEGOCIO)
    for (const deduccion of deduccionesInventario) {
        await Inventario.findOneAndUpdate(
            { _id: deduccion.inventarioId, negocioId },
            { $inc: { cantidad: -deduccion.cantidadADescontar } }
        );
    }

    // Populate para devolver datos completos
    await venta.populate('usuario', 'nombre email');

    return { 
        venta, 
        inventarioActualizado: true,
        deduccionesAplicadas: deduccionesInventario.length > 0
    };
};

export const actualizarVentaService = async (
    id: string,
    items: any[],
    metodoPago: string,
    cliente: any,
    notas: string,
    especialista: any,
    userId: string,
    negocioId: string,
    pagoCombinado?: any[]
) => {
    const ventaAnterior = await Venta.findOne({ _id: id, negocioId });
    if (!ventaAnterior) {
        throw new Error('NOT_FOUND');
    }

    let negocio = await Negocio.findById(negocioId);
    
    // ------------- 1. REVERTIR VENTA ANTERIOR -------------
    if (negocio) {
        let porcentajeAnterior = 0.05;
        if (negocio.accumulatedSalesMonth > 2000) porcentajeAnterior = 0.02;
        else if (negocio.accumulatedSalesMonth > 700) porcentajeAnterior = 0.03;
        
        const comisionAnterior = ventaAnterior.total * porcentajeAnterior;
        negocio.accumulatedSalesMonth = Math.max(0, negocio.accumulatedSalesMonth - ventaAnterior.total);
        negocio.billing.balance = Math.max(0, negocio.billing.balance - comisionAnterior);
        negocio.totalSalesLifetime = Math.max(0, negocio.totalSalesLifetime - ventaAnterior.total);
        negocio.totalCommissionLifetime = Math.max(0, negocio.totalCommissionLifetime - comisionAnterior);
        
        if (negocio.billing.balance <= 50 && negocio.billing.paymentStatus === 'pendiente') {
            negocio.billing.paymentStatus = 'al_dia';
        }
    }

    // Revertir inventario anterior
    for (const item of ventaAnterior.items) {
        const isManual = item.producto == null || String(item.producto).startsWith('manual-');
        if (isManual) continue;
        
        const prod = await Producto.findOne({ _id: item.producto, negocioId });
        if (prod && prod.ingredientes && prod.ingredientes.length > 0) {
            for (const ing of prod.ingredientes) {
                await Inventario.findOneAndUpdate(
                    { _id: ing.inventario, negocioId },
                    { $inc: { cantidad: ing.cantidad * item.cantidad } }
                );
            }
        } else {
            await Inventario.findOneAndUpdate(
                { _id: item.producto, negocioId },
                { $inc: { cantidad: item.cantidad } }
            );
        }
    }

    // ------------- 2. APLICAR NUEVA VENTA -------------
    const itemsProcesados = [];
    let total = 0;
    const deduccionesInventario: { inventarioId: any, cantidadADescontar: number }[] = [];

    for (const item of items) {
        let itemData = null;
        const isManual = String(item.productoId).startsWith('manual-');

        if (!isManual && item.productoId && item.productoId.length === 24) {
            itemData = await Producto.findOne({ _id: item.productoId, negocioId });
        }

        let nombreProducto = item.nombre || '';
        let precioUnitario = item.precio || 0;
        let finalId = isManual ? null : item.productoId;

        if (itemData) {
            if (!itemData.disponible) {
                throw new Error(`Producto no disponible: ${itemData.nombre}`);
            }
            nombreProducto = itemData.nombre;
            precioUnitario = itemData.precio;
            finalId = itemData._id;

            if (itemData.ingredientes && itemData.ingredientes.length > 0) {
                for (const ing of itemData.ingredientes) {
                    deduccionesInventario.push({
                        inventarioId: ing.inventario,
                        cantidadADescontar: ing.cantidad * item.cantidad
                    });
                }
            }
        } else if (!isManual) {
            const itemInv = await Inventario.findOne({ _id: item.productoId, negocioId });
            if (itemInv) {
                nombreProducto = itemInv.nombre;
                precioUnitario = itemInv.precioVenta || itemInv.costoUnitario;
                finalId = itemInv._id;
                deduccionesInventario.push({
                    inventarioId: itemInv._id,
                    cantidadADescontar: item.cantidad
                });
            } else {
                throw new Error(`Item no encontrado: ${item.productoId}`);
            }
        }

        const subtotal = precioUnitario * item.cantidad;
        itemsProcesados.push({
            producto: finalId,
            nombreProducto,
            cantidad: item.cantidad,
            precioUnitario,
            subtotal
        });
        total += subtotal;
    }

    ventaAnterior.items = itemsProcesados;
    ventaAnterior.total = total;
    ventaAnterior.metodoPago = (metodoPago as any) || ventaAnterior.metodoPago;
    ventaAnterior.cliente = cliente !== undefined ? cliente : ventaAnterior.cliente;
    ventaAnterior.notas = notas !== undefined ? notas : ventaAnterior.notas;
    ventaAnterior.especialista = especialista !== undefined ? especialista : ventaAnterior.especialista;
    ventaAnterior.pagoCombinado = pagoCombinado !== undefined ? pagoCombinado : ventaAnterior.pagoCombinado;

    await ventaAnterior.save();

    if (negocio) {
        negocio.accumulatedSalesMonth += total;
        
        let porcentajeNuevo = 0.05;
        if (negocio.accumulatedSalesMonth > 2000) porcentajeNuevo = 0.02;
        else if (negocio.accumulatedSalesMonth > 700) porcentajeNuevo = 0.03;

        const comisionNueva = total * porcentajeNuevo;
        negocio.billing.balance += comisionNueva;
        negocio.totalSalesLifetime += total;
        negocio.totalCommissionLifetime += comisionNueva;

        if (negocio.billing.balance > 50 && negocio.billing.paymentStatus === 'al_dia') {
            negocio.billing.paymentStatus = 'pendiente';
        }
        await negocio.save();
    }

    for (const ded of deduccionesInventario) {
        await Inventario.findOneAndUpdate(
            { _id: ded.inventarioId, negocioId },
            { $inc: { cantidad: -ded.cantidadADescontar } }
        );
    }

    await ventaAnterior.populate('usuario', 'nombre email');

    return ventaAnterior;
};
