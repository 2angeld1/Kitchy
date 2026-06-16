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
        gap: spacing.md,
        marginTop: spacing.md,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: colors.textSecondary,
        marginBottom: -spacing.xs,
    },
    stepTitle: {
        fontFamily: typography.fontFamily.black,
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.black,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    imagePickerContainer: {
        width: '100%',
        height: 120,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    pickerPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    globalError: {
        color: colors.error,
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    inputWithHelper: {
        marginBottom: spacing.xs,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.xs,
    },
    gpsButtonInline: {
        borderWidth: 1,
        borderColor: colors.primary,
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: borderRadius.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
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
