import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Especialista from '../models/Especialista';
import { sendEmailViaAPI } from '../services/emailService';
import { chromium } from 'playwright';

export const getEspecialistas = async (req: AuthRequest, res: Response) => {
    try {
        const especialistas = await Especialista.find({ negocioId: req.negocioId, activo: true });
        res.json(especialistas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener especialistas' });
    }
};

export const crearEspecialista = async (req: AuthRequest, res: Response) => {
    try {
        const { nombre, email, rol, comision, tipoComision, turnoActual, horarioSemanal } = req.body;
        const nuevo = new Especialista({
            nombre,
            email,
            rol: rol || 'Barbero',
            comision: comision || 50,
            tipoComision,
            turnoActual: turnoActual || 'ambos',
            horarioSemanal,
            negocioId: req.negocioId
        });
        await nuevo.save();
        res.status(201).json(nuevo);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear especialista' });
    }
};

export const actualizarEspecialista = async (req: AuthRequest, res: Response) => {
    try {
        const { nombre, email, rol, comision, tipoComision, turnoActual, horarioSemanal, activo } = req.body;
        const actualizado = await Especialista.findByIdAndUpdate(
            req.params.id,
            { nombre, email, rol, comision, tipoComision, turnoActual, horarioSemanal, activo },
            { new: true }
        );
        res.json(actualizado);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar especialista' });
    }
};

export const eliminarEspecialista = async (req: AuthRequest, res: Response) => {
    try {
        await Especialista.findByIdAndUpdate(req.params.id, { activo: false });
        res.json({ message: 'Especialista dado de baja correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar' });
    }
};

export const enviarReportesMasivos = async (req: AuthRequest, res: Response) => {
    try {
        const { especialistasResumen, periodo, businessName } = req.body;

        if (!especialistasResumen || !Array.isArray(especialistasResumen)) {
            return res.status(400).json({ message: 'Datos de especialistas inválidos' });
        }

        const formatMoney = (amount: number) => `$${Number(amount).toFixed(2)}`;
        const formatDateTime = (dateVal: any) => {
            if (!dateVal) return '---';
            const d = new Date(dateVal);
            if (isNaN(d.getTime())) return '---';
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        };
        
        // Ejecutar proceso de generación de PDFs en segundo plano para no bloquear el request si son muchos
        res.json({ message: 'Procesando reportes. Los correos se enviarán en breve.' });

        // Función asíncrona no bloqueante
        setTimeout(async () => {
            let browser;
            try {
                browser = await chromium.launch({ headless: true });
                
                for (const esp of especialistasResumen) {
                    if (!esp.email) continue;

                    const html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <style>
                            body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 20px; color: #333; }
                            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #8b5cf6; padding-bottom: 20px; }
                            .header h1 { margin: 0; color: #8b5cf6; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
                            .header p { margin: 5px 0; color: #666; font-size: 14px; }
                            .summary { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 12px; }
                            .summary-item { text-align: center; flex: 1; }
                            .summary-item .label { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
                            .summary-item .value { font-size: 20px; font-weight: bold; color: #1e293b; }
                            
                            .section-title { font-size: 14px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 10px; margin-top: 20px; }
                            
                            table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; }
                            th { background-color: #8b5cf6; color: white; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; }
                            td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
                            tr:nth-child(even) { background-color: #f8fafc; }
                            .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 10px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
                            .bold { font-weight: bold; }
                            .amount { text-align: right; }
                            .primary-text { color: #8b5cf6; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>Reporte de Pago</h1>
                            <p style="font-size: 18px; font-weight: bold; color: #1e293b; margin-top: 10px;">${esp.nombre}</p>
                            <p>${businessName}</p>
                            <p>Periodo: ${periodo.toUpperCase()} | Fecha de emisión: ${new Date().toLocaleDateString()}</p>
                        </div>

                        <div class="summary">
                            <div class="summary-item">
                                <div class="label">Total Recaudado</div>
                                <div class="value">${formatMoney(esp.totalRecaudado)}</div>
                            </div>
                            <div class="summary-item">
                                <div class="label">Tu Comisión</div>
                                <div class="value" style="color: #8b5cf6;">${formatMoney(esp.totalComision)}</div>
                            </div>
                        </div>

                        ${esp.serviciosItems?.length > 0 ? `
                        <div class="section-title">Servicios Realizados (${esp.serviciosItems.length})</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha/Hora</th>
                                    <th>Servicio</th>
                                    <th class="amount">Precio</th>
                                    <th class="amount">Comisión</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${esp.serviciosItems.map((item: any) => `
                                    <tr>
                                        <td>${formatDateTime(item.fecha)}</td>
                                        <td>${item.nombre}</td>
                                        <td class="amount">${formatMoney(item.precio)}</td>
                                        <td class="amount bold primary-text">${formatMoney(item.comision)} (${item.porcentaje}%)</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        ` : ''}

                        ${esp.productosItems?.length > 0 ? `
                        <div class="section-title">Venta de Productos (${esp.productosItems.length})</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha/Hora</th>
                                    <th>Producto</th>
                                    <th class="amount">Precio</th>
                                    <th class="amount">Comisión</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${esp.productosItems.map((item: any) => `
                                    <tr>
                                        <td>${formatDateTime(item.fecha)}</td>
                                        <td>${item.nombre}</td>
                                        <td class="amount">${formatMoney(item.precio)}</td>
                                        <td class="amount bold primary-text">${formatMoney(item.comision)} (${item.porcentaje}%)</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        ` : ''}

                        <div class="footer">
                            Este es un comprobante de pago generado por <strong>Kitchy POS</strong>.
                        </div>
                    </body>
                    </html>
                    `;

                    const page = await browser.newPage();
                    await page.setContent(html, { waitUntil: 'networkidle' });
                    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
                    await page.close();

                    const base64Pdf = pdfBuffer.toString('base64');
                    
                    const subject = `Reporte de Pago - ${esp.nombre} - ${periodo}`;
                    const textBody = `Hola ${esp.nombre},<br><br>Adjunto encontrarás tu reporte de pago detallado para el periodo: ${periodo}.<br><br>Total Recaudado: ${formatMoney(esp.totalRecaudado)}<br>Tu Comisión: ${formatMoney(esp.totalComision)}<br><br>Saludos,<br>El equipo.`;

                    await sendEmailViaAPI(esp.email, subject, textBody, businessName, [{
                        name: `Reporte_${esp.nombre.replace(/ /g, '_')}.pdf`,
                        content: base64Pdf
                    }]);
                }
            } catch (err) {
                console.error('Error generando PDFs con Playwright:', err);
            } finally {
                if (browser) await browser.close();
            }
        }, 0);

    } catch (error) {
        console.error('Error en controlador enviarReportesMasivos:', error);
        res.status(500).json({ message: 'Error interno del servidor al procesar la solicitud' });
    }
};
