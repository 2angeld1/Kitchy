import { StyleSheet } from 'react-native';

export const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    settingsBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resumenCard: {
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    labelResumen: {
        color: colors.textSecondary,
        fontSize: 12,
        marginBottom: 4,
    },
    montoGeneral: {
        color: colors.textPrimary,
        fontSize: 32,
        fontWeight: '900',
    },
    descResumen: {
        color: colors.textMuted,
        fontSize: 12,
        marginTop: 4,
    },
    rowMonto: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 12,
    },
    cardMonto: {
        flex: 1,
        padding: 12,
        borderRadius: 14,
    },
    especialistaLabel: {
        fontSize: 10,
        fontWeight: '700',
    },
    especialistaMonto: {
        fontSize: 20,
        fontWeight: '800',
    },
    configMeta: {
        marginTop: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        color: colors.textMuted,
        fontSize: 11,
    },
    sectionTitle: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    especialistaCard: {
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },
    especialistaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    espInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    espName: {
        color: colors.textPrimary,
        fontWeight: '700',
        fontSize: 15,
    },
    espSubtitle: {
        color: colors.textMuted,
        fontSize: 12,
    },
    montoCol: {
        alignItems: 'flex-end',
    },
    montoEsp: {
        color: '#8b5cf6',
        fontWeight: '800',
        fontSize: 16,
    },
    montoTotalEsp: {
        color: colors.textMuted,
        fontSize: 10,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyTitle: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 16,
    },
    emptySubtitle: {
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: colors.card,
        borderRadius: 28,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.border,
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
    modalDesc: {
        color: colors.textMuted,
        fontSize: 13,
        marginBottom: 20,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    inputCol: {
        flex: 1,
    },
    infoBento: {
        backgroundColor: 'rgba(139, 92, 246, 0.05)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
    },
    infoText: {
        fontSize: 11,
        color: colors.textSecondary,
    }
});
