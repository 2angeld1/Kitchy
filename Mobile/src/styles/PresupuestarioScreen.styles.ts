import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * Funci\u00f3n para generar los estilos del Presupuestario con el tema din\u00e1mico.
 */
export const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    budgetCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    budgetLabel: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    budgetInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    currency: {
        fontSize: 32,
        fontWeight: '900',
        marginRight: 4,
    },
    budgetInput: {
        fontSize: 32,
        fontWeight: '800',
        minWidth: 80,
        maxWidth: 200,
        outlineStyle: 'none' as any,
        padding: 0,
    },
    progressCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${colors.primary}10`,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.primary,
        borderStyle: 'dashed',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: `${colors.surface}50`,
        borderRadius: 16,
        paddingVertical: 16,
    },
    stat: {
        alignItems: 'center',
    },
    statSeparator: {
        width: 1,
        height: 30,
        backgroundColor: colors.border,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    inputWrapper: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 30,
    },
    inputContainer: {
        flex: 1,
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        overflow: 'hidden',
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        height: '100%',
        paddingRight: 50,
        outlineStyle: 'none' as any,
    },
    micButton: {
        position: 'absolute',
        right: 6,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    listCount: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 40,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 15,
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 22,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '700',
    },
    itemDetail: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 2,
    },
    itemPrice: {
        alignItems: 'flex-end',
    },
    priceValue: {
        fontSize: 16,
        fontWeight: '800',
    },
    priceLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    }
});
