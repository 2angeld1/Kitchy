import { StyleSheet, Platform } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.md,
        marginRight: spacing.sm,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        height: '100%',
    },
    filterContainer: {
        flexGrow: 0,
        height: 50,
        marginBottom: spacing.sm,
    },
    filterOptions: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xl,
        gap: spacing.sm,
        alignItems: 'center',
    },
    filterChip: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
    },
    filterText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.bold,
        textTransform: 'uppercase',
    },
    listContainer: {
        paddingHorizontal: spacing.xl,
        paddingBottom: 100, // padding for fab
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: spacing.md,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
    },
    itemCard: {
        flexDirection: 'row',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xs,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    itemIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        marginBottom: 2,
    },
    itemSub: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
    },
    stockWarning: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.bold,
        color: colors.error,
        marginTop: 4,
    },
    itemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    actionBtn: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 1,
    },
    qtyBadgeText: {
        fontSize: 10,
        fontFamily: typography.fontFamily.black,
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: spacing.lg,
        right: spacing.xl,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },

    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: spacing.xl,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    modalTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.black,
    },
    modalScroll: {
        paddingBottom: 40,
    },
    formRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    inputSmall: {
        flex: 1,
    },
    actionButtonGroup: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.md,
    }
});
