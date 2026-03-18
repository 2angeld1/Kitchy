import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { KitchyToolbar } from '../components/KitchyToolbar';
import { KitchyButton } from '../components/KitchyButton';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { useEspecialistas } from '../hooks/useEspecialistas';
import { createStyles } from '../styles/EspecialistasScreen.styles';

export default function EspecialistasScreen() {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const navigation = useNavigation();
    const styles = useMemo(() => createStyles(colors), [colors]);
    
    const {
        especialistas,
        loading,
        showCreateModal,
        setShowCreateModal,
        nuevoNombre,
        setNuevoNombre,
        cargar,
        handleCrear,
        handleEliminar
    } = useEspecialistas();

    return (
        <View style={styles.container}>
            <KitchyToolbar title="Tu Equipo" onBack={() => navigation.goBack()} />

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={cargar} tintColor={colors.primary} />}
            >
                <Text style={styles.title}>Especialistas</Text>
                <Text style={styles.subtitle}>Crea la lista de barberos/estilistas para el reparto de comisiones.</Text>

                {especialistas.map((b, idx) => (
                    <Animated.View 
                        key={b._id} 
                        entering={FadeInDown.delay(idx * 100)}
                        style={styles.card}
                    >
                        <View style={styles.avatarPlaceholder}>
                             <Ionicons name="cut" size={28} color={colors.primary} />
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.name}>{b.nombre}</Text>
                            <View style={styles.badgeRow}>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>COMISION {b.comision}%</Text>
                                </View>
                                <Text style={styles.cardSubtitle}>Sin acceso a la App</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => handleEliminar(b._id)}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </Animated.View>
                ))}

                <TouchableOpacity 
                    style={styles.addBtn}
                    onPress={() => setShowCreateModal(true)}
                >
                    <Ionicons name="add-circle-outline" size={24} color={colors.primary} style={{ marginRight: 8 }} />
                    <Text style={styles.addBtnText}>Nuevo Especialista</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={showCreateModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Añadir Especialista</Text>
                            <TextInput 
                                placeholder="Nombre completo"
                                placeholderTextColor={colors.textMuted}
                                value={nuevoNombre}
                                onChangeText={setNuevoNombre}
                                style={styles.modalInput}
                            />
                            <KitchyButton title="Guardar Especialista" onPress={handleCrear} loading={loading} />
                            <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.cancelBtn}>
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}
