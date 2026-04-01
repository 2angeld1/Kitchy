import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { formatMoney } from './beauty-helpers';

export const exportComisionesCsv = async (data: any, periodo: string) => {
    try {
        const headers = ['Especialista', 'Servicios', 'Ingreso Total', 'Pago Especialista', 'Pago Dueño', 'Comisión %'];
        const rows = (data.especialistas || []).map((esp: any) => [
            esp.nombre,
            esp.totalServicios,
            esp.totalIngreso.toFixed(2),
            esp.montoEspecialista.toFixed(2),
            esp.montoDueno.toFixed(2),
            esp.porcentajeActual
        ]);

        const csvContent = [
            `Reporte de Comisiones - Periodo: ${periodo.toUpperCase()}`,
            `Resumen General:`,
            `Total Generado:;${data.resumen.totalGeneral.toFixed(2)}`,
            `Total Especialistas:;${data.resumen.totalEspecialistas.toFixed(2)}`,
            `Total Dueño/Local:;${data.resumen.totalDueno.toFixed(2)}`,
            '',
            headers.join(';'),
            ...rows.map((row: any[]) => row.join(';'))
        ].join('\n');

        if (Platform.OS === 'web') {
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Comisiones_${periodo}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } else {
            // Intentar usar API nueva o legacy según disponibilidad
            const docDir = (FileSystem as any).documentDirectory || (FileSystem as any).Paths?.document;
            const filename = `${docDir}Comisiones_${periodo}.csv`;
            
            if ((FileSystem as any).writeAsStringAsync) {
                await (FileSystem as any).writeAsStringAsync(filename, csvContent, { encoding: 'utf8' });
            } else {
                // API Nueva de Expo 55
                const file = new (FileSystem as any).File(filename);
                await file.writeAsync(csvContent);
            }
            await Sharing.shareAsync(filename);
        }
    } catch (err) {
        console.error('Error exportando CSV:', err);
        throw err;
    }
};

export const exportComisionesPdf = async (data: any, periodo: string, businessName: string = 'Kitchy Beauty', ventas: any[] = []) => {
    try {
        // Lógica de agrupación por especialista y por día
        const dailyBreakdown: any = {};
        
        (data.especialistas || []).forEach((esp: any) => {
            const espVentas = ventas.filter((v: any) => 
                (v.especialista?._id || v.especialista) === esp.id || 
                (v.especialista?._id || v.especialista) === esp._id
            );
            
            const days: any = {};
            espVentas.forEach((v: any) => {
                const date = new Date(v.createdAt || v.fecha).toLocaleDateString('es-ES');
                if (!days[date]) {
                    days[date] = { count: 0, total: 0 };
                }
                days[date].count += v.items?.length || 1;
                days[date].total += v.total || 0;
            });
            
            dailyBreakdown[esp.id || esp._id] = Object.keys(days).sort().map(d => ({
                fecha: d,
                cantidad: days[d].count,
                ingreso: days[d].total,
                pago: (days[d].total * (esp.porcentajeActual / 100))
            }));
        });

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 20px; color: #333; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { margin: 0; color: #8b5cf6; }
                .header p { margin: 5px 0; color: #666; font-size: 14px; }
                .summary { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 12px; }
                .summary-item { text-align: center; flex: 1; }
                .summary-item .label { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
                .summary-item .value { font-size: 18px; font-weight: bold; color: #1e293b; }
                
                .esp-section { margin-top: 40px; page-break-inside: avoid; }
                .esp-name { font-size: 18px; font-weight: 800; color: #8b5cf6; margin-bottom: 10px; border-bottom: 2px solid #8b5cf6; padding-bottom: 5px; }
                
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th { background-color: #8b5cf6; color: white; text-align: left; padding: 8px; font-size: 10px; }
                td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
                tr:nth-child(even) { background-color: #f8fafc; }
                .footer { margin-top: 30px; text-align: center; color: #94a3b8; font-size: 10px; }
                .bold { font-weight: bold; }
                .total-row { background-color: #f1f5f9 !important; font-weight: 900; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Reporte de Comisiones</h1>
                <p>${businessName}</p>
                <p>Fecha: ${new Date().toLocaleDateString()} | Periodo: ${periodo.toUpperCase()}</p>
            </div>

            <div class="summary">
                <div class="summary-item">
                    <div class="label">Total Generado</div>
                    <div class="value">${formatMoney(data.resumen.totalGeneral)}</div>
                </div>
                <div class="summary-item">
                    <div class="label">A Especialistas</div>
                    <div class="value" style="color: #6366f1;">${formatMoney(data.resumen.totalEspecialistas)}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Ganancia Local</div>
                    <div class="value" style="color: #10b981;">${formatMoney(data.resumen.totalDueno)}</div>
                </div>
            </div>

            ${(data.especialistas || []).map((esp: any) => `
                <div class="esp-section">
                    <div class="esp-name">${esp.nombre} - <span style="font-size: 14px; opacity: 0.7;">${esp.porcentajeActual}% Comisión</span></div>
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Servicios / Items</th>
                                <th>Ingreso Bruto</th>
                                <th>Ganancia Barbero</th>
                                <th>Ganancia Dueño</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(dailyBreakdown[esp.id || esp._id] || []).map((day: any) => `
                                <tr>
                                    <td>${day.fecha}</td>
                                    <td>${day.cantidad}</td>
                                    <td class="bold">${formatMoney(day.ingreso)}</td>
                                    <td style="color: #6366f1;">${formatMoney(day.pago)}</td>
                                    <td style="color: #10b981;">${formatMoney(day.ingreso - day.pago)}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td>TOTALES</td>
                                <td>${esp.totalServicios}</td>
                                <td>${formatMoney(esp.totalIngreso)}</td>
                                <td>${formatMoney(esp.montoEspecialista)}</td>
                                <td>${formatMoney(esp.montoDueno)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `).join('')}

            <div class="footer">
                Reporte detallado generado por el sistema Kitchy POS.
            </div>
        </body>
        </html>
        `;

        if (Platform.OS === 'web') {
            const { uri } = await Print.printToFileAsync({ html });
            window.open(uri, '_blank');
        } else {
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        }
    } catch (err) {
        console.error('Error exportando PDF:', err);
        throw err;
    }
};
