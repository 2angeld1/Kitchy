import nodemailer from 'nodemailer';

// Configurar transporte SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS
    auth: {
        user: process.env.EMAIL_USER, // Tu email de Gmail
        pass: process.env.EMAIL_PASS  // App password
    }
});

// Función para enviar email de recuperación
export const enviarEmailRecuperacion = async (email: string, token: string) => {

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER, // Usa tu email de Gmail como remitente
        to: email,
        subject: 'Recuperación de Contraseña - Logística App',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Recuperación de Contraseña</h2>
                <p>Hola,</p>
                <p>Has solicitado restablecer tu contraseña. Haz clic en el enlace a continuación:</p>
                <a href="${resetUrl}" style="background-color: #3880ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
                <p>Si no solicitaste esto, ignora este email.</p>
                <p>El enlace expira en 1 hora.</p>
                <p>Saludos,<br>Equipo de Logística App</p>
            </div>
        `
    };

    console.log('📧 Mail options:', mailOptions); // Agregado para depuración

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Email de recuperación enviado a:', email);
    } catch (error) {
        console.error('❌ Error al enviar email:', error);
        throw new Error('Error al enviar email de recuperación');
    }
};