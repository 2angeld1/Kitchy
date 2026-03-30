import { startOfMonth, endOfMonth, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';

export type PeriodoTipo = 'hoy' | 'semana' | 'quincena' | 'mes';

/**
 * Calcula el rango de inicio y fin para un periodo determinado en el Backend.
 * Devuelve objetos Date nativos compatibles con MongoDB.
 */
export const getPeriodRanges = (periodo: PeriodoTipo, baseDate: Date = new Date()): { inicio: Date; fin: Date } => {
    let inicio = startOfMonth(baseDate);
    let fin = endOfMonth(baseDate);

    switch (periodo) {
        case 'hoy':
            inicio = startOfDay(baseDate);
            fin = endOfDay(baseDate);
            break;

        case 'semana':
            inicio = startOfWeek(baseDate, { weekStartsOn: 1 }); // Empezar lunes
            fin = endOfWeek(baseDate, { weekStartsOn: 1 });
            break;

        case 'quincena':
            const diaActual = baseDate.getDate();
            if (diaActual <= 15) {
                inicio = startOfMonth(baseDate);
                fin = endOfDay(new Date(baseDate.getFullYear(), baseDate.getMonth(), 15));
            } else {
                inicio = startOfDay(new Date(baseDate.getFullYear(), baseDate.getMonth(), 16));
                fin = endOfMonth(baseDate);
            }
            break;

        case 'mes':
            inicio = startOfMonth(baseDate);
            fin = endOfMonth(baseDate);
            break;
    }

    return { inicio, fin };
};
