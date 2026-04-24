import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Reserva, { IReserva } from '../models/Reserva';
import Cliente from '../models/Cliente';
import Negocio from '../models/Negocio';
import { sendReservationEmail } from '../services/emailService';
import { emitToBusiness } from '../config/socket';

/**
 * Crear una nueva reserva y enviar confirmación por email
 */
export const crearReserva = async (req: AuthRequest, res: Response) => {
    try {
        const { 
            nombreCliente, emailCliente, telefonoCliente, 
            fecha, horaInicio, recursoId, nombreRecurso, 
            tipo, numPersonas, notas, clienteId 
        } = req.body;

        let finalClienteId = clienteId;

        // 1. Si no hay clienteId, buscamos por email/teléfono o creamos uno nuevo (Smart Logic)
        if (!finalClienteId) {
            const existingCliente = await Cliente.findOne({ 
                negocioId: req.negocioId,
                $or: [
                    { email: emailCliente?.toLowerCase() },
                    { telefono: telefonoCliente }
                ]
            });

            if (existingCliente) {
                finalClienteId = existingCliente._id;
            } else {
                // Crear nuevo cliente automáticamente para futuras sugerencias
                const nuevoCliente = new Cliente({
                    nombre: nombreCliente,
                    email: emailCliente,
                    telefono: telefonoCliente,
                    negocioId: req.negocioId
                });
                await nuevoCliente.save();
                finalClienteId = nuevoCliente._id;
            }
        }

        // 2. Crear la reserva
        const nuevaReserva = new Reserva({
            negocioId: req.negocioId,
            clienteId: finalClienteId,
            nombreCliente,
            emailCliente,
            telefonoCliente,
            tipo,
            fecha,
            horaInicio,
            recursoId,
            nombreRecurso,
            numPersonas,
            notas,
            usuarioId: req.userId,
            estado: 'confirmada'
        });

        await nuevaReserva.save();

        // 3. Enviar Correo de Confirmación
        if (emailCliente) {
            const negocio = await Negocio.findById(req.negocioId);
            const businessName = negocio?.nombre || 'Kitchy Business';
            
            sendReservationEmail(
                emailCliente,
                nombreCliente,
                businessName,
                tipo,
                new Date(fecha).toLocaleDateString(),
                horaInicio,
                nombreRecurso || (tipo === 'GASTRONOMIA' ? 'Mesa' : 'Especialista'),
                (nuevaReserva as any)._id.toString()
            ).catch(err => console.error('Error enviando email de reserva:', err));
        }

        // 4. Notificar vía Sockets
        emitToBusiness(req.negocioId as string, 'dashboard_update', { 
            tipo: 'NUEVA_RESERVA', 
            cliente: nombreCliente,
            fecha
        });

        res.status(201).json(nuevaReserva);

    } catch (error: any) {
        res.status(500).json({ message: 'Error al crear la reserva', error: error.message });
    }
};

/**
 * Obtener reservas de un negocio (activas por fecha)
 */
export const obtenerReservas = async (req: AuthRequest, res: Response) => {
    try {
        const { fecha } = req.query;
        const query: any = { negocioId: req.negocioId };
        
        if (fecha) {
            const start = new Date(fecha as string);
            start.setHours(0,0,0,0);
            const end = new Date(fecha as string);
            end.setHours(23,59,59,999);
            query.fecha = { $gte: start, $lte: end };
        }

        const reservas = await Reserva.find(query).sort({ horaInicio: 1 });
        res.json(reservas);
    } catch (error: any) {
        res.status(500).json({ message: 'Error al obtener reservas', error: error.message });
    }
};

/**
 * Cancelar reserva
 */
export const cancelarReserva = async (req: AuthRequest, res: Response) => {
    try {
        const reserva = await Reserva.findOneAndUpdate(
            { _id: req.params.id, negocioId: req.negocioId },
            { estado: 'cancelada' },
            { new: true }
        );

        if (!reserva) return res.status(404).json({ message: 'Reserva no encontrada' });

        emitToBusiness(req.negocioId as string, 'dashboard_update', { tipo: 'RESERVA_CANCELADA' });
        res.json(reserva);
    } catch (error: any) {
        res.status(500).json({ message: 'Error al cancelar reserva', error: error.message });
    }
};
