import { lightTheme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export type MenuItemId =
    | 'productos'
    | 'usuarios'
    | 'gastos'
    | 'finanzas'
    | 'presupuestario'
    | 'reportes'
    | 'reservas'
    | 'inventario'
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

// Configuración para negocios de COMIDA (Restaurantes, Cafés)
const COMIDA_CONFIG: AdminHubConfig = {
    subtitle: 'Gestión operativa de tu restaurante',
    menuItems: [
        {
            id: 'productos',
            title: 'Productos',
            desc: 'Gestionar catálogo',
            icon: 'fast-food-outline',
            color: lightTheme.primary,
            navigation: 'Productos'
        },
        {
            id: 'usuarios',
            title: 'Usuarios',
            desc: 'Cajeros y Meseros',
            icon: 'people-outline',
            color: '#3b82f6',
            navigation: 'Usuarios'
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
            id: 'finanzas',
            title: 'Salud Financiera',
            desc: 'Ingresos vs Gastos',
            icon: 'analytics-outline',
            color: '#f59e0b',
            navigation: 'Finanzas'
        },
        {
            id: 'presupuestario',
            title: 'Presupuestario',
            desc: 'Carrito Inteligente',
            icon: 'cart-outline',
            color: '#ec4899',
            navigation: 'Presupuestario'
        },
        {
            id: 'reportes',
            title: 'Reportes CSV',
            desc: 'Exportar para contador',
            icon: 'cloud-download-outline',
            color: '#6366f1',
            navigation: 'Reportes' // Manejado por modal en el screen
        },
        {
            id: 'reservas',
            title: 'Reservas',
            desc: 'Gestión de Mesas',
            icon: 'calendar-outline',
            color: '#8b5cf6',
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

// Configuración para negocios de FRUTERÍA
const FRUTERIA_CONFIG: AdminHubConfig = {
    subtitle: 'Gestión de tu frutería y mercadito',
    menuItems: [
        {
            id: 'inventario',
            title: 'Inventario',
            desc: 'Stock y Suministros',
            icon: 'cube-outline',
            color: '#3b82f6',
            navigation: 'Inventario'
        },
        {
            id: 'usuarios',
            title: 'Usuarios',
            desc: 'Cajeros y Ayudantes',
            icon: 'people-outline',
            color: '#6366f1',
            navigation: 'Usuarios'
        },
        {
            id: 'gastos',
            title: 'Facturas',
            desc: 'Compras y Gastos',
            icon: 'receipt-outline',
            color: '#f59e0b',
            navigation: 'Gastos'
        },
        {
            id: 'finanzas',
            title: 'Salud Financiera',
            desc: 'Cierre y Ganancias',
            icon: 'analytics-outline',
            color: '#ec4899',
            navigation: 'Finanzas'
        },
        {
            id: 'reportes',
            title: 'Reportes CSV',
            desc: 'Exportar para contador',
            icon: 'cloud-download-outline',
            color: '#475569',
            navigation: 'Reportes'
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
export const getAdminHubConfig = (categoria: string): AdminHubConfig => {
    switch (categoria?.toUpperCase()) {
        case 'FRUTERIA':
            return FRUTERIA_CONFIG;
        case 'COMIDA':
        default:
            return COMIDA_CONFIG;
    }
};
