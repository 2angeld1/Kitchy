import nodemailer from 'nodemailer';
import { getSurveyTemplate } from '../templates/email/surveyTemplate';
import { getPasswordResetTemplate } from '../templates/email/passwordResetTemplate';
import { getReservaTemplate } from '../templates/email/reservaTemplate';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true para puerto 465, false para otros
    family: 4, // Forzar IPv4 para evitar problemas de ruteo en nubes
    auth: {
        user: process.env.SMTP_USER || 'adfp21900@gmail.com',
        pass: process.env.SMTP_PASS || 'qvruxdpztyzwubji'
    },
    tls: {
        rejectUnauthorized: false // Ayuda en algunos entornos de red restrictivos
    },
    connectionTimeout: 10000, // 10 segundos
    greetingTimeout: 10000,
    socketTimeout: 15000
} as any);

// Verificar conexión al iniciar
transporter.verify((error, success) => {
    if (error) {
        console.error('[EmailService] Error de verificación SMTP:', error);
    } else {
        console.log('[EmailService] Servidor listo para enviar correos');
    }
});

/**
 * Envía un correo de encuesta de satisfacción al cliente
 */
export const sendSurveyEmail = async (to: string, clientName: string, businessName: string, serviceName: string, ventaId: string) => {
    console.log(`[EmailService] Intentando enviar encuesta a: ${to} (${businessName})`);
    const html = getSurveyTemplate(clientName, businessName, serviceName, ventaId);

    const mailOptions = {
        from: `"${businessName}" <${process.env.SMTP_USER}>`,
        to,
        subject: `¿Cómo te fue hoy en ${businessName}? ✨`,
        html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Encuesta enviada con éxito. MessageId: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`[EmailService] Error al enviar encuesta a ${to}:`, error);
        throw error;
    }
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
    console.log(`[EmailService] Intentando enviar confirmación de reserva a: ${to}`);
    const html = getReservaTemplate(clientName, businessName, tipo, fecha, hora, recurso, reservaId);

    const mailOptions = {
        from: `"${businessName}" <${process.env.SMTP_USER}>`,
        to,
        subject: `📅 Reserva Confirmada - ${businessName}`,
        html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Confirmación de reserva enviada. MessageId: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`[EmailService] Error al enviar reserva a ${to}:`, error);
        throw error;
    }
};

/**
 * Envía un correo de recuperación de contraseña
 */
export const enviarEmailRecuperacion = async (to: string, resetUrl: string) => {
    console.log(`[EmailService] Intentando enviar email de recuperación a: ${to}`);
    const html = getPasswordResetTemplate(resetUrl);

    const mailOptions = {
        from: `"Kitchy Support" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Recuperar Contraseña - Kitchy',
        html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Email de recuperación enviado. MessageId: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`[EmailService] Error al enviar recuperación a ${to}:`, error);
        throw error;
    }
};