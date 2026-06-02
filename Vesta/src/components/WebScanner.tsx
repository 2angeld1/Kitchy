import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { darkTheme, lightTheme } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface WebScannerProps {
    onScanned: (data: string) => void;
    onClose: () => void;
}

export const WebScanner: React.FC<WebScannerProps> = ({ onScanned, onClose }) => {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Configuramos el escáner para la Web (PWA)
        // Este motor es mucho más estable para enfocar desde el navegador
        const scannerConfig = {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            rememberLastUsedCamera: true,
            formatsToSupport: [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.QR_CODE,
            ]
        };

        // Creamos la instancia en un div que React Native Web renderiza como un <div>
        scannerRef.current = new Html5QrcodeScanner(
            "reader",
            scannerConfig,
            /* verbose= */ false
        );

        scannerRef.current.render(
            (decodedText) => {
                // Éxito: capturamos el código y limpiamos
                if (scannerRef.current) {
                    scannerRef.current.clear().then(() => {
                        onScanned(decodedText);
                    }).catch(err => console.error("Error clearing scanner", err));
                }
            },
            (errorMessage) => {
                // Solo errores de lectura (que no encontró el barcode en ese frame)
                // No los mostramos para no saturar la consola
            }
        );

        // Limpieza al cerrar
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error("Error clearing scanner on unmouting", err));
            }
        };
    }, [onScanned]);

    return (
        <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}>
            <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
                    Escáner de Barcode (Web/PWA)
                </Text>

                {/* Este ID "reader" es donde html5-qrcode inyectará la cámara */}
                <div id="reader" style={{ width: '100%', maxWidth: '400px', borderRadius: '15px', overflow: 'hidden' }}></div>

                <TouchableOpacity
                    onPress={onClose}
                    style={{
                        backgroundColor: colors.primary,
                        marginTop: 30,
                        paddingVertical: 15,
                        paddingHorizontal: 50,
                        borderRadius: 30
                    }}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
