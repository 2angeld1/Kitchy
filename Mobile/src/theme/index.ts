export const colors = {
    // Brand Colors - Red Premium Palette
    primary: '#E11D48', // rose-600 (Vibrant & Premium Red)
    primaryLight: '#FB7185', // rose-400
    primaryShade: '#9F1239', // rose-800

    // Neutral Colors (Greys for text, bg, and borders)
    background: '#fafafa', // zinc-50
    surface: 'rgba(244, 244, 245, 0.8)', // zinc-100/80
    border: '#e4e4e7', // zinc-200
    textPrimary: '#18181b', // zinc-900
    textSecondary: '#71717a', // zinc-500
    textMuted: '#A1A1AA', // zinc-400

    // White / Black
    white: '#ffffff',
    black: '#000000',

    // Specific UI Accents
    overlayHover: 'rgba(0,0,0, 0.05)',
    error: '#EF4444', // red-500
};

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
