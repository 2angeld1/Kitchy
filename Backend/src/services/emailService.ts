import nodemailer from 'nodemailer';
import { getSurveyTemplate } from '../templates/email/surveyTemplate';
import { getPasswordResetTemplate } from '../templates/email/passwordResetTemplate';
import { getReservaTemplate } from '../templates/email/reservaTemplate';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER || 'adfp21900@gmail.com',
        pass: process.env.SMTP_PASS || 'qvruxdpztyzwubji'
    }
});

/**
 * Envía un correo de encuesta de satisfacción al cliente
 */
export const sendSurveyEmail = async (to: string, clientName: string, businessName: string, serviceName: string, ventaId: string) => {
    const html = getSurveyTemplate(clientName, businessName, serviceName, ventaId);

    const mailOptions = {
        from: `"${businessName}" <${process.env.SMTP_USER}>`,
        to,
        subject: `¿Cómo te fue hoy en ${businessName}? ✨`,
        html
    };

    return transporter.sendMail(mailOptions);
};

/**
 * Envía un correo de confirmación de reserva
 */
export const sendReservationEmail = async (
    to: string, 
    clientName: string, 
    businessName: string, 
    tipo: 'GASTRONOMIA' | 'BELLEZA',
    fecha: string,
    hora: string,
    recurso: string,
    reservaId: string
) => {
    const html = getReservaTemplate(clientName, businessName, tipo, fecha, hora, recurso, reservaId);

    const mailOptions = {
        from: `"${businessName}" <${process.env.SMTP_USER}>`,
        to,
        subject: `📅 Reserva Confirmada - ${businessName}`,
        html
    };

    return transporter.sendMail(mailOptions);
};

/**
 * Envía un correo de recuperación de contraseña
 */
export const enviarEmailRecuperacion = async (to: string, resetUrl: string) => {
    const html = getPasswordResetTemplate(resetUrl);

    const mailOptions = {
        from: `"Kitchy Support" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Recuperar Contraseña - Kitchy',
        html
    };

    return transporter.sendMail(mailOptions);
};