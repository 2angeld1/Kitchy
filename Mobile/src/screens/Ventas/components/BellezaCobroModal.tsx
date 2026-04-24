import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, Switch, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, SlideInUp, FadeIn, FadeOut } from 'react-native-reanimated';
import { formatMoney } from '../../../utils/beauty-helpers';
import { buscarClientes, getClientesRecientes } from '../../../services/api';

interface Props {
    visible: boolean;
    onClose: () => void;
    onConfirm: (clienteInfo: any) => void;
    especialistas: any[];
    especialistaSeleccionadoId?: string | null;
    colors: any;
    total: number;
    // Payment State from hook
    metodoPago: 'efectivo' | 'yappy' | 'tarjeta' | 'combinado';
    setMetodoPago: (m: any) => void;
    pagoCombinado: any[];
    setPagoCombinado: (c: any) => void;
    montoRecibido: string;
    setMontoRecibido: (m: string) => void;
    cambio: number;
    denominaciones: number[];
}

export const BellezaCobroModal: React.FC<Props> = ({
    visible,
    onClose,
    onConfirm,
    especialistas,
    especialistaSeleccionadoId,
    colors,
    total,
    metodoPago,
    setMetodoPago,
    pagoCombinado,
    setPagoCombinado,
    montoRecibido,
    setMontoRecibido,
    cambio,
    denominaciones
}) => {
    const [step, setStep] = useState<1 | 1.5 | 2>(1);
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [esFrecuente, setEsFrecuente] = useState(false);
    const [espFrecuenteSeleccionado, setEspFrecuenteSeleccionado] = useState<string | null>(null);

    // Búsqueda de clientes
    const [searching, setSearching] = useState(false);
    const [resultadosBusqueda, setResultadosBusqueda] = useState<any[]>([]);
    const [clientesRecientes, setClientesRecientes] = useState<any[]>([]);

    // Local state for Combined Payment step
    const [combMetodo1, setCombMetodo1] = useState('yappy');
    const [combMonto1, setCombMonto1] = useState('');
    const [combMetodo2, setCombMetodo2] = useState('tarjeta');

    const montoCalculado1 = parseFloat(combMonto1) || 0;
    const montoRestante2 = Math.max(0, total - montoCalculado1);

    useEffect(() => {
        if (visible) {
            setStep(1);
            cargarRecientes();
        }
    }, [visible]);

    const cargarRecientes = async () => {
        try {
            const { data } = await getClientesRecientes();
            setClientesRecientes(data);
        } catch (err) {}
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (nombre.length >= 3) {
                hacerBusqueda(nombre);
            } else {
                setResultadosBusqueda([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [nombre]);

    const hacerBusqueda = async (q: string) => {
        setSearching(true);
        try {
            const { data } = await buscarClientes(q);
            setResultadosBusqueda(data);
        } catch (err) {} finally {
            setSearching(false);
        }
    };

    const seleccionarCliente = (c: any) => {
        setNombre(c.nombre);
        setTelefono(c.telefono || '');
        setEmail(c.email || '');
        setEsFrecuente(c.esFrecuente || false);
        if (c.especialistaFrecuente) {
            setEspFrecuenteSeleccionado(c.especialistaFrecuente);
        }
        setResultadosBusqueda([]);
    };

    // Pre-seleccionar al especialista actual
    useEffect(() => {
        if (visible && especialistaSeleccionadoId && !espFrecuenteSeleccionado) {
            setEspFrecuenteSeleccionado(especialistaSeleccionadoId);
        }
    }, [visible, especialistaSeleccionadoId]);

    const handleConfirm = () => {
        onConfirm({
            nombre: nombre || 'Anónimo',
            telefono,
            email,
            esFrecuente,
            especialistaFrecuente: esFrecuente ? espFrecuenteSeleccionado : null
        });
        setNombre(''); setTelefono(''); setEmail(''); setEsFrecuente(false); setEspFrecuenteSeleccionado(null);
    };

    const confirmCombined = () => {
        if (montoCalculado1 <= 0 || montoCalculado1 >= total) return;
        setPagoCombinado([
            { metodo: combMetodo1, monto: montoCalculado1 },
            { metodo: combMetodo2, monto: montoRestante2 }
        ]);
        setMetodoPago('combinado');
        setStep(2); // Go to client info
    };

    const renderMethodItem = (m: string) => {
        const isSelected = metodoPago === m;
        return (
            <TouchableOpacity
                key={m}
                onPress={() => {
                    if (m === 'combinado') {
                        setStep(1.5);
                    } else {
                        setMetodoPago(m as any);
                        setPagoCombinado([]);
                    }
                }}
                style={{
                    flexBasis: '48%',
                    paddingVertical: 16,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? `${colors.primary}10` : colors.surface,
                    alignItems: 'center',
                    gap: 4
                }}
            >
                <Ionicons 
                    name={m === 'efectivo' ? 'cash-outline' : m === 'yappy' ? 'phone-portrait-outline' : m === 'tarjeta' ? 'card-outline' : 'git-branch-outline'} 
                    size={24} 
                    color={isSelected ? colors.primary : colors.textMuted} 
                />
                <Text style={{ color: isSelected ? colors.primary : colors.textMuted, fontWeight: 'bold', textTransform: 'capitalize' }}>{m}</Text>
            </TouchableOpacity>
        );
    };

    const renderStep1 = () => (
        <Animated.View entering={FadeIn} exiting={FadeOut}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '800', marginBottom: 12, textTransform: 'uppercase' }}>¿Cómo paga el cliente?</Text>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {['efectivo', 'yappy', 'tarjeta', 'combinado'].map(renderMethodItem)}
            </View>

            {metodoPago === 'efectivo' && (
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 12 }}>Atajo de Billetes:</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {denominaciones.map(b => (
                            <TouchableOpacity
                                key={b}
                                onPress={() => setMontoRecibido(b.toString())}
                                style={{
                                    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                                    backgroundColor: montoRecibido === b.toString() ? colors.primary : colors.surface,
                                    borderWidth: 1, borderColor: colors.border
                                }}
                            >
                                <Text style={{ color: montoRecibido === b.toString() ? '#fff' : colors.textPrimary, fontWeight: 'bold' }}>${b}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: colors.textMuted, fontWeight: '700' }}>TOTAL A COBRAR</Text>
                    <Text style={{ fontSize: 24, fontWeight: '900', color: colors.textPrimary }}>{formatMoney(total)}</Text>
                </View>
                {metodoPago === 'efectivo' && cambio > 0 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }}>
                        <Text style={{ color: colors.primary, fontWeight: '700' }}>SU CAMBIO</Text>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: colors.primary }}>{formatMoney(cambio)}</Text>
                    </View>
                )}
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: colors.surface, paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}
                    onPress={() => {
                        onConfirm({ nombre: 'Anónimo', telefono: '', email: '', esFrecuente: false });
                        setNombre(''); setTelefono(''); setEmail(''); setEsFrecuente(false);
                    }}
                >
                    <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '800' }}>COBRAR YA</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 10 }}>SIN DATOS</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ flex: 2, backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                    onPress={() => setStep(2)}
                >
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>DATOS CLIENTE</Text>
                    <Ionicons name="arrow-forward" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    const renderStepCombined = () => (
        <Animated.View entering={FadeIn} exiting={FadeOut}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '800', marginBottom: 12, textTransform: 'uppercase' }}>Configurar Pago Combinado</Text>
            
            <View style={{ gap: 16, marginBottom: 24 }}>
                <View>
                    <Text style={{ color: colors.textSecondary, fontWeight: '700', marginBottom: 8 }}>Método 1 y Monto:</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                        {['efectivo', 'yappy', 'tarjeta'].map(m => (
                            <TouchableOpacity 
                                key={m} onPress={() => setCombMetodo1(m)}
                                style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: combMetodo1 === m ? colors.primary : colors.border, backgroundColor: combMetodo1 === m ? `${colors.primary}10` : colors.surface }}
                            >
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: combMetodo1 === m ? colors.primary : colors.textMuted, textTransform: 'capitalize' }}>{m}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TextInput 
                        style={{ backgroundColor: colors.surface, borderRadius: 16, height: 50, paddingHorizontal: 16, color: colors.textPrimary, fontWeight: '900', fontSize: 18, borderWidth: 1, borderColor: colors.border, textAlign: 'center' }}
                        placeholder="0.00" keyboardType="numeric" value={combMonto1} onChangeText={setCombMonto1}
                    />
                </View>

                <View>
                    <Text style={{ color: colors.textSecondary, fontWeight: '700', marginBottom: 8 }}>Método 2 (Restante: {formatMoney(montoRestante2)}):</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        {['efectivo', 'yappy', 'tarjeta'].map(m => {
                            const isSelected = combMetodo2 === m;
                            const isDisabled = combMetodo1 === m;
                            return (
                                <TouchableOpacity 
                                    key={m} disabled={isDisabled} onPress={() => setCombMetodo2(m)}
                                    style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: isSelected ? colors.primary : colors.border, backgroundColor: isSelected ? `${colors.primary}10` : colors.surface, opacity: isDisabled ? 0.3 : 1 }}
                                >
                                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: isSelected ? colors.primary : colors.textMuted, textTransform: 'capitalize' }}>{m}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: colors.surface, paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}
                    onPress={() => setStep(1)}
                >
                    <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '800' }}>VOLVER</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ flex: 2, backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', opacity: montoCalculado1 > 0 && montoCalculado1 < total ? 1 : 0.5 }}
                    onPress={confirmCombined}
                    disabled={montoCalculado1 <= 0 || montoCalculado1 >= total}
                >
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>CONFIRMAR PAGO</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    const renderStep2 = () => (
        <Animated.View entering={FadeIn} exiting={FadeOut}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '800', marginBottom: 12, textTransform: 'uppercase' }}>Identificar Cliente</Text>

            <View style={{ gap: 12, marginBottom: 12 }}>
                <View style={{ backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="person-outline" size={20} color={colors.textMuted} />
                    <TextInput
                        style={{ flex: 1, height: 50, color: colors.textPrimary, paddingHorizontal: 12 }}
                        placeholder="Empezar a escribir nombre / teléfono..." placeholderTextColor={colors.textMuted} value={nombre} onChangeText={setNombre}
                    />
                    {searching && <ActivityIndicator size="small" color={colors.primary} />}
                </View>

                {/* RESULTADOS DE BÚSQUEDA */}
                {resultadosBusqueda.length > 0 && (
                    <Animated.View entering={FadeInDown} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 8, borderWidth: 1, borderColor: colors.primary + '40', maxHeight: 150 }}>
                        <ScrollView nestedScrollEnabled>
                            {resultadosBusqueda.map(c => (
                                <TouchableOpacity 
                                    key={c._id} onPress={() => seleccionarCliente(c)}
                                    style={{ padding: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border, flexDirection: 'row', justifyContent: 'space-between' }}
                                >
                                    <View>
                                        <Text style={{ color: colors.textPrimary, fontWeight: 'bold' }}>{c.nombre}</Text>
                                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>{c.telefono || c.email || 'Sin contacto'}</Text>
                                    </View>
                                    {c.esFrecuente && <Ionicons name="star" size={16} color={colors.primary} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </Animated.View>
                )}

                {/* SUGERENCIAS RÁPIDAS (Recientes) */}
                {nombre.length === 0 && clientesRecientes.length > 0 && (
                    <View>
                        <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: 'bold', marginBottom: 8, marginLeft: 4 }}>CLIENTES RECIENTES:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                            {clientesRecientes.map(c => (
                                <TouchableOpacity 
                                    key={c._id} onPress={() => seleccionarCliente(c)}
                                    style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                                >
                                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />
                                    <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>{c.nombre.split(' ')[0]}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
                
                <View style={{ backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="call-outline" size={20} color={colors.textMuted} />
                    <TextInput
                        style={{ flex: 1, height: 50, color: colors.textPrimary, paddingHorizontal: 12 }}
                        placeholder="Teléfono" keyboardType="phone-pad" placeholderTextColor={colors.textMuted} value={telefono} onChangeText={setTelefono}
                    />
                </View>

                <View style={{ backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
                    <TextInput
                        style={{ flex: 1, height: 50, color: colors.textPrimary, paddingHorizontal: 12 }}
                        placeholder="Email (Encuestas)" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail}
                    />
                </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Ionicons name="star" size={20} color={colors.primary} />
                    <View>
                        <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '700' }}>Cliente Frecuente</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 10 }}>Puntos/Rankings</Text>
                    </View>
                </View>
                <Switch value={esFrecuente} onValueChange={setEsFrecuente} trackColor={{ false: colors.border, true: colors.primary }} />
            </View>

            {esFrecuente && (
                <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 8 }}>¿De quién es frecuente?</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                        {especialistas.map(esp => (
                            <TouchableOpacity 
                                key={esp._id} onPress={() => setEspFrecuenteSeleccionado(esp._id)}
                                style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: espFrecuenteSeleccionado === esp._id ? colors.primary : colors.surface, borderWidth: 1, borderColor: colors.border }}
                            >
                                <Text style={{ color: espFrecuenteSeleccionado === esp._id ? '#fff' : colors.textSecondary, fontWeight: '600', fontSize: 12 }}>{esp.nombre.split(' ')[0]}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: colors.surface, paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}
                    onPress={() => setStep(metodoPago === 'combinado' ? 1.5 : 1)}
                >
                    <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '800' }}>VOLVER</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ flex: 2, backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                    onPress={handleConfirm}
                >
                    <Ionicons name="shield-checkmark" size={24} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>FINALIZAR</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <Animated.View entering={SlideInUp.duration(300)} style={{ backgroundColor: colors.card, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <View>
                                <Text style={{ fontSize: 22, fontWeight: '900', color: colors.textPrimary }}>Finalizar Venta</Text>
                                <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '800', textTransform: 'uppercase' }}>
                                    {step === 1 ? 'MÉTODO DE PAGO' : step === 1.5 ? 'CONFIGURAR COMBINADO' : 'IDENTIFICAR CLIENTE'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={{ padding: 4, backgroundColor: colors.surface, borderRadius: 20 }}>
                                <Ionicons name="close" size={24} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        {step === 1 ? renderStep1() : step === 1.5 ? renderStepCombined() : renderStep2()}
                        
                    </Animated.View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};
