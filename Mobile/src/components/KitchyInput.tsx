import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

interface KitchyInputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export function KitchyInput({ label, error, style, ...rest }: KitchyInputProps) {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    error ? styles.inputError : null,
                    style
                ]}
                placeholderTextColor={colors.textMuted}
                {...rest}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.black,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },
    input: {
        width: '100%',
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: borderRadius.lg,
        paddingHorizontal: 20,
        paddingVertical: spacing.md,
        fontSize: typography.fontSize.base,
        color: colors.textPrimary,
        fontWeight: typography.fontWeight.bold,
    },
    inputError: {
        borderColor: colors.error,
        borderWidth: 2,
    },
    errorText: {
        color: colors.error,
        fontSize: typography.fontSize.sm,
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    }
});
