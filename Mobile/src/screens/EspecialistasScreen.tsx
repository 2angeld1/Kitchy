import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../theme';
import { styles } from '../styles/UsuariosScreen.styles';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { getEspecialistas, createEspecialista, deleteEspecialista } from '../services/api';
import Toast from 'react-native-toast-message';
import { KitchyButton } from '../components/KitchyButton';

export default function EspecialistasScreen() {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const navigation = useNavigation();
    
    const [especialistas, setEspecialistas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState('');

    useEffect(() => {
        cargar();
    }, []);

    const cargar = async () => {
        setLoading(true);
        try {
            const res = await getEspecialistas();
            setEspecialistas(res.data);
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar' });
        } finally {
            setLoading(false);
        }
    };

    const handleCrear = async () => {
        if (!nuevoNombre.trim()) return;
        setLoading(true);
        try {
            await createEspecialista({ nombre: nuevoNombre });
            Toast.show({ type: 'success', text1: 'Éxito', text2: 'Especialista añadido' });
            setShowCreateModal(false);
            setNuevoNombre('');
            cargar();
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo crear' });
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (id: string) => {
        try {
            await deleteEspecialista(id);
            Toast.show({ type: 'success', text1: 'Eliminado', text2: 'Especialista dado de baja' });
            cargar();
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo eliminar' });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <KitchyToolbar title="Tu Equipo" onBack={() => navigation.goBack()} />

            <ScrollView 
                contentContainerStyle={{ padding: 20 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={cargar} tintColor={colors.primary} />}
            >
                <Text style={{ fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginBottom: 8 }}>Especialistas</Text>
                <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 24 }}>Crea la lista de barberos/estilistas para el reparto de comisiones.</Text>

                {especialistas.map((b, idx) => (
                    <Animated.View 
                        key={b._id} 
                        entering={FadeInDown.delay(idx * 100)}
                        style={{
                            backgroundColor: colors.card,
                            borderRadius: 24,
                            padding: 16,
                            marginBottom: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: colors.border
                        }}
                    >
                        <View style={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            backgroundColor: colors.surface,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 16
                        }}>
                             <Ionicons name="cut" size={28} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>{b.nombre}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                <View style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                                    <Text style={{ fontSize: 10, color: '#8b5cf6', fontWeight: '800' }}>COMISION {b.comision}%</Text>
                                </View>
                                <Text style={{ fontSize: 11, color: colors.textMuted, marginLeft: 8 }}>Sin acceso a la App</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => handleEliminar(b._id)}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </Animated.View>
                ))}

                <TouchableOpacity 
                    style={{
                        marginTop: 20,
                        backgroundColor: colors.surface,
                        paddingVertical: 16,
                        borderRadius: 20,
                        borderWidth: 2,
                        borderColor: colors.border,
                        borderStyle: 'dashed',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    onPress={() => setShowCreateModal(true)}
                >
                    <Ionicons name="add-circle-outline" size={24} color={colors.primary} style={{ marginRight: 8 }} />
                    <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Nuevo Especialista</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={showCreateModal} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24 }}>
                        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 16 }}>Añadir Barbero/Estilista</Text>
                        <TextInput 
                            placeholder="Nombre del especialista"
                            placeholderTextColor={colors.textMuted}
                            value={nuevoNombre}
                            onChangeText={setNuevoNombre}
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
                        <KitchyButton title="Guardar Especialista" onPress={handleCrear} loading={loading} />
                        <TouchableOpacity onPress={() => setShowCreateModal(false)} style={{ marginTop: 16, alignItems: 'center' }}>
                            <Text style={{ color: colors.textMuted }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

