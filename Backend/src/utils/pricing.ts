export const calcularPrecioSugerido = (costoTotal: number, margenObjetivoStrOrNum: number | string): number => {
    const margenObjetivo = typeof margenObjetivoStrOrNum === 'string' ? parseFloat(margenObjetivoStrOrNum) : margenObjetivoStrOrNum;
    if (margenObjetivo >= 100 || costoTotal <= 0) return costoTotal; // Evitar división por cero o precios ilógicos
    return parseFloat((costoTotal / (1 - (margenObjetivo / 100))).toFixed(2));
};

export const calcularMargenActual = (precioActual: number, costoTotal: number): number => {
    if (precioActual <= 0) return 0;
    return parseFloat((((precioActual - costoTotal) / precioActual) * 100).toFixed(2));
};
