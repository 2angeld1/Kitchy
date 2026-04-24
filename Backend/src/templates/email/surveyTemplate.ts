export const getSurveyTemplate = (clientName: string, businessName: string, serviceName: string, ventaId: string) => {
    // URL Base para el feedback (en producción esto vendrá de una variable de entorno)
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const feedbackUrl = `${baseUrl}/api/feedback/view/${ventaId}`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #f1f1f1; }
            .header { background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); padding: 50px 20px; text-align: center; color: white; }
            .content { padding: 40px 30px; text-align: center; }
            h1 { font-size: 26px; color: #ffffff; margin: 0; font-weight: 900; letter-spacing: -0.5px; }
            p { font-size: 16px; color: #4b5563; line-height: 1.7; margin-bottom: 24px; }
            .stars { margin: 35px 0; }
            .star { display: inline-block; font-size: 45px; color: #fbbf24; text-decoration: none; margin: 0 6px; transition: all 0.2s; }
            .button { background-color: #ec4899; color: white !important; padding: 16px 32px; text-decoration: none; border-radius: 14px; font-weight: bold; display: inline-block; margin-top: 20px; box-shadow: 0 4px 10px rgba(236, 72, 153, 0.3); }
            .footer { padding: 30px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; background-color: #fafafa; }
            .badge { background-color: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 20px; font-size: 12px; display: inline-block; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="badge">Feedback VIP</div>
                <h1>¿Qué tal estuvo tu ${serviceName}?</h1>
            </div>
            <div class="content">
                <p>Hola <strong>${clientName}</strong>,</p>
                <p>¡Gracias por elegir a <strong>${businessName}</strong>! Nos importa mucho saber cómo estuvo tu experiencia con nosotros hoy.</p>
                <p>Tu opinión nos ayuda a seguir brindándote el servicio de alta calidad que mereces.</p>
                
                <div class="stars">
                    <a href="${feedbackUrl}?stars=1" class="star" title="Muy Malo">★</a>
                    <a href="${feedbackUrl}?stars=2" class="star" title="Malo">★</a>
                    <a href="${feedbackUrl}?stars=3" class="star" title="Regular">★</a>
                    <a href="${feedbackUrl}?stars=4" class="star" title="Bueno">★</a>
                    <a href="${feedbackUrl}?stars=5" class="star" title="¡Excelente!">★</a>
                </div>

                <p style="font-size: 14px; color: #9ca3af;">Califica tu servicio pulsando en una estrella</p>

                <a href="${feedbackUrl}" class="button">Dejar un comentario detallado</a>
            </div>
            <div class="footer">
                <p>Este correo fue enviado por el sistema de marketing de <strong>${businessName}</strong> a través de Kitchy Intelligence.</p>
                <p>© 2026 Kitchy POS. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};
