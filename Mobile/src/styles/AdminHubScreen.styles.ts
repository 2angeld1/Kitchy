import { StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.xl * 2 - spacing.md) / 2;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: 0,
        paddingBottom: spacing.lg,
    },
    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.black,
        color: colors.textPrimary,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.medium,
        marginTop: 4,
    },
    scrollContent: {
        paddingHorizontal: spacing.xl,
        paddingBottom: 40,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: spacing.md,
    },
    hubCard: {
        width: cardWidth,
        height: 160,
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        // Shadow Premium
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    cardTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.black,
        color: colors.textPrimary,
        textAlign: 'center',
    },
    cardDesc: {
        fontFamily: typography.fontFamily.bold,
        fontSize: 10,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: 4,
        fontWeight: typography.fontWeight.bold,
    },
    themeToggle: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    }
});
