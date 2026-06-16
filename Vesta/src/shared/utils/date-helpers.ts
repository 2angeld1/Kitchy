/**
 * Utilidades para manejo de fechas en formato LOCAL (Panamá/Usuario).
 * Evita discrepancias con UTC al trabajar con POS y Reportes.
 */

export type PeriodoTipo = 'hoy' | 'semana' | 'quincena' | 'mes';

/**
 * Retorna la fecha de hoy en formato "YYYY-MM-DD" (Local)
 */
export const getTodayLocalString = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/**
 * Calcula el rango de inicio y fin para un periodo determinado
 * @param periodo 'hoy' | 'semana' | 'quincena' | 'mes'
 * @returns { inicio: Date, fin: Date }
 */
export const getPeriodRanges = (periodo: PeriodoTipo): { inicio: Date; fin: Date } => {
    const now = new Date();
    let inicio = new Date();
    let fin = new Date();

    switch (periodo) {
        case 'hoy':
            inicio.setHours(0, 0, 0, 0);
            fin.setHours(23, 59, 59, 999);
            break;

        case 'semana':
            const day = now.getDay() || 7; // Lunes = 1
            inicio.setHours(0, 0, 0, 0);
            inicio.setDate(now.getDate() - (day - 1));
            fin.setHours(23, 59, 59, 999);
            fin.setDate(inicio.getDate() + 6);
            break;

        case 'quincena':
            if (now.getDate() <= 15) {
                inicio = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
                fin = new Date(now.getFullYear(), now.getMonth(), 15, 23, 59, 59, 999);
            } else {
                inicio = new Date(now.getFullYear(), now.getMonth(), 16, 0, 0, 0, 0);
                fin = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            }
            break;

        case 'mes':
            inicio = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            fin = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            break;
    }

    return { inicio, fin };
};

/**
 * Formatea una fecha a tiempo relativo (ej: "Hace 5 min", "Hace 2h")
 */
export const formatRelativeTime = (date: Date | string): string => {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Ahora mismo';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)}h`;
    
    // Si es de ayer o más, mostramos la fecha corta
    return then.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
};
