import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Negocio from '../models/Negocio';
import Venta from '../models/Venta';
import PDFDocument from 'pdfkit';

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
