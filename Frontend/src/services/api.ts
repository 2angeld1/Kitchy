import axios from 'axios';
import API_URL from '../config/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
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
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const login = (email: string, password: string) =>
    api.post('/auth/login', { email, password });

export const register = (data: { email: string; password: string; nombre: string }) =>
    api.post('/auth/register', data);

// Productos
export const getProductos = (params?: { disponible?: boolean; categoria?: string }) =>
    api.get('/productos', { params });

export const getProducto = (id: string) =>
    api.get(`/productos/${id}`);

export const createProducto = (data: any) =>
    api.post('/productos', data);

export const updateProducto = (id: string, data: any) =>
    api.put(`/productos/${id}`, data);

export const deleteProducto = (id: string) =>
    api.delete(`/productos/${id}`);

export const toggleDisponibilidad = (id: string) =>
    api.patch(`/productos/${id}/disponibilidad`);

// Ventas
export const getVentas = (params?: { fechaInicio?: string; fechaFin?: string; limit?: number }) =>
    api.get('/ventas', { params });

export const getVenta = (id: string) =>
    api.get(`/ventas/${id}`);

export const createVenta = (data: { items: { productoId: string; cantidad: number }[]; metodoPago: string; cliente?: string }) =>
    api.post('/ventas', data);

export const getVentasHoy = () =>
    api.get('/ventas/hoy');

export const getEstadisticasVentas = (params?: { fechaInicio?: string; fechaFin?: string }) =>
    api.get('/ventas/estadisticas', { params });

export const deleteVenta = (id: string) =>
    api.delete(`/ventas/${id}`);

// Inventario
export const getInventario = (params?: { categoria?: string; stockBajo?: boolean }) =>
    api.get('/inventario', { params });

export const getInventarioItem = (id: string) =>
    api.get(`/inventario/${id}`);

export const createInventario = (data: any) =>
    api.post('/inventario', data);

export const updateInventario = (id: string, data: any) =>
    api.put(`/inventario/${id}`, data);

export const deleteInventario = (id: string) =>
    api.delete(`/inventario/${id}`);

export const registrarEntrada = (id: string, data: { cantidad: number; costoTotal?: number; motivo?: string }) =>
    api.post(`/inventario/${id}/entrada`, data);

export const registrarSalida = (id: string, data: { cantidad: number; motivo?: string }) =>
    api.post(`/inventario/${id}/salida`, data);

export const getStockBajo = () =>
    api.get('/inventario/stock-bajo');

export const getResumenInventario = () =>
    api.get('/inventario/resumen');

// Dashboard
export const getDashboard = () =>
    api.get('/dashboard');

export const getReporteVentas = (params?: { fechaInicio?: string; fechaFin?: string; agruparPor?: string }) =>
    api.get('/dashboard/ventas', { params });

export const getReporteGanancias = (params?: { fechaInicio?: string; fechaFin?: string }) =>
    api.get('/dashboard/ganancias', { params });

// Users
export const getUsers = () =>
    api.get('/users');

export const updateUserRole = (id: string, rol: string) =>
    api.put(`/users/${id}/role`, { rol });

export const deleteUser = (id: string) =>
    api.delete(`/users/${id}`);

export default api;
