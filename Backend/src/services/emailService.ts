import axios from 'axios';
import { getSurveyTemplate } from '../templates/email/surveyTemplate';
import { getPasswordResetTemplate } from '../templates/email/passwordResetTemplate';
import { getReservaTemplate } from '../templates/email/reservaTemplate';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const API_KEY = process.env.SMTP_PASS || '';
const SENDER_EMAIL = process.env.SMTP_FROM || 'adfp21900@gmail.com';

/**
 * Función genérica para enviar correos vía API de Brevo
 */
const sendEmailViaAPI = async (to: string, subject: string, htmlContent: string, senderName: string = 'Kitchy') => {
    console.log(`[EmailService-API] Intentando enviar correo a: ${to} | Asunto: ${subject}`);
    
    const data = {
        sender: { name: senderName, email: SENDER_EMAIL },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent
    };

    try {
        const response = await axios.post(BREVO_API_URL, data, {
            headers: {
                'api-key': API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        console.log(`[EmailService-API] Correo enviado con éxito. ID: ${response.data.messageId}`);
        return response.data;
    } catch (error: any) {
        console.error(`[EmailService-API] Error al enviar correo a ${to}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Envía un correo de encuesta de satisfacción al cliente
 */
export const sendSurveyEmail = async (to: string, clientName: string, businessName: string, serviceName: string, ventaId: string) => {
    const html = getSurveyTemplate(clientName, businessName, serviceName, ventaId);
    const subject = `¿Cómo te fue hoy en ${businessName}? ✨`;
    return sendEmailViaAPI(to, subject, html, businessName);
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
    const subject = `📅 Reserva Confirmada - ${businessName}`;
    return sendEmailViaAPI(to, subject, html, businessName);
};

/**
 * Envía un correo de recuperación de contraseña
 */
export const enviarEmailRecuperacion = async (to: string, resetUrl: string) => {
    const html = getPasswordResetTemplate(resetUrl);
    const subject = 'Recuperar Contraseña - Kitchy';
    return sendEmailViaAPI(to, subject, html, 'Kitchy Support');
};