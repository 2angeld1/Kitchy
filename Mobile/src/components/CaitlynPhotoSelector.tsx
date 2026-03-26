import React from 'react';
import { View, Text, TouchableOpacity, Image, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown } from 'react-native-reanimated';

interface CaitlynPhotoSelectorProps {
    visible: boolean;
    onClose: () => void;
    onTakePhoto: () => void;
    onPickImage: () => void;
    colors: any;
}

export const CaitlynPhotoSelector: React.FC<CaitlynPhotoSelectorProps> = ({
    visible,
    onClose,
    onTakePhoto,
    onPickImage,
    colors
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
                activeOpacity={1}
                onPress={onClose}
            >
                <Animated.View 
                    entering={SlideInDown}
                    style={{ 
                        backgroundColor: colors.card, 
                        borderTopLeftRadius: 30, 
                        borderTopRightRadius: 30,
                        padding: 25,
                        paddingBottom: Platform.OS === 'ios' ? 40 : 25,
                    }}
                >
                    <View style={{ alignItems: 'center', marginBottom: 20 }}>
                        <View style={{ width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, marginBottom: 20 }} />
                        <Image 
                            source={require('../../assets/caitlyn_avatar.png')} 
                            style={{ width: 60, height: 60, borderRadius: 30, marginBottom: 12 }} 
                        />
                        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>¿Cómo quieres añadir tu lista?</Text>
                        <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
                            Caitlyn puede leer fotos de tu celular o capturar una nueva.
                        </Text>
                    </View>

                    <View style={{ gap: 12 }}>
                        <TouchableOpacity 
                            style={{ 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                backgroundColor: colors.primary + '15', 
                                padding: 16, 
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: colors.primary + '30'
                            }}
                            onPress={() => {
                                onClose();
                                setTimeout(onTakePhoto, 300);
                            }}
                        >
                            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                                <Ionicons name="camera" size={24} color="#fff" />
                            </View>
                            <View>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>Tomar Foto</Text>
                                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Captura tu lista ahora mismo</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={{ 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                backgroundColor: colors.surface, 
                                padding: 16, 
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: colors.border
                            }}
                            onPress={() => {
                                onClose();
                                setTimeout(onPickImage, 300);
                            }}
                        >
                            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: colors.border }}>
                                <Ionicons name="images" size={24} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>Elegir Galería</Text>
                                <Text style={{ fontSize: 12, color: colors.textSecondary }}>Busca una foto en tu dispositivo</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={{ marginTop: 8, padding: 16, alignItems: 'center' }}
                            onPress={onClose}
                        >
                            <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
};
