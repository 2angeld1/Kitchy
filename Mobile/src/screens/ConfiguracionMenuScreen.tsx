import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, RefreshControl, Modal, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { lightTheme, darkTheme } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { getMenuConfig, updateMenuConfig } from '../services/api';
import Toast from 'react-native-toast-message';
import { styles } from '../styles/ConfiguracionMenuScreen.styles';

interface MenuConfigData {
    nombreRestaurante: string;
    subtitulo: string;
    tema: 'paper' | 'modern' | 'minimal';
    colorPrimario: string;
    colorSecundario: string;
    imagenHero: string;
    telefono: string;
}

export default function ConfiguracionMenuScreen() {
    const { isDark } = useTheme();
    const colors = isDark ? darkTheme : lightTheme;
    const navigation = useNavigation<any>();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [config, setConfig] = useState<MenuConfigData>({
        nombreRestaurante: '',
        subtitulo: '',
        tema: 'modern',
        colorPrimario: '#18181b', // zinc-900
        colorSecundario: '#f4f4f5',
        imagenHero: '',
        telefono: '',
    });

    const [modalColor, setModalColor] = useState<{ visible: boolean; targetInfo: 'colorPrimario' | 'colorSecundario' | null }>({ visible: false, targetInfo: null });
    const [tempHex, setTempHex] = useState('');

    useEffect(() => {
        cargarConfig();
    }, []);

    const cargarConfig = async (isRef = false) => {
        if (isRef) setRefreshing(true);
        else setLoading(true);

        try {
            const response = await getMenuConfig();
            if (response.data && response.data.nombreRestaurante) {
                setConfig(response.data);
            }
        } catch (err) {
            console.error('Error cargando config:', err);
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cargar la configuración.' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateMenuConfig(config);
            Toast.show({ type: 'success', text1: 'Menú Digital', text2: 'Configuración guardada exitosamente' });
        } catch (err: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: err.response?.data?.message || 'Error al guardar configuración' });
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: keyof MenuConfigData, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const openColorModal = (target: 'colorPrimario' | 'colorSecundario') => {
        setTempHex(config[target] || '#000000');
        setModalColor({ visible: true, targetInfo: target });
    };

    const saveColorTemp = () => {
        if (modalColor.targetInfo) {
            let hexFormatted = tempHex;
            if (!hexFormatted.startsWith('#') && hexFormatted.length === 6) {
                hexFormatted = `#${hexFormatted}`;
            }
            updateField(modalColor.targetInfo, hexFormatted.toLowerCase());
        }
        setModalColor({ visible: false, targetInfo: null });
    };

    // Header Manual 
    const CustomHeader = () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, paddingTop: Platform.OS === 'ios' ? 60 : 40, backgroundColor: colors.background }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.btnHeaderBack, { backgroundColor: colors.surface }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={{ fontSize: 22, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 }}>Config. <Text style={{ color: colors.primary }}>Menú</Text></Text>
            </View>
            <TouchableOpacity
                style={[styles.btnHeaderSave, { opacity: saving ? 0.7 : 1 }]}
                onPress={handleSave}
                disabled={saving || loading}
            >
                {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <>
                        <Ionicons name="save-outline" size={18} color="#fff" />
                        <Text style={styles.btnHeaderSaveText}>Guardar</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <CustomHeader />

            <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => cargarConfig(true)} tintColor={colors.primary} />}>
                <Animated.View entering={FadeInDown.delay(100)} style={styles.actionButtonsRow}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` }]}
                        onPress={() => navigation.navigate('MenuApp')}
                    >
                        <Ionicons name="eye-outline" size={20} color={colors.primary} />
                        <Text style={[styles.actionBtnText, { color: colors.primary }]}>Vista Previa</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Info Card */}
                <Animated.View entering={FadeInDown.delay(150)} style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.iconBoxWrapper, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
                            <Ionicons name="restaurant-outline" size={22} color="#f97316" />
                        </View>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Identidad Visual</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Nombre de tu Local</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                            value={config.nombreRestaurante}
                            onChangeText={(val) => updateField('nombreRestaurante', val)}
                            placeholder="Ej. Kitchy Burger"
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Subtítulo / Eslogan</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                            value={config.subtitulo}
                            onChangeText={(val) => updateField('subtitulo', val)}
                            placeholder="Ej. Sabor y Tradición..."
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>
                </Animated.View>

                {/* Aspecto Card */}
                <Animated.View entering={FadeInDown.delay(200)} style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.iconBoxWrapper, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                            <Ionicons name="color-palette-outline" size={22} color="#8b5cf6" />
                        </View>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Aspecto y Colores</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Estilo Visual</Text>
                        <View style={styles.themeSelector}>
                            {(['paper', 'minimal'] as const).map(tema => (
                                <TouchableOpacity
                                    key={tema}
                                    style={[
                                        styles.themeOption,
                                        {
                                            backgroundColor: config.tema === tema ? `${colors.primary}10` : colors.surface,
                                            borderColor: config.tema === tema ? colors.primary : colors.border
                                        }
                                    ]}
                                    onPress={() => updateField('tema', tema)}
                                >
                                    <Ionicons
                                        name={tema === 'paper' ? 'document-text-outline' : 'albums-outline'}
                                        size={24}
                                        color={config.tema === tema ? colors.primary : colors.textMuted}
                                    />
                                    <Text style={[styles.themeText, { color: config.tema === tema ? colors.primary : colors.textSecondary }]}>
                                        {tema === 'paper' ? 'Fisico' : 'Minimal'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Color Acento (HEX)</Text>
                        <TouchableOpacity style={[styles.colorPreviewBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => openColorModal('colorPrimario')}>
                            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary, textTransform: 'uppercase' }}>{config.colorPrimario || '#000000'}</Text>
                            <View style={[styles.colorCircle, { backgroundColor: config.colorPrimario || '#000000' }]} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Contacto Card */}
                <Animated.View entering={FadeInDown.delay(250)} style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.iconBoxWrapper, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                            <Ionicons name="call-outline" size={22} color="#22c55e" />
                        </View>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Contacto Directo</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Teléfono (Llamadas / WA)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                            value={config.telefono}
                            onChangeText={(val) => updateField('telefono', val)}
                            placeholder="+507 000-0000"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="phone-pad"
                        />
                    </View>

                </Animated.View>

            </ScrollView>

            {/* Modal de Selector Color Hex */}
            <Modal visible={modalColor.visible} animationType="fade" transparent onRequestClose={() => setModalColor({ visible: false, targetInfo: null })}>
                <View style={[styles.colorModalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ width: '100%', alignItems: 'center' }}>
                        <View style={[styles.colorModalContent, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
                            <View style={[styles.iconBoxWrapper, { backgroundColor: 'rgba(34, 197, 94, 0.15)', marginBottom: 16 }]}>
                                <Ionicons name="color-filter-outline" size={24} color="#22c55e" />
                            </View>
                            <Text style={{ fontSize: 20, fontWeight: '900', color: colors.textPrimary, marginBottom: 8 }}>Código HEX</Text>
                            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 20, textAlign: 'center' }}>Ingresa exactamente el código de color de tu marca (ej. #e11d48).</Text>

                            <TextInput
                                style={[styles.hexInput, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: tempHex.length >= 4 ? tempHex : colors.border }]}
                                value={tempHex}
                                onChangeText={setTempHex}
                                autoCapitalize="none"
                                maxLength={7}
                            />

                            <TouchableOpacity style={[styles.saveColorBtn, { backgroundColor: colors.primary }]} onPress={saveColorTemp}>
                                <Text style={styles.saveColorText}>Aplicar Color</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}
