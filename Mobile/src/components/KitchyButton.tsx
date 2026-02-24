import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, TouchableOpacityProps } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../theme';

interface KitchyButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
    variant?: 'primary' | 'dark'; // Añadí un dark variant para el login
}

export function KitchyButton({ title, loading, variant = 'primary', style, ...rest }: KitchyButtonProps) {

    const isPrimary = variant === 'primary';
    const bgColor = isPrimary ? colors.primary : colors.textPrimary;
    const shadowColor = isPrimary ? colors.primary : colors.textPrimary;

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={[
                styles.button,
                { backgroundColor: bgColor, shadowColor: shadowColor },
                loading && styles.buttonDisabled,
                style
            ]}
            disabled={loading || rest.disabled}
            {...rest}
        >
            {loading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text style={styles.buttonText}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.xl,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: colors.white,
        fontWeight: typography.fontWeight.black,
        fontSize: typography.fontSize.lg,
    }
});
