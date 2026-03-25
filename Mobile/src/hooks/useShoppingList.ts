import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { parseShoppingList, learnPrice } from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { ShoppingItem } from '../screens/PresupuestarioScreen'; // Reutilizamos la interfaz
import Toast from 'react-native-toast-message';

export const useShoppingList = () => {
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // --- Voz ---
    useSpeechRecognitionEvent("start", () => setIsListening(true));
    useSpeechRecognitionEvent("end", () => setIsListening(false));
    useSpeechRecognitionEvent("result", (event) => {
        const text = event.results[0]?.transcript;
        if (text && event.isFinal) {
            handleTextParse(text);
        }
    });

    const startListening = async () => {
        if (isListening) return ExpoSpeechRecognitionModule.stop();
        const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!granted) return Toast.show({ type: 'error', text1: 'Permiso denegado', text2: 'Necesitamos el micrófono para el presupuesto.' });
        
        try {
            ExpoSpeechRecognitionModule.start({ lang: "es-ES", interimResults: true });
        } catch (err) {
            console.error("Error al iniciar voz:", err);
            setIsListening(false);
        }
    };

    // --- Procesamiento ---
    const handleTextParse = async (text: string) => {
        setIsAnalyzing(true);
        try {
            const response = await parseShoppingList(text);
            if (response.data.success) {
                const newItems = response.data.data.items.map((item: any) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    nombre: item.nombre,
                    cantidad: item.cantidad,
                    unidad: item.unidad,
                    precioEstimado: item.precioEstimado,
                    confirmado: false
                }));
                setItems(prev => [...prev, ...newItems]);
                Toast.show({ type: 'success', text1: 'Lista actualizada', text2: `Caitlyn añadió ${newItems.length} productos.` });
            }
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Caitlyn no pudo procesar tu voz.' });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handlePhotoInput = async () => {
        Alert.alert(
            "📷 Añadir lista por foto",
            "¿Quieres tomar una foto nueva o elegir una de tu galería?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Tomar Foto", 
                    onPress: async () => {
                        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
                        if (!granted) return Toast.show({ type: 'error', text1: 'Permiso denegado', text2: 'No podemos abrir la cámara.' });
                        
                        const result = await ImagePicker.launchCameraAsync({
                            allowsEditing: true,
                            quality: 0.8,
                            base64: true
                        });
                        if (!result.canceled) processImage(result.assets[0].base64!);
                    } 
                },
                { 
                    text: "Elegir Galería", 
                    onPress: async () => {
                        const result = await ImagePicker.launchImageLibraryAsync({
                            allowsEditing: true,
                            quality: 0.8,
                            base64: true
                        });
                        if (!result.canceled) processImage(result.assets[0].base64!);
                    } 
                }
            ]
        );
    };

    const processImage = async (base64: string) => {
        setIsAnalyzing(true);
        try {
            const response = await parseShoppingList(undefined, `data:image/jpeg;base64,${base64}`);
            if (response.data.success) {
                const newItems = response.data.data.items.map((item: any) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    nombre: item.nombre,
                    cantidad: item.cantidad,
                    unidad: item.unidad,
                    precioEstimado: item.precioEstimado,
                    confirmado: false
                }));
                setItems(prev => [...prev, ...newItems]);
                Toast.show({ type: 'success', text1: 'Foto analizada', text2: 'Caitlyn leyó tu lista de compras.' });
            }
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Error al procesar la imagen.' });
        } finally {
            setIsAnalyzing(false);
        }
    };

    // --- Gestión de Items ---
    const toggleConfirm = (id: string, price?: number) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                // Si estamos confirmando y hay un precio real, podr\u00edamos reportarlo
                if (!item.confirmado && price) {
                    learnPrice(item.nombre, price).catch(console.error);
                }
                return { ...item, confirmado: !item.confirmado, precioReal: price || item.precioReal };
            }
            return item;
        }));
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    return {
        items,
        loading,
        isListening,
        isAnalyzing,
        startListening,
        handleTextParse,
        handlePhotoInput,
        toggleConfirm,
        removeItem,
        setItems
    };
};
