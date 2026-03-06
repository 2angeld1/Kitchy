import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image, Modal, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../theme';
import Toast from 'react-native-toast-message';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';
import { getGastos, deleteGasto } from '../services/api';

export default function GastosScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    const [gastos, setGastos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const cargarGastos = async () => {
        try {
            const response = await getGastos();
            setGastos(response.data);
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar los factores/gastos' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        cargarGastos();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        cargarGastos();
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteGasto(id);
            Toast.show({ type: 'success', text1: 'Gasto eliminado', text2: 'Se eliminó correctamente.' });
            cargarGastos();
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar el gasto' });
        }
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        return (
            <Animated.View
                entering={FadeInDown.delay(index * 50)}
                style={{
                    backgroundColor: colors.card,
                    marginHorizontal: 16,
                    marginBottom: 12,
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.border,
                    flexDirection: 'row',
                    alignItems: 'center'
                }}
            >
                {item.comprobante ? (
                    <TouchableOpacity onPress={() => setSelectedImage(item.comprobante)}>
                        <Image
                            source={{ uri: item.comprobante }}
                            style={{ width: 60, height: 60, borderRadius: 8, marginRight: 16 }}
                        />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 60, height: 60, borderRadius: 8, marginRight: 16, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="document-text-outline" size={24} color={colors.textMuted} />
                    </View>
                )}

                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }} numberOfLines={2}>
                        {item.descripcion}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>
                        {new Date(item.fecha).toLocaleDateString()}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: colors.primary }}>
                        ${item.monto?.toFixed(2) || '0.00'}
                    </Text>
                </View>

                <TouchableOpacity onPress={() => handleDelete(item._id)} style={{ padding: 8 }}>
                    <Ionicons name="trash-outline" size={22} color={colors.error} />
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <KitchyToolbar title="Facturas y Gastos" onBack={() => navigation.goBack()} />

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={gastos}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingVertical: 16 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 50, paddingHorizontal: 30 }}>
                            <Ionicons name="receipt-outline" size={64} color={colors.textMuted} />
                            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>Sin gastos registrados</Text>
                            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
                                Las facturas importadas aparecerán aquí.
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Modal para ver imagen en grande */}
            <Modal visible={!!selectedImage} transparent={true} animationType="fade" onRequestClose={() => setSelectedImage(null)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity
                        style={{ position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 }}
                        onPress={() => setSelectedImage(null)}
                    >
                        <Ionicons name="close-circle" size={36} color="#fff" />
                    </TouchableOpacity>
                    {selectedImage && (
                        <Image
                            source={{ uri: selectedImage }}
                            style={{ width: '90%', height: '80%', resizeMode: 'contain' }}
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
}
