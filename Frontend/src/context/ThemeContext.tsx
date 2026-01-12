import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Clear any existing dark classes first
        document.body.classList.remove('dark');
        document.documentElement.classList.remove('ion-palette-dark');
        
        // Check saved preference first, then system preference
        const savedTheme = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedTheme !== null ? savedTheme === 'true' : prefersDark;
        
        setIsDark(shouldBeDark);
        applyTheme(shouldBeDark);
    }, []);

    const applyTheme = (dark: boolean) => {
        // Toggle class on document.body for our custom styles
        document.body.classList.toggle('dark', dark);
        
        // Also toggle on documentElement for Ionic's dark mode
        document.documentElement.classList.toggle('ion-palette-dark', dark);
        
        // Set color-scheme for native elements
        document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    };

    const toggleTheme = () => {
        const newValue = !isDark;
        setIsDark(newValue);
        applyTheme(newValue);
        localStorage.setItem('darkMode', String(newValue));
    };

    const setTheme = (dark: boolean) => {
        // Prevent duplicate calls with same value
        if (dark === isDark) return;
        
        setIsDark(dark);
        applyTheme(dark);
        localStorage.setItem('darkMode', String(dark));
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
