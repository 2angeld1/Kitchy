import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import roleRoutes from './routes/roles';
import productoRoutes from './routes/productos';
import ventaRoutes from './routes/ventas';
import inventarioRoutes from './routes/inventario';
import dashboardRoutes from './routes/dashboard';
import menuConfigRoutes from './routes/menuConfig';
import negocioRoutes from './routes/negocios';
import gastoRoutes from './routes/gastos';
import agenteRoutes from './routes/agente';
import statsRoutes from './routes/stats';
import comisionRoutes from './routes/comisiones';
import especialistaRoutes from './routes/especialistas';

import { initScheduler } from './config/scheduler';

dotenv.config();

// Inicializar el Radar de Caitlyn (Clima, Gasolina, Merca)
initScheduler();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:8100',
        'http://localhost:5173',
        'https://kitchy-one.vercel.app',
        'https://kitchy-gosen.vercel.app',
        'capacitor://localhost',
        'ionic://localhost',
        'http://localhost:8081',
        'http://localhost:3001',
        'https://agrolinkxbk.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Aumentar el límite de tamaño para permitir imágenes en base64 de alta resolución
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// simple request logger (antes de las rutas)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('🚀 [HEARTBEAT] Petición de cuaderno recibida en el backend de Node...');
    next();
});

// Conectar a MongoDB
connectDB();

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/menu-config', menuConfigRoutes);
app.use('/api/negocios', negocioRoutes);
app.use('/api/gastos', gastoRoutes);
app.use('/api/agente', agenteRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/comisiones', comisionRoutes);
app.use('/api/especialistas', especialistaRoutes);

// Rutas del sistema
export const CURRENT_APP_VERSION = process.env.APP_VERSION || '1.0.0'; // Cambiar esto forzará una recarga en todos los clientes

app.get('/api/system/version', (req, res) => {
    res.json({ version: CURRENT_APP_VERSION });
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API de Kitchy POS funcionando correctamente' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor Kitchy corriendo en puerto ${PORT}`);
});