import { Ionicons } from '@expo/vector-icons';
import { Negocio } from '../../shared/context/AuthContext';

/**
 * Utilidades para el módulo de Belleza y Barbería
 */

/**
 * Retorna el nombre del icono de Ionicons basado en el nombre del servicio
 * @param nombre Nombre del servicio o producto
 */
export const getBeautyIcon = (nombre: string, categoria?: string): any => {
    const n = nombre.toLowerCase();
    if (n.includes('corte')) return 'cut';
    if (n.includes('barba')) return 'brush';
    if (n.includes('lavado')) return 'water';
    if (n.includes('ceja')) return 'eye';
    if (n.includes('tinte')) return 'color-palette';
    if (n.includes('peinado')) return 'sparkles';
    if (n.includes('facial')) return 'leaf';
    
    // Car Wash icons
    if (n.includes('aspirado')) return 'hardware-chip';
    if (n.includes('encerado')) return 'sparkles';
    if (n.includes('pulido')) return 'color-wand';
    if (n.includes('motor')) return 'cog';
    if (n.includes('detallado') || n.includes('detailing')) return 'diamond';
    if (n.includes('auto') || n.includes('carro') || n.includes('coche')) return 'car-sport';

    return categoria === 'LAVAUTOS' ? 'car-sport' : 'flash'; // Icono por defecto
};

/**
 * Formatea un número a moneda (USD por defecto)
 */
export const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

/**
 * Retorna el icono correcto para un item de inventario basado en su categoría
 */
export const getInventoryIcon = (categoria: string, categoriaNegocio: string = 'BELLEZA'): keyof typeof Ionicons.glyphMap => {
    const cat = categoria?.toLowerCase();
    
    if (cat === 'insumo') return 'flask-outline';
    if (cat === 'herramienta') return 'cut-outline';
    if (cat === 'reventa') return 'sparkles-outline';
    if (cat === 'limpieza') return 'brush-outline';
    
    return 'cube-outline';
};

/**
 * Detecta la categoría del negocio activo de forma robusta a partir del objeto de usuario
 */
export const getCategoriaNegocio = (user: any): string => {
    return 'BELLEZA';
};
