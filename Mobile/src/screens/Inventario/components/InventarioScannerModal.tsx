import React from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, Platform, Animated as RNAnimated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { CameraView } from 'expo-camera';
import { WebScanner } from '../../../components/WebScanner';

interface Props {
    visible: boolean;
    onClose: () => void;
    hasPermission: boolean | null;
    requestCameraPermission: () => void;
    onScanned: (data: string) => void;
    scanned: boolean;
    scannerZoom: number;
    scannerSettings: any;
    tapCoords: { x: number, y: number } | null;
    onTap: (event: any) => void;
    colors: any;
    styles: any;
}

export const InventarioScannerModal: React.FC<Props> = ({
    visible, onClose, hasPermission, requestCameraPermission, onScanned, scanned, 
    scannerZoom, scannerSettings, tapCoords, onTap, colors, styles
}) => {
    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: '#000' }}>
                {hasPermission === null ? (
                    <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>
                ) : hasPermission === false ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                        <Ionicons name="camera-reverse-outline" size={64} color="#ef4444" />
                        <Text style={{ color: '#fff', marginTop: 20, textAlign: 'center', fontSize: 18 }}>Sin permiso de c\u00e1mara</Text>
                        <TouchableOpacity onPress={requestCameraPermission} style={{ backgroundColor: colors.primary, marginTop: 20, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 25 }}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Habilitar</Text>
                        </TouchableOpacity>
                    </View>
                ) : Platform.OS === 'web' ? (
                    <WebScanner
                        onScanned={onScanned}
                        onClose={onClose}
                    />
                ) : (
                    <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={onTap}>
                        <CameraView
                            style={{ flex: 1 }}
                            facing="back"
                            zoom={scannerZoom}
                            barcodeScannerSettings={scannerSettings}
                            onBarcodeScanned={scanned ? undefined : (result) => onScanned(result.data)}
                        />
                        {tapCoords && (
                            <Animated.View 
                                entering={FadeIn} 
                                style={{ 
                                    position: 'absolute', 
                                    left: tapCoords.x - 30, 
                                    top: tapCoords.y - 30, 
                                    width: 60, height: 60, borderRadius: 30, 
                                    borderWidth: 2, borderColor: colors.primary, 
                                    backgroundColor: 'rgba(255,255,255,0.1)' 
                                }} 
                            />
                        )}
                        <View style={{ position: 'absolute', top: 100, left: 20, right: 20, alignItems: 'center' }}>
                            <View style={{ width: 250, height: 250, borderWidth: 2, borderColor: colors.primary, borderStyle: 'dotted', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                            <Text style={{ color: '#fff', marginTop: 20, fontSize: 16, textAlign: 'center', fontWeight: '600' }}>Apunta al c\u00f3digo de barras</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.6)', marginTop: 10, fontSize: 12 }}>Toca la pantalla para enfocar</Text>
                        </View>
                    </TouchableOpacity>
                )}
                <View style={{ position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center' }}>
                    <TouchableOpacity onPress={onClose} style={{ backgroundColor: colors.primary, paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 }}>
                        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
