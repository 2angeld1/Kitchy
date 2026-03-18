import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { KitchyInput } from '../../../components/KitchyInput';
import { KitchyButton } from '../../../components/KitchyButton';

interface Props {
    visible: boolean;
    onClose: () => void;
    movTipo: 'entrada' | 'salida' | 'merma';
    selectedItem: any;
    movCosto: string; setMovCosto: (v: string) => void;
    movCantidad: string; setMovCantidad: (v: string) => void;
    movMotivo: string; setMovMotivo: (v: string) => void;
    onConfirm: () => void;
    loading: boolean;
    categoriaNegocio: string;
    colors: any;
    styles: any;
}

export const InventarioMovimientoModal: React.FC<Props> = ({
    visible, onClose, movTipo, selectedItem, 
    movCosto, setMovCosto, movCantidad, setMovCantidad, movMotivo, setMovMotivo,
    onConfirm, loading, categoriaNegocio, colors, styles
}) => {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <Animated.View entering={SlideInDown.springify().damping(15)} style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {movTipo === 'entrada' ? 'Registrar Entrada' : movTipo === 'merma' ? 'Reportar Merma' : 'Registrar Salida'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={32} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <Text style={{ color: colors.textSecondary, marginBottom: 20 }}>
                        Item: <Text style={{ fontWeight: '800', color: colors.textPrimary }}>{selectedItem?.nombre}</Text>
                    </Text>

                    {movTipo === 'entrada' && (
                        <KitchyInput label="Costo Total de la Compra" value={movCosto} onChangeText={setMovCosto} keyboardType="numeric" placeholder="$0.00" />
                    )}
                    <KitchyInput label="Cantidad" value={movCantidad} onChangeText={setMovCantidad} keyboardType="numeric" placeholder="0" />
                    <KitchyInput 
                        label="Motivo / Nota" 
                        value={movMotivo} 
                        onChangeText={setMovMotivo} 
                        placeholder={movTipo === 'merma' ? 'Ej. Producto vencido' : categoriaNegocio === 'BELLEZA' ? 'Ej. Uso en corte' : 'Ej. Uso en cocina'} 
                    />

                    <KitchyButton
                        title="Confirmar"
                        onPress={onConfirm}
                        loading={loading}
                    />
                </Animated.View>
            </View>
        </Modal>
    );
};
