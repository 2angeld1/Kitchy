import nodemailer from 'nodemailer';

/**
 * Interfaz para las opciones de envío de correo
 */
interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

/**
 * Configuración del transporte SMTP usando las credenciales del .env
 */
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Servicio genérico para envío de correos
 * Cumple con el principio de Responsabilidad Única (SOLID)
 */
export const sendEmail = async ({ to, subject, html, text }: EmailOptions): Promise<void> => {
    const mailOptions = {
        from: `"Kitchy" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text: text || 'Contenido del correo' // Fallback si no hay texto plano
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email enviado exitosamente a: ${to}`);
    } catch (error) {
        console.error('❌ Error en EmailService:', error);
        throw new Error('No se pudo enviar el correo electrónico');
    }
};

/**
 * MÉTODO DE COMPATIBILIDAD (Temporal)
 * Mantenemos esto para no romper el flujo de recuperación de contraseña actual
 */
export const enviarEmailRecuperacion = async (email: string, token: string) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
            <h2 style="color: #3880ff; text-align: center;">Recuperación de Contraseña</h2>
            <p>Hola,</p>
            <p>Has solicitado restablecer tu contraseña en <strong>Kitchy</strong>. Haz clic en el botón a continuación:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #3880ff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer mi Contraseña</a>
            </div>
            <p style="font-size: 0.9em; color: #666;">Si no solicitaste este cambio, puedes ignorar este correo con seguridad.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="text-align: center; color: #999; font-size: 0.8em;">© 2024 Kitchy. Todos los derechos reservados.</p>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: 'Kitchy - Recuperación de Contraseña',
        html: htmlContent
    });
};