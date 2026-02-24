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

export const register = (data: { email: string; password: string; nombre: string }) =>
    api.post('/auth/register', data);

export const getDashboard = () => api.get('/dashboard');

// Productos
export const getProductos = (params?: any) => api.get('/productos', { params });
export const createProducto = (data: any) => api.post('/productos', data);
export const updateProducto = (id: string, data: any) => api.put(`/productos/${id}`, data);
export const deleteProducto = (id: string) => api.delete(`/productos/${id}`);
export const toggleDisponibilidad = (id: string) => api.patch(`/productos/${id}/toggle`);
export const importarProductos = (data: any) => api.post('/productos/import', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// Ventas
export const createVenta = (data: any) => api.post('/ventas', data);
export const getVentas = (params?: any) => api.get('/ventas', { params });

// Inventario
export const getInventario = (params?: any) => api.get('/inventario', { params });
export const createInventario = (data: any) => api.post('/inventario', data);
export const updateInventario = (id: string, data: any) => api.put(`/inventario/${id}`, data);
export const deleteInventario = (id: string) => api.delete(`/inventario/${id}`);
export const registrarEntrada = (id: string, data: any) => api.post(`/inventario/${id}/entradas`, data);
export const registrarSalida = (id: string, data: any) => api.post(`/inventario/${id}/salidas`, data);
export const importarInventario = (data: any) => api.post('/inventario/import', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

export default api;
