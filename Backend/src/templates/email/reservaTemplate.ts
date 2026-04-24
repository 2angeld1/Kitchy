export const getReservaTemplate = (
    clientName: string, 
    businessName: string, 
    tipo: 'GASTRONOMIA' | 'BELLEZA',
    fecha: string,
    hora: string,
    recurso: string,
    reservaId: string
) => {
    const icon = tipo === 'GASTRONOMIA' ? '🍽️' : '✂️';
    const resourceLabel = tipo === 'GASTRONOMIA' ? 'Mesa / Ubicación' : 'Especialista';
    const actionLabel = tipo === 'GASTRONOMIA' ? 'tu mesa' : 'tu cita';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #1A1A1A 0%, #333 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; letter-spacing: -1px; }
            .content { padding: 40px; background-color: #ffffff; }
            .status-badge { display: inline-block; background-color: #E8F5E9; color: #2E7D32; padding: 8px 16px; border-radius: 50px; font-weight: bold; font-size: 14px; margin-bottom: 20px; }
            .details { background-color: #F9F9F9; border-radius: 15px; padding: 25px; margin: 30px 0; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .label { color: #888; font-size: 14px; font-weight: 600; }
            .value { font-weight: 700; color: #1A1A1A; }
            .footer { background-color: #f4f4f4; padding: 30px; text-align: center; color: #888; font-size: 12px; }
            .button { display: inline-block; background-color: #1A1A1A; color: white; padding: 15px 35px; border-radius: 50px; text-decoration: none; font-weight: bold; margin-top: 20px; }
            .emoji { font-size: 40px; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="emoji">${icon}</div>
                <h1>¡Todo listo para recibirte!</h1>
            </div>
            <div class="content">
                <div class="status-badge">RESERVA CONFIRMADA</div>
                <p>Hola <strong>${clientName}</strong>,</p>
                <p>Nos alegra confirmarte que hemos reservado ${actionLabel} en <strong>${businessName}</strong>. Aquí tienes los detalles:</p>
                
                <div class="details">
                    <div class="detail-row">
                        <span class="label">Fecha</span>
                        <span class="value">${fecha}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Hora</span>
                        <span class="value">${hora}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">${resourceLabel}</span>
                        <span class="value">${recurso}</span>
                    </div>
                </div>

                <p style="text-align: center;">Si necesitas cancelar o mover tu reserva, por favor contáctanos con anticipación.</p>
                
                <div style="text-align: center;">
                    <a href="#" class="button">Ver en el mapa</a>
                </div>
            </div>
            <div class="footer">
                <p>Enviado de forma segura por <strong>Kitchy Admin</strong> para ${businessName}.</p>
                <p>ID Reserva: ${reservaId}</p>
            </div>
        </div>
    </body>
    </html>
    `;
};
