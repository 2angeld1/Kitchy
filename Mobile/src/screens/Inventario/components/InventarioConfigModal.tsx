import React from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

interface Props {
    visible: boolean;
    onClose: () => void;
    value: string;
    setValue: (v: string) => void;
    saving: boolean;
    onSave: () => void;
    categoriaNegocio: 'COMIDA' | 'BELLEZA';
    colors: any;
    styles: any;
}

export const InventarioConfigModal: React.FC<Props> = ({
    visible, onClose, value, setValue, saving, onSave, categoriaNegocio, colors, styles
}) => {
    const isBelleza = categoriaNegocio === 'BELLEZA';
    const title = isBelleza ? 'Comisión de Reventa' : 'Rentabilidad Deseada';
    const description = isBelleza 
        ? 'Establece el % global que ganarán los especialistas por la venta de productos de reventa.'
        : 'Establece el Margen de Ganancia objetivo para tus insumos y productos.';
    const icon = isBelleza ? 'cash-outline' : 'trending-up-outline';

    return (
        <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
            <Animated.View entering={FadeIn.duration(200)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <View style={{ backgroundColor: colors.card, borderRadius: 28, padding: 24, width: '100%', maxWidth: 400, borderWidth: 1, borderColor: colors.border, alignItems: 'center', elevation: 5 }}>
                    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: `${colors.primary}15`, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                        <Ionicons name={icon as any} size={32} color={colors.primary} />
                    </View>

                    <Text style={{ fontSize: 22, fontWeight: '900', color: colors.textPrimary, marginBottom: 8, textAlign: 'center' }}>
                        {title}
                    </Text>
                    
                    <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
                        {description}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 20, width: '100%', marginBottom: 32 }}>
                        <TextInput
                            style={{
                                height: 70,
                                fontSize: 40,
                                fontWeight: '900',
                                color: colors.textPrimary,
                                textAlign: 'center',
                                minWidth: 80,
                            }}
                            value={value}
                            onChangeText={setValue}
                            keyboardType="numeric"
                            autoFocus={true}
                            maxLength={2}
                        />
                        <Text style={{ fontSize: 32, fontWeight: '900', color: colors.textMuted }}>%</Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                        <TouchableOpacity 
                            style={{ flex: 1, paddingVertical: 16, borderRadius: 20, alignItems: 'center', backgroundColor: colors.surface }} 
                            onPress={onClose}
                        >
                            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textSecondary }}>Cancelar</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={{ flex: 1, paddingVertical: 16, borderRadius: 20, alignItems: 'center', backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'center' }} 
                            onPress={onSave} 
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                            ) : null}
                            <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>
                                {saving ? 'Guardando...' : 'Aplicar'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </Modal>
    );
};
