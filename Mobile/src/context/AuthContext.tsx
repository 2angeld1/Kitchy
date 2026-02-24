import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { login as apiLogin, register as apiRegister } from '../services/api';

interface User {
    id: string;
    email: string;
    nombre: string;
    rol: 'superadmin' | 'admin' | 'usuario';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, nombre: string) => Promise<void>;
    logout: () => void;
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

    const register = async (email: string, password: string, nombre: string) => {
        const response = await apiRegister({ email, password, nombre });
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

    const isAuthenticated = !!token && !!user;
    const isAdmin = user?.rol === 'admin' || user?.rol === 'superadmin';

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated,
            isAdmin,
            login,
            register,
            logout,
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
