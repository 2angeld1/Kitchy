import { useState, useEffect, useMemo } from 'react';
import { getEspecialistas, updateEspecialista, getNegocioActual } from '../services/api';
import Toast from 'react-native-toast-message';

export const DIAS = [
    { key: 'lunes', label: 'Lunes', short: 'L' },
    { key: 'martes', label: 'Martes', short: 'M' },
    { key: 'miercoles', label: 'Miércoles', short: 'X' },
    { key: 'jueves', label: 'Jueves', short: 'J' },
    { key: 'viernes', label: 'Viernes', short: 'V' },
    { key: 'sabado', label: 'Sábado', short: 'S' },
    { key: 'domingo', label: 'Domingo', short: 'D' },
];

export const useCalendarioEspecialistas = () => {
    const [loading, setLoading] = useState(true);
    const [especialistas, setEspecialistas] = useState<any[]>([]);
    const [negocioInfo, setNegocioInfo] = useState<any>(null);
    const [selectedDia, setSelectedDia] = useState('lunes');
    const [isSaving, setIsSaving] = useState(false);
    const [selectedEspForTemplate, setSelectedEspForTemplate] = useState<any | null>(null);
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [espRes, negRes] = await Promise.all([
                getEspecialistas(),
                getNegocioActual()
            ]);
            setEspecialistas(espRes.data);
            setNegocioInfo(negRes.data);
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo cargar la información' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const businessHours = useMemo(() => {
        if (!negocioInfo?.horarios || !negocioInfo.horarios[selectedDia]) {
            return { inicio: '08:00', fin: '20:00', abierto: true };
        }
        return negocioInfo.horarios[selectedDia];
    }, [negocioInfo, selectedDia]);

    const hoursRange = useMemo(() => {
        const start = parseInt(businessHours.inicio.split(':')[0]);
        // Si el negocio cierra a las 20:00, el último bloque que se puede asignar empieza a las 19:00
        const end = parseInt(businessHours.fin.split(':')[0]); 
        const hours = [];
        for (let i = start; i < end; i++) {
            hours.push(`${i.toString().padStart(2, '0')}:00`);
        }
        return hours;
    }, [businessHours]);

    const handleToggleShift = async (espId: string, hora: string) => {
        const esp = especialistas.find(e => e._id === espId);
        if (!esp) return;

        let currentSchedule = esp.horarioSemanal || {};
        let dayShifts = currentSchedule[selectedDia] || [];

        const hourInt = parseInt(hora.split(':')[0]);
        const existingIndex = dayShifts.findIndex((s: any) => {
            const sStart = parseInt(s.inicio.split(':')[0]);
            const sEnd = parseInt(s.fin.split(':')[0]);
            return hourInt >= sStart && hourInt < sEnd;
        });

        if (existingIndex > -1) {
            dayShifts.splice(existingIndex, 1);
        } else {
            dayShifts.push({
                inicio: hora,
                fin: `${(hourInt + 1).toString().padStart(2, '0')}:00`
            });
        }

        const updatedEsp = { ...esp, horarioSemanal: { ...currentSchedule, [selectedDia]: dayShifts } };
        setEspecialistas(prev => prev.map(e => e._id === espId ? updatedEsp : e));

        try {
            await updateEspecialista(espId, { horarioSemanal: updatedEsp.horarioSemanal });
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo guardar el turno' });
            loadData();
        }
    };

    const handleApplyTemplate = async (template: any) => {
        if (!selectedEspForTemplate) return;
        const esp = selectedEspForTemplate;
        
        let dayShifts = [{
            inicio: template.inicio,
            fin: template.fin
        }];

        const updatedEsp = { 
            ...esp, 
            horarioSemanal: { ...esp.horarioSemanal, [selectedDia]: dayShifts } 
        };
        setEspecialistas(prev => prev.map(e => e._id === esp._id ? updatedEsp : e));
        setShowTemplateModal(false);

        try {
            await updateEspecialista(esp._id, { horarioSemanal: updatedEsp.horarioSemanal });
            Toast.show({ type: 'success', text1: 'Turno asignado', text2: `${template.nombre} aplicado a ${esp.nombre}` });
        } catch (error) {
            loadData();
        }
    };

    const handleClearDay = async () => {
        if (!selectedEspForTemplate) return;
        const esp = selectedEspForTemplate;
        
        const updatedEsp = { 
            ...esp, 
            horarioSemanal: { ...esp.horarioSemanal, [selectedDia]: [] } 
        };
        setEspecialistas(prev => prev.map(e => e._id === esp._id ? updatedEsp : e));
        setShowTemplateModal(false);

        try {
            await updateEspecialista(esp._id, { horarioSemanal: updatedEsp.horarioSemanal });
        } catch (error) {
            loadData();
        }
    };

    const handleCopyYesterday = async () => {
        const diaIndex = DIAS.findIndex(d => d.key === selectedDia);
        if (diaIndex === 0) {
            Toast.show({ type: 'info', text1: 'Info', text2: 'No hay un día anterior para esta semana' });
            return;
        }

        const ayerKey = DIAS[diaIndex - 1].key;
        setIsSaving(true);

        try {
            const updates = especialistas.map(esp => {
                const ayerShifts = esp.horarioSemanal?.[ayerKey] || [];
                const updatedSchedule = { ...esp.horarioSemanal, [selectedDia]: ayerShifts };
                return updateEspecialista(esp._id, { horarioSemanal: updatedSchedule });
            });

            await Promise.all(updates);
            Toast.show({ type: 'success', text1: '¡Listos!', text2: `Se copiaron los turnos del ${DIAS[diaIndex - 1].label}` });
            loadData();
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron copiar los turnos' });
        } finally {
            setIsSaving(false);
        }
    };

    return {
        loading,
        especialistas,
        negocioInfo,
        selectedDia,
        setSelectedDia,
        isSaving,
        selectedEspForTemplate,
        setSelectedEspForTemplate,
        showTemplateModal,
        setShowTemplateModal,
        businessHours,
        hoursRange,
        handleToggleShift,
        handleApplyTemplate,
        handleClearDay,
        handleCopyYesterday,
        refreshData: loadData
    };
};
