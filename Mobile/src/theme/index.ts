export const lightTheme = {
    primary: '#E11D48',
    primaryLight: '#FB7185',
    primaryShade: '#9F1239',
    background: '#fafafa',
    surface: '#ffffff',
    card: '#ffffff',
    border: '#e4e4e7',
    textPrimary: '#18181b',
    textSecondary: '#71717a',
    textMuted: '#A1A1AA',
    white: '#ffffff',
    black: '#000000',
    overlayHover: 'rgba(0,0,0, 0.05)',
    error: '#EF4444',
};

export const darkTheme = {
    primary: '#E11D48',
    primaryLight: '#FB7185',
    primaryShade: '#9F1239',
    background: '#09090b',
    surface: '#18181b',
    card: '#18181b',
    border: '#27272a',
    textPrimary: '#fafafa',
    textSecondary: '#a1a1aa',
    textMuted: '#52525b',
    white: '#ffffff',
    black: '#000000',
    overlayHover: 'rgba(255,255,255, 0.05)',
    error: '#EF4444',
};

export type ThemeColors = typeof lightTheme;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
};

export const typography = {
    fontFamily: {
        light: 'Inter_300Light',
        regular: 'Inter_400Regular',
        medium: 'Inter_500Medium',
        bold: 'Inter_700Bold',
        black: 'Inter_900Black',
    },
    fontSize: {
        xs: 11,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 24,
        xxl: 36,
    },
    fontWeight: {
        normal: '400',
        medium: '500',
        bold: '700',
        black: '900',
    } as const,
};

// Retrocompatibilidad
export const colors = lightTheme;
