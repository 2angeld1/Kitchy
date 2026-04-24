import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getReservas, crearReserva, cancelarReserva, buscarClientes } from '../services/api';
import Toast from 'react-native-toast-message';

export interface ReservaItem {
    _id: string;
    nombreCliente: string;
    emailCliente?: string;
    telefonoCliente?: string;
    tipo: 'GASTRONOMIA' | 'BELLEZA';
    recursoId?: string;
    nombreRecurso?: string;
    fecha: string;
    horaInicio: string;
    numPersonas?: number;
    estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada' | 'no_asistio';
    notas?: string;
}

export const useReservas = () => {
    const { user } = useAuth();
    const [reservas, setReservas] = useState<ReservaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0]);

    // Formulario
    const [showModal, setShowModal] = useState(false);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [hora, setHora] = useState('12:00');
    const [personas, setPersonas] = useState('1');
    const [recursoId, setRecursoId] = useState('');
    const [nombreRecurso, setNombreRecurso] = useState('');
    const [notas, setNotas] = useState('');
    const [clienteId, setClienteId] = useState<string | null>(null);

    // Búsqueda de Clientes (Smart Pre-fill)
    const [sugerencias, setSugerencias] = useState<any[]>([]);
    const [buscandoCliente, setBuscandoCliente] = useState(false);

    const refreshReservas = useCallback(async () => {
        setRefreshing(true);
        try {
            const response = await getReservas(fechaFiltro);
            setReservas(response.data);
        } catch (err) {
            console.error('Error al cargar reservas:', err);
        } finally {
            setRefreshing(false);
        }
    }, [fechaFiltro]);

    useEffect(() => {
        const fetchReservas = async () => {
            setLoading(true);
            try {
                const response = await getReservas(fechaFiltro);
                setReservas(response.data);
            } catch (err) {
                console.error('Error al cargar reservas:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReservas();
    }, [fechaFiltro]);

    // Lógica de búsqueda de clientes
    useEffect(() => {
        if (nombre.length > 2 && !clienteId) {
            const delayDebounceFn = setTimeout(async () => {
                setBuscandoCliente(true);
                try {
                    const response = await buscarClientes(nombre);
                    setSugerencias(response.data);
                } catch (err) {
                    console.error('Error buscando clientes:', err);
                } finally {
                    setBuscandoCliente(false);
                }
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setSugerencias([]);
        }
    }, [nombre, clienteId]);

    const seleccionarCliente = (cliente: any) => {
        setClienteId(cliente._id);
        setNombre(cliente.nombre);
        setEmail(cliente.email || '');
        setTelefono(cliente.telefono || '');
        setSugerencias([]);
    };

    const handleCrearReserva = async () => {
        if (!nombre || !hora) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Nombre y hora son obligatorios' });
            return;
        }

        setLoading(true);
        try {
            const tipoNegocio = (user?.negocioActivo as any)?.categoria === 'BELLEZA' ? 'BELLEZA' : 'GASTRONOMIA';
            await crearReserva({
                nombreCliente: nombre,
                emailCliente: email,
                telefonoCliente: telefono,
                fecha: fechaFiltro,
                horaInicio: hora,
                recursoId,
                nombreRecurso,
                tipo: tipoNegocio,
                numPersonas: parseInt(personas),
                notas,
                clienteId
            });

            Toast.show({ type: 'success', text1: '¡Éxito!', text2: 'Reserva creada y email enviado.' });
            setShowModal(false);
            resetForm();
            refreshReservas();
        } catch (err: any) {
            Toast.show({ type: 'error', text1: 'Fallo al reservar', text2: err.response?.data?.message || 'Error desconocido' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelarReserva = async (id: string) => {
        try {
            await cancelarReserva(id);
            Toast.show({ type: 'info', text1: 'Reserva cancelada' });
            refreshReservas();
        } catch (err) {
            Toast.show({ type: 'error', text1: 'Error al cancelar' });
        }
    };

    const resetForm = () => {
        setNombre('');
        setEmail('');
        setTelefono('');
        setHora('12:00');
        setPersonas('1');
        setRecursoId('');
        setNombreRecurso('');
        setNotas('');
        setClienteId(null);
        setSugerencias([]);
    };

    return {
        reservas,
        loading,
        refreshing,
        fechaFiltro,
        setFechaFiltro,
        refreshReservas,
        // Form
        showModal,
        setShowModal,
        nombre, setNombre,
        email, setEmail,
        telefono, setTelefono,
        hora, setHora,
        personas, setPersonas,
        recursoId, setRecursoId,
        nombreRecurso, setNombreRecurso,
        notas, setNotas,
        clienteId,
        // Smart search
        sugerencias,
        buscandoCliente,
        seleccionarCliente,
        // Actions
        handleCrearReserva,
        handleCancelarReserva,
        resetForm
    };
};
