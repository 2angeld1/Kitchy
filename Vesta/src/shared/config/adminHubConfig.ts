import { lightTheme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export type MenuItemId = 
    | 'especialistas' 
    | 'productos' 
    | 'usuarios'
    | 'gastos' 
    | 'finanzas' 
    | 'comisiones' 
    | 'presupuestario'
    | 'reportes' 
    | 'encuestas'
    | 'feedbacks'
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

// Configuración para negocios de LAVAUTOS (Car Wash)
const LAVAUTOS_CONFIG: AdminHubConfig = {
    subtitle: 'Administración de tu car wash',
    menuItems: [
        {
            id: 'especialistas',
            title: 'Empleados',
            desc: 'Lavadores y Detallistas',
            icon: 'people-circle-outline',
            color: lightTheme.primary,
            navigation: 'Especialistas'
        },
        {
            id: 'productos',
            title: 'Servicios',
            desc: 'Lavados y Paquetes',
            icon: 'car-sport-outline',
            color: '#38BDF8',
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

// Configuración para negocios de JARDINERIA
const JARDINERIA_CONFIG: AdminHubConfig = {
    subtitle: 'Administración de tu jardinería',
    menuItems: [
        {
            id: 'especialistas',
            title: 'Empleados',
            desc: 'Jardineros y Podadores',
            icon: 'people-circle-outline',
            color: lightTheme.primary,
            navigation: 'Especialistas'
        },
        {
            id: 'productos',
            title: 'Servicios',
            desc: 'Jardinería y Mantenimiento',
            icon: 'leaf-outline',
            color: '#10b981',
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

// Configuración para LAVAUTOS sin establecimiento fijo (lavadero individual)
const LAVAUTOS_LAVADERO_CONFIG: AdminHubConfig = {
    subtitle: 'Administración de tu car wash',
    menuItems: [
        {
            id: 'reservas',
            title: 'Registro de Lavado',
            desc: 'Conteo y Reservas',
            icon: 'car-sport-outline',
            color: '#38BDF8',
            navigation: 'Reservas'
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
            id: 'reportes',
            title: 'Reportes CSV',
            desc: 'Exportar para contador',
            icon: 'cloud-download-outline',
            color: '#6366f1',
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
            navigation: 'Reportes'
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

// El "Selector" - devuelve la config correcta según la categoría del negocio
export const getAdminHubConfig = (user: any): AdminHubConfig => {
    const negocioActivo = typeof user?.negocioActivo === 'object'
        ? user.negocioActivo
        : null;
    const categoria = negocioActivo?.categoria;
    const esEstablecimiento = negocioActivo?.esEstablecimiento;

    switch (categoria) {
        case 'COMIDA':
            return COMIDA_CONFIG;
        case 'FRUTERIA':
            return FRUTERIA_CONFIG;
        case 'LAVAUTOS':
            return esEstablecimiento === false ? LAVAUTOS_LAVADERO_CONFIG : LAVAUTOS_CONFIG;
        case 'JARDINERIA':
            return JARDINERIA_CONFIG;
        case 'BELLEZA':
        default:
            return BELLEZA_CONFIG;
    }
};
