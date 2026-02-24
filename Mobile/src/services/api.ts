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

// Ventas
export const createVenta = (data: any) => api.post('/ventas', data);
export const getVentas = (params?: any) => api.get('/ventas', { params });

export default api;
