import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Negocio from '../models/Negocio';
import Venta from '../models/Venta';
import Gasto from '../models/Gasto';
import PDFDocument from 'pdfkit';

/**
 * Calcula el Balance Fiscal Panameño (Ventas vs Compras)
 * Esto le dice al dueño cuánto puede deducir de ITBMS.
 */
export const getFiscalBalance = async (req: AuthRequest, res: Response) => {
    try {
        const negocioId = req.negocioId;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // 1. Obtener Ventas del Mes
        const ventas = await Venta.find({
            negocioId,
            fecha: { $gte: startOfMonth }
        });

        // 2. Obtener Gastos (con ITBMS leídos por Caitlyn) del Mes
        const gastos = await Gasto.find({
            negocioId,
            fecha: { $gte: startOfMonth }
        });

        // ITBMS por Ventas (Asumimos 7% sobre el total si no está desglosado)
        let totalVentas = 0;
        let itbmsDebito = 0; // Lo que le debo a la DGI
        ventas.forEach(v => {
            totalVentas += v.total;
            // Kitchy asume que sus precios ya incluyen el 7% o lo calcula sobre el total
            itbmsDebito += v.total * 0.07; 
        });

        // ITBMS por Compras (Deducible - Leído de las facturas)
        let totalCompras = 0;
        let itbmsCredito = 0; // Lo que puedo deducir
        gastos.forEach(g => {
            totalCompras += g.monto;
            itbmsCredito += g.itbms || 0;
        });

        const provisionITBMS = itbmsDebito - itbmsCredito;

        res.json({
            periodo: startOfMonth,
            itbmsVentas: itbmsDebito.toFixed(2),
            itbmsCompras: itbmsCredito.toFixed(2),
            balanceFinal: provisionITBMS.toFixed(2),
            resumen: {
                totalVentas: totalVentas.toFixed(2),
                totalGastoInsumos: totalCompras.toFixed(2),
                mes: now.toLocaleString('es-PA', { month: 'long' })
            }
        });

    } catch (error: any) {
        console.error('Error al calcular balance fiscal:', error);
        res.status(500).json({ message: 'Error de cálculo fiscal', error: error.message });
    }
};

export const getProducerReport = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;

        const negocio = await Negocio.findById(id).populate('propietario', 'nombre email');
        if (!negocio) {
            return res.status(404).json({ message: 'Negocio no encontrado' });
        }

        const query: any = { negocioId: id };
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string)
            };
        }

        const ventas = await Venta.find(query).sort({ createdAt: -1 });

        // Crear PDF
        const doc = new PDFDocument({ margin: 50 });

        // Configurar respuesta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Reporte_${negocio.nombre}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('Estado de Cuenta Kitchy', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Negocio: ${negocio.nombre}`);
        doc.text(`Propietario: ${(negocio.propietario as any)?.nombre || 'N/A'}`);
        doc.text(`Fecha de Reporte: ${new Date().toLocaleDateString()}`);
        if (startDate && endDate) {
            doc.text(`Período: ${startDate} al ${endDate}`);
        }
        doc.moveDown();

        // Resumen Financiero
        doc.fontSize(14).text('Resumen Financiero', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(`Ventas Totales del Período: $${ventas.reduce((sum, v) => sum + v.total, 0).toFixed(2)}`);
        doc.text(`Comisión Acumulada: $${negocio.billing.balance.toFixed(2)}`);
        doc.text(`Estado de Pago: ${negocio.billing.paymentStatus.toUpperCase()}`);
        doc.moveDown();

        // Detalle de Ventas (Breve)
        doc.fontSize(14).text('Detalle de Ventas Recientes', { underline: true });
        doc.moveDown(0.5);

        ventas.slice(0, 20).forEach((venta: any) => {
            const fecha = venta.createdAt ? new Date(venta.createdAt).toLocaleDateString() : 'N/A';
            doc.fontSize(10).text(`${fecha} - Venta #${venta._id.toString().substring(18)}: $${venta.total.toFixed(2)}`);
        });

        if (ventas.length > 20) {
            doc.text('... y más ventas.');
        }

        // Footer
        doc.moveDown();
        doc.fillColor('gray').fontSize(10).text('Este es un documento generado automáticamente por la plataforma Kitchy.', { align: 'center' });

        doc.end();

    } catch (error: any) {
        console.error('Error generating PDF report:', error);
        res.status(500).json({ message: 'Error al generar el reporte', error: error.message });
    }
};
