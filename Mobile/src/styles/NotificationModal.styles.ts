import { StyleSheet, Dimensions, Platform } from 'react-native';
import { colors, spacing, typography } from '../theme';

const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        width: '100%',
        maxHeight: height * 0.8,
        padding: spacing.xl,
        paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.black,
        color: colors.textPrimary,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        marginBottom: spacing.md,
    },
    item: {
        flexDirection: 'row',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: spacing.md,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    body: {
        flex: 1,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    itemTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.black,
        color: colors.textPrimary,
    },
    time: {
        fontSize: 10,
        color: colors.textMuted,
        fontWeight: typography.fontWeight.bold,
    },
    msg: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.medium,
        lineHeight: 18,
    },
    footerBtn: {
        backgroundColor: colors.background,
        paddingVertical: spacing.md,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: spacing.md,
    },
    footerBtnText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.black,
        color: colors.textPrimary,
    },
});
