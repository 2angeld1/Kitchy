export interface IIngrediente {
    inventario: any; // ID or populated object
    cantidad: number;
    nombreDisplay?: string;
    unidad?: string;
    stock_status?: 'ok' | 'bajo' | 'falta';
    is_missing?: boolean;
}

export interface Producto {
    _id: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    categoria: string;
    disponible: boolean;
    imagen?: string;
    ingredientes?: IIngrediente[];
}

export interface ProductoFormModalProps {
    visible: boolean;
    onClose: () => void;
    editItem: Producto | null;
    nombre: string;
    setNombre: (v: string) => void;
    descripcion: string;
    setDescripcion: (v: string) => void;
    precio: string;
    setPrecio: (v: string) => void;
    categoria: string;
    setCategoria: (v: string) => void;
    disponible: boolean;
    setDisponible: (v: boolean) => void;
    imagen: string;
    setImagen: (v: string) => void;
    ingredientes: IIngrediente[];
    itemsInventario: any[];
    onPickImage: () => void;
    onAddIngrediente: () => void;
    onRemoveIngrediente: (index: number) => void;
    onChangeIngrediente: (index: number, field: string, value: any) => void;
    onSugerirReceta: (servingSize?: string) => void;
    onSubmit: () => void;
    loading: boolean;
    colors: any;
    // Caitlyn props
    productAdvice: string | null;
    loadingCaitlyn: boolean;
    errorCaitlyn: string | null;
    getBusinessAdvice: (nombre: string) => void;
    setProductAdvice: (v: string | null) => void;
    backendCostoTotal?: number;
    backendPrecioSugerido?: number;
    // Delegation props
    servingSize: string;
    onServingSizeChange: (v: string) => void;
    showSizePrompt: boolean;
    onShowSizePromptChange: (v: boolean) => void;
    isLiquid: boolean;
    onPreSugerirReceta: () => void;
    onApplySuggestion: () => void;
    sugerenciaIA: IIngrediente[] | null;
    faltantesIA?: string[];
    handleApplyRecipe: () => void;
}
