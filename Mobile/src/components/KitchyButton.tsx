import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, TouchableOpacityProps } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../theme';

interface KitchyButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
    variant?: 'primary' | 'dark' | 'outline';
}

export function KitchyButton({ title, loading, variant = 'primary', style, ...rest }: KitchyButtonProps) {

    const isPrimary = variant === 'primary';
    const isOutline = variant === 'outline';
    const bgColor = isOutline ? 'transparent' : (isPrimary ? colors.primary : colors.textPrimary);
    const shadowColor = isOutline ? 'transparent' : (isPrimary ? colors.primary : colors.textPrimary);
    const textColor = isOutline ? colors.primary : colors.white;

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={[
                styles.button,
                { backgroundColor: bgColor, shadowColor: shadowColor },
                isOutline && { borderWidth: 2, borderColor: colors.primary, elevation: 0, shadowOpacity: 0 },
                loading && styles.buttonDisabled,
                style
            ]}
            disabled={loading || rest.disabled}
            {...rest}
        >
            {loading ? (
                <ActivityIndicator color={textColor} />
            ) : (
                <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
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
        fontFamily: typography.fontFamily.black,
        color: colors.white,
        fontWeight: typography.fontWeight.black,
        fontSize: typography.fontSize.lg,
    }
});
