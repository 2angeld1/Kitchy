import axios from 'axios';
import API_URL from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar token a las peticiones (USANDO ASYNC STORAGE PARA MOBILE)
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            // En React Native la navegación suele manejarse de otra forma (contexto),
            // dejaremos que el AuthContext expulse al usuario.
        }
        return Promise.reject(error);
    }
);

// Auth
export const login = (email: string, password: string) =>
    api.post('/auth/login', { email, password });

export const register = (data: {
    email: string;
    password: string;
    nombre: string;
    negocioNombre: string;
    direccion?: string;
    telefono?: string;
    logo?: string;
    categoriaNegocio?: string;
}) => api.post('/auth/register', data);

export const getDashboard = (params?: { periodo?: string }) => api.get('/dashboard', { params });
export const getSalesReport = (params?: any) => api.get('/dashboard/ventas', { params });
export const getFinancialReport = (params?: any) => api.get('/dashboard/ganancias', { params });

// Productos
export const getProductos = (params?: any) => api.get('/productos', { params });
export const getProductCosting = (id: string) => api.get(`/productos/${id}/costeo`);
export const createProducto = (data: any) => api.post('/productos', data);
export const updateProducto = (id: string, data: any) => api.put(`/productos/${id}`, data);
export const deleteProducto = (id: string) => api.delete(`/productos/${id}`);
export const toggleDisponibilidad = (id: string) => api.patch(`/productos/${id}/disponibilidad`);
export const autoAjustarPrecio = (id: string) => api.patch(`/productos/${id}/auto-ajustar-precio`);
export const importarProductos = (data: any) => api.post('/productos/importar', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// Ventas
export const createVenta = (data: any) => api.post('/ventas', data);
export const getVentas = (params?: any) => api.get('/ventas', { params });
export const updateVenta = (id: string, data: any) => api.put(`/ventas/${id}`, data);
export const deleteVenta = (id: string) => api.delete(`/ventas/${id}`);

// Inventario
export const getInventario = (params?: any) => api.get('/inventario', { params });
export const createInventario = (data: any) => api.post('/inventario', data);
export const updateInventario = (id: string, data: any) => api.put(`/inventario/${id}`, data);
export const deleteInventario = (id: string) => api.delete(`/inventario/${id}`);
export const registrarEntrada = (id: string, data: any) => api.post(`/inventario/${id}/entrada`, data);
export const registrarSalida = (id: string, data: any) => api.post(`/inventario/${id}/salida`, data);
export const registrarMerma = (id: string, data: any) => api.post(`/inventario/${id}/merma`, data);
export const importarInventario = (data: any) => api.post('/inventario/importar', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const procesarLoteInventario = (payload: { items: any[], imagen?: string, metadata?: any }) => api.post('/inventario/lote', payload);
export const lookupProducto = (codigo: string) => api.get(`/inventario/lookup/${codigo}`);
export const getComparativaInventario = (params?: { periodo: string }) => api.get('/inventario/comparativa', { params });

// Reservas
export const getReservas = (fecha?: string) => api.get('/reservas', { params: { fecha } });
export const crearReserva = (data: any) => api.post('/reservas', data);
export const cancelarReserva = (id: string) => api.patch(`/reservas/${id}/cancelar`);

// Users
export const getUsers = () => api.get('/users');
export const createUser = (data: any) => api.post('/users', data);
export const forgotPassword = (email: string) => api.post('/auth/forgot-password', { email });
export const updateUserRole = (id: string, data: { rol: string }) => api.put(`/users/${id}/role`, data);
export const deleteUser = (id: string) => api.delete(`/users/${id}`);

// Gastos
export const getGastos = (params?: any) => api.get('/gastos', { params });
export const createGasto = (data: any) => api.post('/gastos', data);
export const deleteGasto = (id: string) => api.delete(`/gastos/${id}`);
export const exportGastosCsv = (params?: any) => api.get('/gastos/export', { params, responseType: 'blob' });

// Negocios
export const getNegocios = () => api.get('/negocios');
export const createNegocio = (data: any) => api.post('/negocios', data);
export const switchNegocio = (negocioId: string) => api.put(`/negocios/switch/${negocioId}`);
export const updateNegocioConfig = (data: any) => api.put('/negocios/config', data);
export const getNegocioActual = () => api.get('/negocios/me');
export const updateNegocio = (id: string, data: any) => api.put(`/negocios/${id}`, data);
export const deleteNegocio = (id: string) => api.delete(`/negocios/${id}`);

// Comisiones (Belleza)
export const getComisiones = (params?: any) => api.get('/comisiones', { params });
export const updateComisionConfig = (data: { 
    tipo: string, 
    fijo?: { porcentajeBarbero: number, porcentajeDueno: number }, 
    escalonado?: any[], 
    cortesPorCiclo: number,
    tareas?: any[],
    bonoPorTarea?: number
}) => api.put('/negocios/config-comisiones', data);
export const updateComisionReventaConfig = (data: { porcentajeGlobal: number }) => api.put('/negocios/config-comision-reventa', data);

// Especialistas (Belleza)
export const getEspecialistas = () => api.get('/especialistas');
export const createEspecialista = (data: { nombre: string, comision?: number, tipoComision?: 'fijo' | 'escalonado', turnoActual?: string, horarioSemanal?: any }) => api.post('/especialistas', data);
export const updateEspecialista = (id: string, data: { nombre?: string, comision?: number, tipoComision?: 'fijo' | 'escalonado', turnoActual?: string, horarioSemanal?: any }) => api.put(`/especialistas/${id}`, data);
export const deleteEspecialista = (id: string) => api.delete(`/especialistas/${id}`);

// Clientes
export const buscarClientes = (q: string) => api.get('/clientes/buscar', { params: { q } });
export const getClientesRecientes = () => api.get('/clientes/recientes');

// Marketing
export const getVentasElegibles = () => api.get('/marketing/ventas-elegibles');
export const enviarEncuesta = (ventaId: string) => api.post('/marketing/enviar-encuesta', { ventaId });
export const getFeedbacks = () => api.get('/feedback/list');

// Configuración Pública
export const getMenuConfig = () => api.get('/menu-config');
export const updateMenuConfig = (data: any) => api.put('/menu-config', data);

// Sistema
export const getSystemVersion = () => api.get('/system/version', { 
    params: { t: new Date().getTime() } // previene caché estricto
});

// Agente Caitlyn (IA)
export const procesarFacturaCaitlyn = (imagenBase64: string) =>
    api.post('/agente/factura', { imagen: imagenBase64 });

export const confirmInvoice = (metadata: any, items: any[]) =>
    api.post('/agente/invoice/confirm', { ...metadata, items });

export const suggestRecipe = (nombrePlato: string, servingSize?: string) =>
    api.post('/agente/recipe/suggest', { nombrePlato, servingSize });

// --- Presupuestario ---
export const parseShoppingList = (text?: string, image?: string) =>
    api.post('/agente/shopping/parse', { text, image });

export const learnPrice = (item_name: string, price: number) =>
    api.post('/agente/shopping/learn-price', { item_name, price });

export const procesarCuadernoVentas = (imagenBase64: string) =>
    api.post('/agente/notebook', { imagen: imagenBase64 });

export default api;
