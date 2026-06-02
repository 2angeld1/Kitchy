import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    tabText: {
        fontWeight: '800',
        fontSize: 14,
        marginLeft: 8,
    },
    scroll: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    espCard: {
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 16,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            }
        })
    },
    espHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    espInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    espName: {
        fontSize: 16,
        fontWeight: '800',
    },
    espMeta: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    espTotals: {
        alignItems: 'flex-end',
    },
    totalLabel: {
        fontSize: 10,
        color: '#888',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: '900',
    },
    espDetail: {
        padding: 16,
        paddingTop: 0,
    },
    detailSectionTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#666',
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    itemRow: {
        flexDirection: 'row',
        marginBottom: 14,
        alignItems: 'center',
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
    },
    itemDate: {
        fontSize: 10,
        color: '#999',
    },
    itemLabel: {
        fontSize: 9,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    itemValue: {
        fontSize: 13,
        fontWeight: '600',
    },
    summaryFooter: {
        borderRadius: 16,
        padding: 16,
        marginTop: 8,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    footerLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    footerValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    generateBtn: {
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    generateBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '900',
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
    divider: {
        height: 1,
        width: '100%',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
    }
});
