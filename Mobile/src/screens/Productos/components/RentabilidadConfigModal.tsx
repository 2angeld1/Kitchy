import React from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

interface Props {
    visible: boolean;
    onClose: () => void;
    margenInput: string;
    setMargenInput: (v: string) => void;
    savingConfig: boolean;
    onSave: () => void;
    colors: any;
    styles: any;
}

export const RentabilidadConfigModal: React.FC<Props> = ({ 
    visible, onClose, margenInput, setMargenInput, savingConfig, onSave, colors, styles 
}) => {
    return (
        <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
            <Animated.View entering={FadeIn.duration(200)} style={[styles.modalOverlay, { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
                <View style={{ backgroundColor: colors.card, borderRadius: 24, padding: 24, paddingBottom: 32, borderWidth: 1, borderColor: colors.border, alignItems: 'center', width: '100%', maxWidth: 400 }}>
                    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: `${colors.primary}20`, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                        <Ionicons name="trending-up" size={28} color={colors.primary} />
                    </View>
                    <Text style={{ fontSize: 20, fontWeight: '900', color: colors.textPrimary, marginBottom: 8, textAlign: 'center' }}>Rentabilidad Deseada</Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginBottom: 20 }}>
                        Establece el <Text style={{ fontWeight: 'bold' }}>Margen de Ganancia Objetivo</Text>. Caitlyn te avisar\u00e1 si alg\u00fan producto cae por debajo de esta meta.
                    </Text>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 16, width: '100%', marginBottom: 24 }}>
                        <TextInput 
                            style={{ height: 56, fontSize: 32, fontWeight: '900', color: colors.textPrimary, textAlign: 'center', minWidth: 60 }}
                            value={margenInput}
                            onChangeText={setMargenInput}
                            keyboardType="numeric"
                            maxLength={2}
                        />
                        <Text style={{ fontSize: 32, fontWeight: '900', color: colors.textMuted }}>%</Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                        <TouchableOpacity style={{ flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center', backgroundColor: colors.surface }} onPress={onClose}>
                            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textSecondary }}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center', backgroundColor: colors.primary }} onPress={onSave} disabled={savingConfig}>
                            <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>{savingConfig ? 'Guardando...' : 'Guardar Meta'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </Modal>
    );
};
