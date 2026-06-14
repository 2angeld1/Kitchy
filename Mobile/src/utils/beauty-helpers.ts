import { Ionicons } from '@expo/vector-icons';
import { Negocio } from '../context/AuthContext';

/**
 * Utilidades generales para Vesta Market
 */

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
export const getInventoryIcon = (categoria: string, categoriaNegocio: string): keyof typeof Ionicons.glyphMap => {
    const cat = categoria?.toLowerCase();
    
    if (cat === 'ingrediente') return 'restaurant-outline';
    if (cat === 'bebida') return 'cafe-outline';
    if (cat === 'limpieza') return 'trash-outline';
    
    return 'cube-outline';
};

/**
 * Detecta la categoría del negocio activo de forma robusta a partir del objeto de usuario
 */
export const getCategoriaNegocio = (user: any): string => {
    if (!user) return 'COMIDA';
    
    // Si negocioActivo es un objeto (Negocio)
    if (user.negocioActivo && typeof user.negocioActivo === 'object') {
        return (user.negocioActivo as Negocio).categoria || 'COMIDA';
    }
    
    // Si es un ID, buscarlo en negocioIds
    const negocios = user.negocioIds || [];
    const activoId = user.negocioActivo;
    const activo = negocios.find((n: any) => n._id === activoId || n === activoId) || negocios[0];
    
    return (activo as any)?.categoria || 'COMIDA';
};
