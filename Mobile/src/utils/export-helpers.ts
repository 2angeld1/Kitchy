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

export const exportComisionesPdf = async (data: any, periodo: string, businessName: string = 'Kitchy Beauty') => {
    try {
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
                .report-info { margin-bottom: 20px; font-size: 12px; font-weight: bold; color: #8b5cf6; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th { background-color: #8b5cf6; color: white; text-align: left; padding: 12px; font-size: 12px; }
                td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
                tr:nth-child(even) { background-color: #f1f5f9; }
                .footer { margin-top: 30px; text-align: center; color: #94a3b8; font-size: 10px; }
                .amount { font-family: 'Courier New', Courier, monospace; font-weight: bold; }
                .percentage { color: #8b5cf6; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Reporte de Comisiones</h1>
                <p>${businessName}</p>
                <p>Fecha de emisión: ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="report-info">PERIODO: ${periodo.toUpperCase()}</div>

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

            <table>
                <thead>
                    <tr>
                        <th>Especialista</th>
                        <th>Servicios</th>
                        <th>Ingreso Total</th>
                        <th>A Pagar</th>
                        <th>Com. %</th>
                    </tr>
                </thead>
                <tbody>
                    ${(data.especialistas || []).map((esp: any) => `
                        <tr>
                            <td>${esp.nombre}</td>
                            <td>${esp.totalServicios}</td>
                            <td class="amount">${formatMoney(esp.totalIngreso)}</td>
                            <td class="amount">${formatMoney(esp.montoEspecialista)}</td>
                            <td class="percentage">${esp.porcentajeActual}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="footer">
                Generado automáticamente por el software de gestión Kitchy.
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
