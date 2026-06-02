import { StyleSheet, Dimensions, Platform } from 'react-native';
import { spacing, typography, borderRadius } from '../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

export const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingBottom: 380,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: 15,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    productCardWrapper: {
        width: CARD_WIDTH,
    },
    productCard: {
        borderRadius: 24,
        padding: 16,
        borderWidth: 2,
        height: 140,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productInfo: {
        // No extra styles needed yet
    },
    productName: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: '900',
        color: '#10b981',
        marginTop: 2,
    },
    emptyContainer: {
        flex: 1,
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: colors.textMuted,
        marginTop: 10,
        textAlign: 'center',
    },
    atendidoSection: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    atendidoTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: 12,
    },
    especialistaChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 15,
        borderWidth: 1.5,
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    especialistaText: {
        fontSize: 12,
        fontWeight: '700',
    },
    clienteSection: {
        padding: 20,
    },
    inputContainer: {
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
    },
    textInput: {
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        fontWeight: '600',
    },
    // Ticket Styles
    ticketContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 25,
    },
    paymentMethods: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 15,
    },
    paymentBtn: {
        flex: 1,
        height: 40,
        borderRadius: 12,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    paymentText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    billetesContainer: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 15,
    },
    billeteBtn: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
    },
    billeteText: {
        fontWeight: 'bold',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 15,
    },
    totalLabel: {
        fontSize: 11,
    },
    totalValue: {
        fontSize: 32,
        fontWeight: '900',
    },
    cambioText: {
        fontSize: 14,
        color: '#10b981',
        fontWeight: '900',
        marginBottom: 5,
    },
    cobrarBtn: {
        height: 60,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    cobrarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
    },
    undoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    undoText: {
        color: '#ef4444',
        fontWeight: 'bold',
        fontSize: 12,
    },
    successOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        pointerEvents: 'none',
    },
    successCircle: {
        backgroundColor: '#10b981',
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
