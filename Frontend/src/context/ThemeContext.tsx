import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Force isDark to be always false
    const [isDark] = useState(false);

    useEffect(() => {
        // Always force light theme
        applyTheme(false);
    }, []);

    const applyTheme = (dark: boolean) => {
        // Forcing light mode always
        document.body.classList.remove('dark');
        document.documentElement.classList.remove('ion-palette-dark');
        document.documentElement.style.colorScheme = 'light';
    };

    const toggleTheme = () => {
        // Do nothing, we are staying in light mode
    };

    const setTheme = (dark: boolean) => {
        // Support the call but ignore the value
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
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
