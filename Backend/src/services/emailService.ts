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
export const sendEmailViaAPI = async (to: string, subject: string, htmlContent: string, senderName: string = 'Kitchy', attachments?: Array<{name: string, content: string}>) => {
    console.log(`[EmailService-API] Intentando enviar correo a: ${to} | Asunto: ${subject}`);
    
    const data: any = {
        sender: { name: senderName, email: SENDER_EMAIL },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent
    };

    if (attachments && attachments.length > 0) {
        data.attachment = attachments;
    }

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

/**
 * Envía un comprobante digital de pago al cliente
 */
export const sendReceiptEmail = async (
    to: string,
    clientName: string,
    businessName: string,
    venta: any
) => {
    const formatMoney = (amount: number) => `$${Number(amount).toFixed(2)}`;
    
    // Crear la tablita de items
    const itemsHtml = venta.items.map((item: any) => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">${item.cantidad}x ${item.nombreProducto}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: right;">${formatMoney(item.subtotal)}</td>
        </tr>
    `).join('');

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #8b5cf6; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Comprobante de Pago</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">${businessName}</p>
        </div>
        
        <div style="padding: 20px;">
            <p style="font-size: 16px; color: #334155;">Hola <strong>${clientName || 'Cliente'}</strong>,</p>
            <p style="font-size: 15px; color: #475569;">Gracias por tu visita. Aquí tienes el resumen de tu transacción:</p>
            
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;"><strong>Fecha:</strong> ${new Date(venta.createdAt || new Date()).toLocaleString()}</p>
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;"><strong>Método de Pago:</strong> ${venta.metodoPago.toUpperCase()}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr>
                        <th style="text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; color: #475569;">Descripción</th>
                        <th style="text-align: right; padding: 10px; border-bottom: 2px solid #cbd5e1; color: #475569;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td style="padding: 15px 10px; font-weight: bold; font-size: 18px; text-align: right; color: #1e293b;">Total:</td>
                        <td style="padding: 15px 10px; font-weight: bold; font-size: 18px; text-align: right; color: #8b5cf6;">${formatMoney(venta.total)}</td>
                    </tr>
                </tfoot>
            </table>

            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                Este es un comprobante informativo generado por Kitchy POS. No tiene validez como factura fiscal.
            </p>
        </div>
    </div>
    `;

    const subject = `Tu Comprobante de Pago en ${businessName} 🧾`;
    return sendEmailViaAPI(to, subject, html, businessName);
};