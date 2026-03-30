import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { login as apiLogin, register as apiRegister } from '../services/api';

export interface Negocio {
    _id: string;
    nombre: string;
    logo?: string;
    tipo: string;
    categoria: 'COMIDA' | 'BELLEZA';
    config?: {
        moneda: string;
        denominaciones: number[];
        impuesto: number;
    };
    comisionConfig?: {
        tipo: 'fijo' | 'escalonado';
        fijo?: { porcentajeBarbero: number; porcentajeDueno: number };
        escalonado?: {
            desde: number;
            hasta: number;
            porcentajeBarbero: number;
            porcentajeDueno: number;
        }[];
        cortesPorCiclo: number;
    };
    onboardingStep?: number;
}

interface User {
    id: string;
    email: string;
    nombre: string;
    rol: 'admin' | 'usuario';
    negocioIds?: (string | Negocio)[];
    negocioActivo?: string | Negocio;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: {
        email: string;
        password: string;
        nombre: string;
        negocioNombre: string;
        direccion?: string;
        telefono?: string;
        logo?: string;
        categoriaNegocio?: string;
    }) => Promise<void>;
    logout: () => void;
    switchNegocioContext: (newUserContext: User, newToken: string) => Promise<void>;
    updateOnboardingProgress: (step: number) => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserFromStorage = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('kitchy_token');
                const storedUser = await AsyncStorage.getItem('kitchy_user');

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                    api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                }
            } catch (error) {
                console.error('Error loading token from AsyncStorage:', error);
            } finally {
                setLoading(false);
            }
        };
        loadUserFromStorage();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await apiLogin(email, password);
        const { token: newToken, user: userData } = response.data;

        await AsyncStorage.setItem('kitchy_token', newToken);
        await AsyncStorage.setItem('kitchy_user', JSON.stringify(userData));

        setToken(newToken);
        setUser(userData);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    };

    const register = async (data: {
        email: string;
        password: string;
        nombre: string;
        negocioNombre: string;
        direccion?: string;
        telefono?: string;
        logo?: string;
        categoriaNegocio?: string;
    }) => {
        const response = await apiRegister(data);
        const { token: newToken, user: userData } = response.data;

        await AsyncStorage.setItem('kitchy_token', newToken);
        await AsyncStorage.setItem('kitchy_user', JSON.stringify(userData));

        setToken(newToken);
        setUser(userData);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    };

    const logout = async () => {
        await AsyncStorage.removeItem('kitchy_token');
        await AsyncStorage.removeItem('kitchy_user');
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
    };

    const switchNegocioContext = async (newUserContext: User, newToken: string) => {
        await AsyncStorage.setItem('kitchy_token', newToken);
        await AsyncStorage.setItem('kitchy_user', JSON.stringify(newUserContext));
        setToken(newToken);
        setUser(newUserContext);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    };

    const updateOnboardingProgress = async (step: number) => {
        try {
            await api.put('/negocios/onboarding', { step });
            // Update local user context
            if (user && user.negocioActivo && typeof user.negocioActivo === 'object') {
                const updatedNegocioActivo = { ...user.negocioActivo, onboardingStep: step };
                const updatedUser = { ...user, negocioActivo: updatedNegocioActivo };
                setUser(updatedUser);
                await AsyncStorage.setItem('kitchy_user', JSON.stringify(updatedUser));
            }
        } catch (err) {
            console.error('Error updating onboarding progress', err);
        }
    };

    const isAuthenticated = !!token && !!user;
    const isAdmin = user?.rol === 'admin';

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated,
            isAdmin,
            login,
            register,
            logout,
            switchNegocioContext,
            updateOnboardingProgress,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
