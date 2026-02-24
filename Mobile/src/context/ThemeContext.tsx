import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeMode;
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [theme, setTheme] = useState<ThemeMode>(systemColorScheme || 'light');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem('@kitchy_theme');
                if (storedTheme === 'light' || storedTheme === 'dark') {
                    setTheme(storedTheme);
                } else if (systemColorScheme) {
                    setTheme(systemColorScheme);
                }
            } catch (error) {
                console.error("Error loading theme from storage", error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadTheme();
    }, [systemColorScheme]);

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        try {
            await AsyncStorage.setItem('@kitchy_theme', newTheme);
        } catch (error) {
            console.error("Error saving theme to storage", error);
        }
    };

    const isDark = theme === 'dark';

    // Para evitar flasheos de color mientras lee de local storage
    if (!isLoaded) return null;

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
