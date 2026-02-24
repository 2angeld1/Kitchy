import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xxl,
        position: 'relative',
    },
    blurCircle: {
        position: 'absolute',
        bottom: '-10%',
        right: '10%',
        width: 288,
        height: 288,
        backgroundColor: 'rgba(168, 85, 247, 0.1)', // purple-500/10
        borderRadius: 144,
        zIndex: -1,
    },
    headerContainer: {
        marginBottom: spacing.xl,
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
        shadowOpacity: 0.1,
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
        gap: spacing.xs,
    },
    globalError: {
        color: colors.error,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    footerContainer: {
        marginTop: spacing.xl,
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
