import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme';
import { useReservas } from '../hooks/useReservas';
import { useAuth } from '../context/AuthContext';
import { getCategoriaNegocio } from '../utils/beauty-helpers';
import { KitchyToolbar } from '../components/KitchyToolbar';

const ReservasScreen = () => {
    const navigation = useNavigation();
    const { isDark } = useTheme();
    const { user } = useAuth();
    const colors = isDark ? darkTheme : lightTheme;
    
    const categoriaNegocio = React.useMemo(() => getCategoriaNegocio(user as any), [user]);
    const isBelleza = categoriaNegocio === 'BELLEZA';

    const {
        reservas, loading, refreshing, refreshReservas,
        fechaFiltro, setFechaFiltro,
        showModal, setShowModal,
        nombre, setNombre,
        email, setEmail,
        telefono, setTelefono,
        hora, setHora,
        personas, setPersonas,
        nombreRecurso, setNombreRecurso,
        notas, setNotas,
        sugerencias, buscandoCliente, seleccionarCliente,
        sugerenciasEspecialistas, seleccionarEspecialista,
        handleCrearReserva, handleCancelarReserva, resetForm
    } = useReservas();

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <KitchyToolbar 
                title="Gestión de Reservas" 
                onBack={() => navigation.goBack()} 
            />

            {/* LISTA DE RESERVAS */}
            <ScrollView 
                contentContainerStyle={{ padding: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshReservas} tintColor={colors.primary} />}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>Reservas de Hoy</Text>
                    <TouchableOpacity style={{ backgroundColor: colors.primary + '20', padding: 8, borderRadius: 10 }}>
                        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
                ) : reservas.length === 0 ? (
                    <View style={{ alignItems: 'center', marginTop: 100, opacity: 0.5 }}>
                        <Ionicons name="journal-outline" size={64} color={colors.textMuted} />
                        <Text style={{ color: colors.textMuted, marginTop: 10 }}>No hay reservas para esta fecha.</Text>
                    </View>
                ) : (
                    reservas.map((item) => (
                        <View key={item._id} style={{ 
                            backgroundColor: colors.card, 
                            padding: 16, 
                            borderRadius: 20, 
                            marginBottom: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: colors.border
                        }}>
                            <View style={{ backgroundColor: colors.primary + '20', width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
                                <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 16 }}>{item.horaInicio}</Text>
                            </View>
                            
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>{item.nombreCliente}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                    <Ionicons name={item.tipo === 'GASTRONOMIA' ? 'restaurant-outline' : 'cut-outline'} size={12} color={colors.textMuted} />
                                    <Text style={{ fontSize: 12, color: colors.textMuted, marginLeft: 4 }}>
                                        {item.nombreRecurso || (item.tipo === 'GASTRONOMIA' ? 'Mesa' : 'Especialista')}
                                    </Text>
                                    {item.numPersonas && item.tipo === 'GASTRONOMIA' && (
                                        <Text style={{ fontSize: 12, color: colors.textMuted }}> • {item.numPersonas} pers.</Text>
                                    )}
                                </View>
                            </View>

                            <TouchableOpacity onPress={() => handleCancelarReserva(item._id)}>
                                <Ionicons name="close-circle-outline" size={24} color="#f87171" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* BOTÓN FLOTANTE */}
            <TouchableOpacity 
                style={{ 
                    position: 'absolute', bottom: 30, right: 30, 
                    backgroundColor: colors.primary, width: 60, height: 60, borderRadius: 30, 
                    justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10 
                }}
                onPress={() => { resetForm(); setShowModal(true); }}
            >
                <Ionicons name="add" size={30} color="#FFF" />
            </TouchableOpacity>

            {/* MODAL DE NUEVA RESERVA (SMART FORM) */}
            <Modal visible={showModal} animationType="slide" transparent={true}>
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '80%' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 22, fontWeight: '900', color: colors.textPrimary }}>Nueva Reserva</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={28} color={colors.textPrimary} /></TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* SMART PRE-FILL FIELD */}
                            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 8, textTransform: 'uppercase' }}>Cliente (Smart Search)</Text>
                            <View>
                                <TextInput 
                                    style={{ backgroundColor: isDark ? colors.border : '#F5F5F5', padding: 15, borderRadius: 15, color: colors.textPrimary, fontSize: 16 }}
                                    placeholder="Escribe nombre..."
                                    placeholderTextColor={colors.textMuted}
                                    value={nombre}
                                    onChangeText={setNombre}
                                />
                                {buscandoCliente && <ActivityIndicator size="small" color={colors.primary} style={{ position: 'absolute', right: 15, top: 15 }} />}
                                
                                {sugerencias.length > 0 && (
                                    <View style={{ backgroundColor: colors.card, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, borderWidth: 1, borderColor: colors.border, marginTop: -5 }}>
                                        {sugerencias.map((s, i) => (
                                            <TouchableOpacity key={i} style={{ padding: 15, borderBottomWidth: i === sugerencias.length - 1 ? 0 : 0.5, borderBottomColor: colors.border }} onPress={() => seleccionarCliente(s)}>
                                                <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{s.nombre}</Text>
                                                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{s.telefono || s.email || 'Cliente frecuente'}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            <View style={{ flexDirection: 'row', gap: 15, marginTop: 20 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 8 }}>EMAIL</Text>
                                    <TextInput style={{ backgroundColor: isDark ? colors.border : '#F5F5F5', padding: 15, borderRadius: 15, color: colors.textPrimary }} value={email} onChangeText={setEmail} keyboardType="email-address" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 8 }}>TELÉFONO</Text>
                                    <TextInput style={{ backgroundColor: isDark ? colors.border : '#F5F5F5', padding: 15, borderRadius: 15, color: colors.textPrimary }} value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 15, marginTop: 20 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 8 }}>{isBelleza ? 'HORA CITA' : 'HORA'}</Text>
                                    <TextInput style={{ backgroundColor: isDark ? colors.border : '#F5F5F5', padding: 15, borderRadius: 15, color: colors.textPrimary }} value={hora} onChangeText={setHora} placeholder="12:00" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 8 }}>{isBelleza ? 'SERVICIOS' : 'PERSONAS'}</Text>
                                    <TextInput style={{ backgroundColor: isDark ? colors.border : '#F5F5F5', padding: 15, borderRadius: 15, color: colors.textPrimary }} value={personas} onChangeText={setPersonas} keyboardType={isBelleza ? 'default' : 'numeric'} placeholder={isBelleza ? 'Corte, Barba...' : '1'} />
                                </View>
                            </View>

                            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 8, marginTop: 20 }}>{isBelleza ? 'ESPECIALISTA' : 'MESA'}</Text>
                            <TextInput 
                                style={{ backgroundColor: isDark ? colors.border : '#F5F5F5', padding: 15, borderRadius: 15, color: colors.textPrimary }} 
                                value={nombreRecurso} 
                                onChangeText={setNombreRecurso} 
                                placeholder={isBelleza ? 'Ej: Juan Pérez' : 'Ej: Mesa 5'} 
                            />

                            {/* Sugerencias de Especialistas */}
                            {isBelleza && sugerenciasEspecialistas.length > 0 && (
                                <View style={{ backgroundColor: colors.surface, borderRadius: 15, marginTop: 5, padding: 5, borderWidth: 1, borderColor: colors.border }}>
                                    {sugerenciasEspecialistas.map((esp) => (
                                        <TouchableOpacity 
                                            key={esp._id} 
                                            onPress={() => seleccionarEspecialista(esp)}
                                            style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center' }}
                                        >
                                            <Ionicons name="person-circle-outline" size={20} color={colors.primary} style={{ marginRight: 10 }} />
                                            <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{esp.nombre}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 8, marginTop: 20 }}>NOTAS</Text>
                            <TextInput style={{ backgroundColor: isDark ? colors.border : '#F5F5F5', padding: 15, borderRadius: 15, color: colors.textPrimary, height: 80 }} multiline value={notas} onChangeText={setNotas} />

                            <TouchableOpacity 
                                style={{ backgroundColor: colors.primary, padding: 18, borderRadius: 20, alignItems: 'center', marginTop: 30, marginBottom: 50 }}
                                onPress={handleCrearReserva}
                            >
                                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 16 }}>Confirmar y Enviar Email</Text>}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ReservasScreen;
