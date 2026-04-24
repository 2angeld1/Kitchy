import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno explícitamente para la prueba
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { sendEmail } from './src/services/emailService';

async function runTest() {
    console.log('🚀 Iniciando prueba de envío de correo...');
    console.log('📧 Usando cuenta:', process.env.SMTP_USER);

    try {
        await sendEmail({
            to: 'adfp21900@gmail.com', // Te lo mandas a ti mismo
            subject: '🔥 Prueba de Fuego - Kitchy Email System',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 2px solid #3880ff; border-radius: 10px;">
                    <h1 style="color: #3880ff;">¡Funciona, Ángel!</h1>
                    <p>Este es un correo de prueba enviado desde el nuevo <strong>EmailService</strong> de Kitchy.</p>
                    <p>Si estás leyendo esto, significa que:</p>
                    <ul>
                        <li>Nodemailer está bien instalado.</li>
                        <li>Tu App Password de Google es correcta.</li>
                        <li>Las variables de entorno se cargan perfecto.</li>
                    </ul>
                    <hr>
                    <p style="font-size: 0.8em; color: #666;">Prueba enviada el: ${new Date().toLocaleString()}</p>
                </div>
            `,
            text: '¡Funciona! Prueba de correo de Kitchy exitosa.'
        });
        
        console.log('\n✨ ¡ÉXITO! El correo debería estar en tu bandeja en unos segundos.');
    } catch (error) {
        console.error('\n❌ ERROR EN LA PRUEBA:', error);
    }
}

runTest();
