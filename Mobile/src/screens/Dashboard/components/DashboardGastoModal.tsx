import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { KitchyInput } from '../../../components/KitchyInput';
import { KitchyButton } from '../../../components/KitchyButton';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSave: (desc: string, monto: number, cat: string) => Promise<boolean>;
    loading: boolean;
    colors: any;
    styles: any;
}

export const DashboardGastoModal: React.FC<Props> = ({ visible, onClose, onSave, loading, colors, styles }) => {
    const [form, setForm] = useState({ desc: '', monto: '', cat: 'servicios' });

    const handleSave = async () => {
        const success = await onSave(form.desc, parseFloat(form.monto), form.cat);
        if (success) {
            setForm({ desc: '', monto: '', cat: 'servicios' });
            onClose();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <Animated.View entering={FadeInDown.springify().damping(15)} style={[styles.notificationModal, { backgroundColor: colors.card }]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Registrar Gasto Operativo</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={32} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <KitchyInput label="Descripci\u00f3n" value={form.desc} onChangeText={(t) => setForm({ ...form, desc: t })} placeholder="Luz, Gas, Renta..." />
                    <KitchyInput label="Monto ($)" value={form.monto} onChangeText={(t) => setForm({ ...form, monto: t })} keyboardType="decimal-pad" placeholder="0.00" />

                    <Text style={[styles.cardLabel, { color: colors.textMuted, marginTop: 10, marginBottom: 10 }]}>Categor\u00eda</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                        {['servicios', 'renta', 'personal', 'mantenimiento', 'impuestos', 'otro'].map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={{
                                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
                                    borderColor: form.cat === cat ? colors.primary : colors.border,
                                    backgroundColor: form.cat === cat ? 'rgba(225, 29, 72, 0.1)' : 'transparent'
                                }}
                                onPress={() => setForm({ ...form, cat })}
                            >
                                <Text style={{ fontSize: 12, color: form.cat === cat ? colors.primary : colors.textSecondary, textTransform: 'capitalize' }}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <KitchyButton
                        title="Guardar Gasto"
                        onPress={handleSave}
                        loading={loading}
                    />
                </Animated.View>
            </View>
        </Modal>
    );
};
