import { lightTheme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export type MenuItemId = 
    | 'especialistas' 
    | 'productos' 
    | 'gastos' 
    | 'finanzas' 
    | 'comisiones' 
    | 'reportes' 
    | 'encuestas'
    | 'feedbacks'
    | 'reservas'
    | 'soporte';

export interface AdminMenuItem {
    id: MenuItemId;
    title: string;
    desc: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    navigation: string;
}

export interface AdminHubConfig {
    subtitle: string;
    menuItems: AdminMenuItem[];
}

// Configuración para negocios de BELLEZA (Barberías, Salones)
const BELLEZA_CONFIG: AdminHubConfig = {
    subtitle: 'Administración de tu centro de belleza',
    menuItems: [
        {
            id: 'especialistas',
            title: 'Especialistas',
            desc: 'Barberos y Estilistas',
            icon: 'people-circle-outline',
            color: lightTheme.primary,
            navigation: 'Especialistas'
        },
        {
            id: 'productos',
            title: 'Servicios',
            desc: 'Precios y Cortes',
            icon: 'cut-outline',
            color: '#3b82f6',
            navigation: 'Servicios'
        },
        {
            id: 'gastos',
            title: 'Facturas',
            desc: 'Ver Gastos',
            icon: 'receipt-outline',
            color: '#10b981',
            navigation: 'Gastos'
        },
        {
            id: 'comisiones',
            title: 'Comisiones',
            desc: 'Reparto de Ganancias',
            icon: 'cash-outline',
            color: '#059669',
            navigation: 'Comisiones'
        },
        {
            id: 'finanzas',
            title: 'Salud Financiera',
            desc: 'Ingresos vs Gastos',
            icon: 'analytics-outline',
            color: '#f59e0b',
            navigation: 'Finanzas'
        },
        {
            id: 'reportes',
            title: 'Reportes CSV',
            desc: 'Exportar para contador',
            icon: 'cloud-download-outline',
            color: '#6366f1',
            navigation: 'Reportes'
        },
        {
            id: 'encuestas',
            title: 'Encuestas',
            desc: 'Satisfacción y Marketing',
            icon: 'mail-unread-outline',
            color: '#ec4899',
            navigation: 'Encuestas'
        },
        {
            id: 'feedbacks',
            title: 'Resultados',
            desc: 'Opiniones y Estrellas',
            icon: 'chatbubbles-outline',
            color: '#f43f5e',
            navigation: 'Feedbacks'
        },
        {
            id: 'reservas',
            title: 'Reservas',
            desc: 'Agenda de Citas',
            icon: 'calendar-outline',
            color: '#38BDF8',
            navigation: 'Reservas'
        },
        {
            id: 'soporte',
            title: 'Soporte',
            desc: 'Ayuda y Contacto',
            icon: 'help-buoy-outline',
            color: '#06b6d4',
            navigation: 'Soporte'
        }
    ]
};

// El "Selector" o Traductor que mencionabas
export const getAdminHubConfig = (user: any): AdminHubConfig => {
    return BELLEZA_CONFIG;
};
