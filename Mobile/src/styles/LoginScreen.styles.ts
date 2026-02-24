import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        position: 'relative',
    },
    blurCircle: {
        position: 'absolute',
        top: '-10%',
        right: '-20%',
        width: 288,
        height: 288,
        backgroundColor: 'rgba(225, 29, 72, 0.1)',
        borderRadius: 144,
        zIndex: -1,
    },
    headerContainer: {
        marginBottom: spacing.xxl,
    },
    logoContainer: {
        width: 64,
        height: 64,
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    logoText: {
        fontSize: 30,
        fontWeight: typography.fontWeight.black,
        color: colors.white,
    },
    logoDot: {
        color: colors.primary,
    },
    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.black,
        color: colors.textPrimary,
        letterSpacing: -1,
        marginBottom: spacing.sm,
    },
    subtitle: {
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.medium,
        fontSize: typography.fontSize.base,
    },
    formContainer: {
        gap: spacing.sm,
    },
    globalError: {
        color: colors.error,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    footerContainer: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.textSecondary,
    },
    footerLink: {
        fontWeight: typography.fontWeight.black,
        color: colors.primary,
        fontSize: typography.fontSize.sm,
    }
});
