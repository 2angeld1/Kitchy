export const getPasswordResetTemplate = (resetUrl: string) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
            .header { background-color: #1f2937; padding: 30px; text-align: center; }
            .logo { color: #ffffff; font-size: 28px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
            .content { padding: 40px; color: #374151; }
            h2 { color: #111827; font-size: 22px; margin-top: 0; }
            p { font-size: 16px; line-height: 1.6; color: #4b5563; }
            .button-container { text-align: center; margin: 35px 0; }
            .button { background-color: #10b981; color: white !important; padding: 16px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); }
            .notice { font-size: 13px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">KITCHY</div>
            </div>
            <div class="content">
                <h2>¿Olvidaste tu contraseña?</h2>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Kitchy.</p>
                <p>Si fuiste tú, haz clic en el botón de abajo para elegir una nueva. Este enlace es válido por <strong>60 minutos</strong>.</p>
                
                <div class="button-container">
                    <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
                </div>

                <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña actual no se verá afectada.</p>
                
                <div class="notice">
                    <p>Por seguridad, nunca compartas este enlace con nadie. El equipo de Kitchy nunca te pedirá tu contraseña por correo.</p>
                </div>
            </div>
            <div class="footer">
                <p>© 2026 Kitchy Intelligence - Sistema de Gestión Inteligente</p>
            </div>
        </div>
    </body>
    </html>
    `;
};
