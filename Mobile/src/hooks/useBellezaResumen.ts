import { useState, useEffect, useCallback, useMemo } from 'react';
import { getVentas, getNegocioActual, enviarReportesMasivos } from '../services/api';
import { getTodayLocalString } from '../utils/date-helpers';
import Toast from 'react-native-toast-message';
import * as Sharing from 'expo-sharing';
import { exportComisionesPdf } from '../utils/export-helpers';
import { Platform } from 'react-native';

export type TabType = 'diario' | 'semanal';

export const useBellezaResumen = () => {
    const [activeTab, setActiveTab] = useState<TabType>('diario');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [ventas, setVentas] = useState<any[]>([]);
    const [negocioInfo, setNegocioInfo] = useState<any>(null);
    const [expandedEspecialista, setExpandedEspecialista] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const now = new Date();
            let fechaInicio, fechaFin;

            if (activeTab === 'diario') {
                const hoy = getTodayLocalString();
                fechaInicio = hoy;
                fechaFin = hoy;
            } else {
                // Semana (últimos 7 días)
                const weekAgo = new Date(now);
                weekAgo.setDate(now.getDate() - 7);
                fechaInicio = weekAgo.toISOString().split('T')[0];
                fechaFin = now.toISOString().split('T')[0];
            }

            const [ventasRes, negocioRes] = await Promise.all([
                getVentas({ fechaInicio, fechaFin, limite: 500 }),
                getNegocioActual()
            ]);

            setVentas(Array.isArray(ventasRes.data) ? ventasRes.data : (ventasRes.data.ventas || []));
            setNegocioInfo(negocioRes.data);
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar los datos del resumen.' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // Procesar datos para agrupar por especialista
    const resumenEspecialistas = useMemo(() => {
        if (!ventas.length || !negocioInfo) return [];

        const especialistasMap: any = {};
        const config = negocioInfo.comisionConfig || {};
        const configReventa = negocioInfo.comisionReventa || { porcentajeGlobal: 10 };

        ventas.forEach((venta: any) => {
            venta.items.forEach((item: any) => {
                let espId = 'CAJA';
                let espNombre = 'Ventas de Caja';
                let espEmail = '';

                // Prioridad: Barbero del ítem específico. Si no hay (ventas antiguas), usar el barbero de la venta global.
                const barberoDelItem = item.especialista || venta.especialista;

                if (barberoDelItem) {
                    espId = typeof barberoDelItem === 'object' ? barberoDelItem._id : barberoDelItem;
                    espNombre = typeof barberoDelItem === 'object' && barberoDelItem.nombre ? barberoDelItem.nombre : 'Desconocido';
                    espEmail = typeof barberoDelItem === 'object' && barberoDelItem.email ? barberoDelItem.email : '';
                }

                if (!especialistasMap[espId]) {
                    especialistasMap[espId] = {
                        id: espId,
                        nombre: espNombre,
                        email: espEmail || '',
                        serviciosItems: [],
                        productosItems: [],
                        totalRecaudado: 0,
                        totalComision: 0,
                        conteoServicios: 0
                    };
                }

                const espData = especialistasMap[espId];

                const subtotal = item.subtotal || (item.precioUnitario * item.cantidad);
                const esProducto = item.producto?.categoria === 'PRODUCTO' || item.producto?.categoria === 'otro'; 
                // Nota: categoria 'servicio' o 'belleza' son servicios
                const esServicio = item.producto?.categoria === 'servicio' || item.producto?.categoria === 'belleza' || item.producto?.categoria === 'comida';

                let porcentaje = 0;
                let comisionCalculada = 0;

                if (espId !== 'CAJA') {
                    if (esServicio) {
                        espData.conteoServicios += item.cantidad;
                        // Lógica de comisión para servicios
                        if (config.tipo === 'fijo') {
                            porcentaje = config.fijo?.porcentajeBarbero || 50;
                        } else if (config.tipo === 'escalonado') {
                            const escalon = config.escalonado?.find((e: any) => 
                                espData.conteoServicios >= e.desde && espData.conteoServicios <= e.hasta
                            ) || config.escalonado?.[config.escalonado.length - 1]; // Último escalón si no encuentra
                            porcentaje = escalon?.porcentajeBarbero || 50;
                        }
                        comisionCalculada = (subtotal * porcentaje) / 100;
                    } else {
                        // Reventa de productos
                        porcentaje = configReventa.porcentajeGlobal || 10;
                        comisionCalculada = (subtotal * porcentaje) / 100;
                    }
                }

                if (esServicio) {
                    espData.serviciosItems.push({
                        nombre: item.nombreProducto,
                        precio: item.precioUnitario,
                        cantidad: item.cantidad,
                        subtotal,
                        porcentaje,
                        comision: comisionCalculada,
                        fecha: venta.createdAt || venta.fecha
                    });
                } else {
                    espData.productosItems.push({
                        nombre: item.nombreProducto,
                        precio: item.precioUnitario,
                        cantidad: item.cantidad,
                        subtotal,
                        porcentaje,
                        comision: comisionCalculada,
                        fecha: venta.createdAt || venta.fecha
                    });
                }

                espData.totalRecaudado += subtotal;
                espData.totalComision += comisionCalculada;
            });
        });

        return Object.values(especialistasMap).sort((a: any, b: any) => b.totalRecaudado - a.totalRecaudado);
    }, [ventas, negocioInfo]);

    const toggleAccordion = (id: string) => {
        setExpandedEspecialista(expandedEspecialista === id ? null : id);
    };

    const handleDescargarGlobal = async () => {
        setIsExporting(true);
        try {
            const fechaTitulo = activeTab === 'diario' ? 'Diario' : 'Semanal';

            // Adaptar datos al formato que espera exportComisionesPdf y exportComisionesCsv
            const especialistasMapeados = resumenEspecialistas.map((esp: any) => ({
                ...esp,
                totalServicios: esp.serviciosItems.length + esp.productosItems.length,
                totalIngreso: esp.totalRecaudado,
                montoEspecialista: esp.totalComision,
                montoDueno: esp.totalRecaudado - esp.totalComision,
                // Usamos el porcentaje del primer servicio como referencia, o 0 si no hay
                porcentajeActual: esp.serviciosItems.length > 0 ? esp.serviciosItems[0].porcentaje : 
                                 (esp.productosItems.length > 0 ? esp.productosItems[0].porcentaje : 0)
            }));

            const exportData = {
                especialistas: especialistasMapeados,
                resumen: {
                    totalGeneral: resumenEspecialistas.reduce((acc: number, esp: any) => acc + esp.totalRecaudado, 0),
                    totalEspecialistas: resumenEspecialistas.reduce((acc: number, esp: any) => acc + esp.totalComision, 0),
                    totalDueno: resumenEspecialistas.reduce((acc: number, esp: any) => acc + (esp.totalRecaudado - esp.totalComision), 0),
                }
            };

            await exportComisionesPdf(exportData, fechaTitulo, negocioInfo?.nombre || 'Kitchy Beauty', ventas);
        } catch (err) {
            console.error('Error en exportación:', err);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Hubo un problema al generar el reporte global.' });
        } finally {
            setIsExporting(false);
        }
    };


    const handleEnviarEspecialistas = async () => {
        // Filtrar especialistas que no sean la "Caja" y que tengan correo
        const especialistasConCorreo = resumenEspecialistas.filter((esp: any) => esp.id !== 'CAJA' && esp.email);
        
        if (especialistasConCorreo.length === 0) {
            Toast.show({ type: 'info', text1: 'Sin correos', text2: 'Ningún especialista en el resumen tiene correo registrado.' });
            return;
        }

        setIsExporting(true);
        try {
            const periodo = activeTab === 'diario' ? 'Diario' : 'Semanal';
            
            await enviarReportesMasivos({
                especialistasResumen: especialistasConCorreo,
                periodo,
                businessName: negocioInfo?.nombre || 'Kitchy POS'
            });

            Toast.show({ type: 'success', text1: '¡Enviando!', text2: 'Los reportes se están enviando en segundo plano.' });
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Hubo un problema al enviar los reportes masivos.' });
        } finally {
            setIsExporting(false);
        }
    };

    return {
        activeTab,
        setActiveTab,
        loading,
        refreshing,
        onRefresh,
        resumenEspecialistas,
        expandedEspecialista,
        toggleAccordion,
        isExporting,
        handleDescargarGlobal,
        handleEnviarEspecialistas
    };
};
