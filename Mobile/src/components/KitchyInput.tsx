import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { lightTheme, darkTheme, spacing, borderRadius, typography } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface KitchyInputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export function KitchyInput({ label, error, style, ...rest }: KitchyInputProps) {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    return (
        <View style={styles.container}>
            {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.textPrimary
                    },
                    error ? { borderColor: colors.error, borderWidth: 2 } : null,
                    style
                ]}
                placeholderTextColor={colors.textMuted}
                {...rest}
            />
            {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.black,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },
    input: {
        fontFamily: typography.fontFamily.medium,
        width: '100%',
        borderWidth: 1,
        borderRadius: borderRadius.lg,
        paddingHorizontal: 20,
        paddingVertical: spacing.md,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.bold,
    },
    errorText: {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.sm,
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    }
});
