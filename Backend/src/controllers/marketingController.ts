import { Response } from 'express';
import Venta from '../models/Venta';
import Negocio from '../models/Negocio';
import Cliente from '../models/Cliente';
import { AuthRequest } from '../middleware/auth';
import { sendSurveyEmail } from '../services/emailService';

export const obtenerVentasParaMarketing = async (req: AuthRequest, res: Response) => {
    try {
        const negocioId = req.negocioId;
        
        // Buscamos ventas que tengan clienteId y que no sean anónimas
        // Y que se hayan hecho en los últimos 7 días
        const sieteDiasAtras = new Date();
        sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 7);

        const ventas = await Venta.find({
            negocioId,
            clienteId: { $exists: true, $ne: null },
            createdAt: { $gte: sieteDiasAtras }
        })
        .populate('clienteId')
        .sort({ createdAt: -1 })
        .limit(20);

        res.json(ventas);
    } catch (error: any) {
        res.status(500).json({ message: 'Error al obtener ventas para marketing', error: error.message });
    }
};

export const enviarEncuestaVenta = async (req: AuthRequest, res: Response) => {
    try {
        const { ventaId } = req.body;
        const negocioId = req.negocioId;

        const venta: any = await Venta.findOne({ _id: ventaId, negocioId }).populate('clienteId');
        if (!venta) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        const cliente: any = venta.clienteId;
        if (!cliente || !cliente.email) {
            return res.status(400).json({ message: 'El cliente no tiene un correo electrónico registrado' });
        }

        const negocio = await Negocio.findById(negocioId);
        const businessName = negocio?.nombre || 'Kitchy Business';
        
        // Obtener el nombre del primer servicio/producto para el correo
        const serviceName = venta.items[0]?.nombreProducto || 'Servicio';

        await sendSurveyEmail(cliente.email, cliente.nombre, businessName, serviceName, venta._id.toString());

        // Marcar como enviada
        venta.encuestaEnviada = true;
        await venta.save();

        res.json({ message: 'Encuesta enviada correctamente a ' + cliente.email });
    } catch (error: any) {
        console.error('Error al enviar encuesta:', error);
        res.status(500).json({ message: 'Error al enviar la encuesta', error: error.message });
    }
};
