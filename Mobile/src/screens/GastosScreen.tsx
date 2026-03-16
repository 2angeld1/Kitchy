import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image, Modal, ActivityIndicator, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../theme';
import Toast from 'react-native-toast-message';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';
import { useGastos } from '../hooks/useGastos';

export default function GastosScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;

    const {
        gastos,
        loading,
        success,
        error,
        cargarGastos,
        eliminarGastoItem,
        exportarReporte,
        clearStatus
    } = useGastos();

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        cargarGastos();
    }, [cargarGastos]);

    const onRefresh = () => {
        cargarGastos();
    };

    const handleDelete = async (id: string) => {
        await eliminarGastoItem(id);
    };

    useEffect(() => {
        if (success) {
            Toast.show({ type: 'success', text1: 'Éxito', text2: success });
            clearStatus();
        }
        if (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: error });
            clearStatus();
        }
    }, [success, error]);

    const handleExport = async () => {
        await exportarReporte();
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
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary, flex: 1 }} numberOfLines={1}>
                            {item.proveedor || item.descripcion}
                        </Text>
                        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.primary, marginLeft: 8 }}>
                            ${item.monto?.toFixed(2) || '0.00'}
                        </Text>
                    </View>

                    {item.nroFactura && (
                        <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                            Factura: <Text style={{ fontWeight: '600' }}>#{item.nroFactura}</Text>
                        </Text>
                    )}

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                        {item.ruc && (
                            <View style={{ backgroundColor: colors.surface, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: colors.border }}>
                                <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700' }}>RUC: {item.ruc}-{item.dv || '0'}</Text>
                            </View>
                        )}
                        <Text style={{ fontSize: 11, color: colors.textMuted }}>
                            {new Date(item.fecha).toLocaleDateString()}
                        </Text>
                    </View>

                    {item.itbms > 0 && (
                        <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>
                            Incluye $ {item.itbms.toFixed(2)} de ITBMS (7%)
                        </Text>
                    )}
                </View>

                <TouchableOpacity onPress={() => handleDelete(item._id)} style={{ padding: 8, marginLeft: 8 }}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
            </Animated.View>
        );
    };



    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <KitchyToolbar 
                title="Facturas y Gastos" 
                onBack={() => navigation.goBack()} 
                extraButtons={
                    <TouchableOpacity onPress={handleExport} style={{ padding: 8 }}>
                        <Ionicons name="download-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                }
            />

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
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.primary} />}
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
