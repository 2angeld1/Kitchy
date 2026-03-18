import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../theme';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { getProductos, createProducto, deleteProducto, updateProducto } from '../services/api';
import { KitchyButton } from '../components/KitchyButton';
import Toast from 'react-native-toast-message';

export default function ServiciosScreen() {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const navigation = useNavigation();

    const [servicios, setServicios] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    // Form simple
    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        cargar();
    }, []);

    const cargar = async () => {
        setLoading(true);
        try {
            const res = await getProductos();
            // Filtramos solo los que tratamos como servicios
            setServicios(res.data.filter((p: any) => p.categoria === 'servicio' || p.categoria === 'belleza' || p.categoria === 'otro'));
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar los servicios' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!nombre.trim() || !precio.trim()) return;
        setLoading(true);
        try {
            const data = {
                nombre,
                precio: Number(precio),
                categoria: 'servicio',
                disponible: true
            };

            if (editingId) {
                await updateProducto(editingId, data);
                Toast.show({ type: 'success', text1: 'Actualizado' });
            } else {
                await createProducto(data);
                Toast.show({ type: 'success', text1: 'Creado' });
            }
            
            setShowModal(false);
            setNombre('');
            setPrecio('');
            setEditingId(null);
            cargar();
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar' });
        } finally {
            setLoading(false);
        }
    };

    const edit = (s: any) => {
        setNombre(s.nombre);
        setPrecio(s.precio.toString());
        setEditingId(s._id);
        setShowModal(true);
    };

    const remove = async (id: string) => {
        try {
            await deleteProducto(id);
            Toast.show({ type: 'success', text1: 'Eliminado' });
            cargar();
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error' });
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <KitchyToolbar title="Servicios" onBack={() => navigation.goBack()} />

            <ScrollView 
                contentContainerStyle={{ padding: 20 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={cargar} tintColor={colors.primary} />}
            >
                <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 }}>Catálogo de Servicios</Text>
                <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 24 }}>Define lo que ofreces y su precio al público.</Text>

                {servicios.map((s, idx) => (
                    <Animated.View 
                        key={s._id} 
                        entering={FadeInDown.delay(idx * 80)}
                        style={{
                            backgroundColor: colors.card,
                            borderRadius: 20,
                            padding: 16,
                            marginBottom: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: colors.border
                        }}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>{s.nombre}</Text>
                            <Text style={{ fontSize: 18, color: colors.primary, fontWeight: '800', marginTop: 4 }}>${Number(s.precio).toFixed(2)}</Text>
                        </View>
                        
                        <TouchableOpacity onPress={() => edit(s)} style={{ marginRight: 15 }}>
                            <Ionicons name="pencil" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={() => remove(s._id)}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </Animated.View>
                ))}

                <TouchableOpacity 
                    style={{
                        marginTop: 20,
                        backgroundColor: colors.surface,
                        paddingVertical: 18,
                        borderRadius: 20,
                        borderWidth: 2,
                        borderColor: colors.border,
                        borderStyle: 'dashed',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 40
                    }}
                    onPress={() => {
                        setEditingId(null);
                        setNombre('');
                        setPrecio('');
                        setShowModal(true);
                    }}
                >
                    <Ionicons name="add-circle-outline" size={24} color={colors.primary} style={{ marginRight: 8 }} />
                    <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Nuevo Servicio</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={showModal} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24 }}>
                        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 16 }}>
                            {editingId ? 'Editar Servicio' : 'Nuevo Servicio'}
                        </Text>
                        
                        <Text style={{ color: colors.textMuted, marginBottom: 8 }}>Nombre del Servicio</Text>
                        <TextInput 
                            placeholder="Ej. Corte y Barba"
                            placeholderTextColor={colors.textMuted}
                            value={nombre}
                            onChangeText={setNombre}
                            style={{
                                backgroundColor: colors.background,
                                padding: 16,
                                borderRadius: 16,
                                color: colors.textPrimary,
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: colors.border
                            }}
                        />

                        <Text style={{ color: colors.textMuted, marginBottom: 8 }}>Precio ($)</Text>
                        <TextInput 
                            placeholder="15.00"
                            placeholderTextColor={colors.textMuted}
                            value={precio}
                            onChangeText={setPrecio}
                            keyboardType="numeric"
                            style={{
                                backgroundColor: colors.background,
                                padding: 16,
                                borderRadius: 16,
                                color: colors.textPrimary,
                                marginBottom: 24,
                                borderWidth: 1,
                                borderColor: colors.border
                            }}
                        />

                        <KitchyButton title={editingId ? 'Actualizar' : 'Crear'} onPress={handleSave} loading={loading} />
                        
                        <TouchableOpacity onPress={( ) => setShowModal(false)} style={{ marginTop: 16, alignItems: 'center' }}>
                            <Text style={{ color: colors.textMuted }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
