import { StyleSheet } from 'react-native';

export const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textMuted,
        marginBottom: 24,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    badge: {
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        color: '#8b5cf6',
        fontWeight: '800',
    },
    cardSubtitle: {
        fontSize: 11,
        color: colors.textMuted,
        marginLeft: 8,
    },
    addBtn: {
        marginTop: 20,
        backgroundColor: colors.surface,
        paddingVertical: 16,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addBtnText: {
        color: colors.textPrimary,
        fontWeight: '700',
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.card,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: 16,
    },
    modalInput: {
        backgroundColor: colors.background,
        padding: 16,
        borderRadius: 16,
        color: colors.textPrimary,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cancelBtn: {
        marginTop: 16,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: colors.textMuted,
    }
});
