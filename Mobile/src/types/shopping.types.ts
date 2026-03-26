export interface ShoppingItem {
    id: string;
    nombre: string;
    cantidad: number;
    unidad: string;
    precioEstimado: number;
    precioReal?: number;
    confirmado: boolean;
}
