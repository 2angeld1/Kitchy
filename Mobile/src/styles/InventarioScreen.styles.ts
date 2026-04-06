import { StyleSheet } from 'react-native';

export const createStyles = (colors: any, width: number) => {
    const isTablet = width > 768;

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: isTablet ? 32 : 24,
            paddingTop: 16,
            paddingBottom: 8,
        },
        searchInputWrapper: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            height: 52,
            borderRadius: 26,
            paddingHorizontal: 16,
            marginRight: 8,
            borderWidth: 1,
            backgroundColor: colors.surface,
            borderColor: colors.border,
        },
        searchInput: {
            flex: 1,
            marginLeft: 8,
            fontSize: isTablet ? 16 : 14,
            fontWeight: '500',
            height: '100%',
            color: colors.textPrimary,
        },
        smartHint: {
            paddingHorizontal: isTablet ? 32 : 24,
            fontSize: isTablet ? 14 : 12,
            marginBottom: 8,
            fontStyle: 'italic',
        },
        filterContainer: {
            width: '100%',
            marginBottom: 8,
        },
        filterOptions: {
            flexDirection: 'row',
            paddingHorizontal: isTablet ? 32 : 24,
            gap: 8,
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        filterChip: {
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 20,
            borderWidth: 1,
            backgroundColor: colors.card,
            borderColor: colors.border,
        },
        filterChipActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        filterText: {
            fontSize: isTablet ? 12 : 10,
            fontWeight: '800',
            textTransform: 'uppercase',
            color: colors.textSecondary,
        },
        filterTextActive: {
            color: '#fff',
        },
        listContainer: {
            paddingHorizontal: isTablet ? 32 : 24,
            paddingTop: 15,
            paddingBottom: 120,
        },
        itemCard: {
            flexDirection: 'row',
            paddingVertical: 20,
            paddingHorizontal: 4,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            alignItems: 'center',
            backgroundColor: colors.background,
        },
        itemIconBox: {
            width: isTablet ? 56 : 44,
            height: isTablet ? 56 : 44,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
            backgroundColor: colors.card,
        },
        itemInfo: {
            flex: 1,
        },
        itemHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 2,
        },
        itemTitle: {
            fontSize: isTablet ? 18 : 15,
            fontWeight: '700',
            color: colors.textPrimary,
        },
        itemQty: {
            fontSize: isTablet ? 18 : 15,
            fontWeight: '700',
            color: colors.primary,
        },
        itemSub: {
            fontSize: isTablet ? 14 : 12,
            color: colors.textSecondary,
        },
    stockWarning: {
        fontSize: 11,
        fontWeight: '800',
        color: '#ef4444',
        marginTop: 4,
    },
    vencimientoText: {
        fontSize: 10,
        marginTop: 2,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 15,
        color: colors.textMuted,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // FAB
    fab: {
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
    fabMenuLabel: {
        backgroundColor: colors.card,
        color: colors.textPrimary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        fontSize: 13,
        fontWeight: '800',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.card,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: colors.textPrimary,
    },
    modalScroll: {
        paddingBottom: 40,
    },
    formRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 8,
    },
    inputSmall: {
        flex: 1,
    },
    // IA Overlay
    iaOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iaCard: {
        backgroundColor: colors.card,
        padding: 30,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iaTitle: {
        fontSize: 22,
        fontWeight: '900',
        marginTop: 20,
        color: colors.textPrimary,
    },
    iaSubtitle: {
        fontSize: 14,
        color: colors.textMuted,
        marginTop: 10,
        textAlign: 'center',
    },
    // Right Actions
    rightAction: {
        width: 60,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    }
    });
};
