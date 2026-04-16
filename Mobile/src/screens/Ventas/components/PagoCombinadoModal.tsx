import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PagoCombinadoModalProps {
    visible: boolean;
    total: number;
    colors: any;
    onClose: () => void;
    onConfirm: (combinacion: { metodo: string; monto: number }[]) => void;
}

export const PagoCombinadoModal: React.FC<PagoCombinadoModalProps> = ({ visible, total, colors, onClose, onConfirm }) => {
    const [metodo1, setMetodo1] = useState<string>('yappy');
    const [monto1, setMonto1] = useState<string>('');
    const [metodo2, setMetodo2] = useState<string>('tarjeta');

    // Auto-calculate remaining amount for method 2
    const montoCalculado1 = parseFloat(monto1) || 0;
    const monto2 = Math.max(0, total - montoCalculado1).toFixed(2);

    useEffect(() => {
        if (visible) {
            setMonto1('');
        }
    }, [visible]);

    useEffect(() => {
        if (metodo1 === metodo2) {
            const options = ['efectivo', 'yappy', 'tarjeta'];
            const nextMethod = options.find(m => m !== metodo1);
            if (nextMethod) setMetodo2(nextMethod);
        }
    }, [metodo1]);

    const handleConfirm = () => {
        if (montoCalculado1 <= 0 || montoCalculado1 >= total) return;
        if (metodo1 === metodo2) return;

        onConfirm([
            { metodo: metodo1, monto: montoCalculado1 },
            { metodo: metodo2, monto: parseFloat(monto2) }
        ]);
    };

    const isValido = montoCalculado1 > 0 && montoCalculado1 < total && metodo1 !== metodo2;

    const renderMetodoSelector = (selected: string, onSelect: (m: string) => void, disabledMethod?: string) => (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            {['efectivo', 'yappy', 'tarjeta'].map(m => {
                const isDisabled = m === disabledMethod;
                return (
                    <TouchableOpacity
                        key={m}
                        onPress={() => !isDisabled && onSelect(m)}
                        activeOpacity={isDisabled ? 1 : 0.7}
                        style={{
                            flex: 1,
                            paddingVertical: 10,
                            backgroundColor: isDisabled ? colors.surface + '80' : (selected === m ? colors.primary + '20' : colors.surface),
                            borderColor: isDisabled ? colors.border : (selected === m ? colors.primary : colors.border),
                            borderWidth: 1.5,
                            borderRadius: 12,
                            alignItems: 'center',
                            opacity: isDisabled ? 0.4 : 1
                        }}
                    >
                        <Text style={{
                            color: selected === m && !isDisabled ? colors.primary : colors.textSecondary,
                            fontWeight: 'bold',
                            textTransform: 'capitalize',
                            fontSize: 13
                        }}>{m}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={[styles.content, { backgroundColor: colors.card }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Pago Combinado</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <Text style={{ textAlign: 'center', fontSize: 13, color: colors.textMuted, marginBottom: 20 }}>
                        Total a pagar: <Text style={{ fontWeight: '900', color: colors.primary, fontSize: 16 }}>${total.toFixed(2)}</Text>
                    </Text>

                    {/* Primer Método */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.textPrimary }]}>Primer método y cuánto pagará:</Text>
                        {renderMetodoSelector(metodo1, setMetodo1)}
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                            placeholder="Monto Ejemplo: 5.00"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="numeric"
                            value={monto1}
                            onChangeText={setMonto1}
                        />
                    </View>

                    <View style={{ alignItems: 'center', marginVertical: 10 }}>
                        <Ionicons name="add-circle" size={32} color={colors.primary + '80'} />
                    </View>

                    {/* Segundo Método */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.textPrimary }]}>Segundo método (Restante: ${monto2}):</Text>
                        {renderMetodoSelector(metodo2, setMetodo2, metodo1)}
                    </View>

                    <TouchableOpacity
                        onPress={handleConfirm}
                        disabled={!isValido}
                        style={[
                            styles.confirmBtn,
                            { backgroundColor: isValido ? colors.primary : colors.surface, borderColor: isValido ? colors.primary : colors.border }
                        ]}
                    >
                        <Text style={{ color: isValido ? '#fff' : colors.textMuted, fontWeight: '900', fontSize: 16 }}>
                            CONFIRMAR COMBINACIÓN
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    content: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
    },
    closeBtn: {
        padding: 4,
    },
    section: {
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    input: {
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    confirmBtn: {
        marginTop: 30,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
    }
});
