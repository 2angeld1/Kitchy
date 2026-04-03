import mongoose, { Document, Schema } from 'mongoose';

export interface IInventario extends Document {
    nombre: string;
    descripcion?: string;
    cantidad: number;
    unidad: 'unidades' | 'kg' | 'lb' | 'litros' | 'gramos' | 'ml';
    cantidadMinima: number; // Alerta cuando baja de este nivel
    costoUnitario: number;
    precioVenta?: number; // Precio al que se vende al público (si aplica)
    comisionEspecialista?: number; // % de comisión para el especialista que venda este producto (override)
    categoria: string;
    proveedor?: string;
    codigoBarras?: string;
    fechaVencimiento?: Date;
    usuario: mongoose.Types.ObjectId;
    negocioId: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const InventarioSchema: Schema = new Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    cantidad: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    unidad: {
        type: String,
        enum: ['unidades', 'kg', 'lb', 'litros', 'gramos', 'ml'],
        default: 'unidades'
    },
    cantidadMinima: {
        type: Number,
        default: 0,
        min: 0
    },
    costoUnitario: {
        type: Number,
        required: true,
        min: 0
    },
    precioVenta: {
        type: Number,
        min: 0
    },
    comisionEspecialista: {
        type: Number,
        min: 0,
        max: 100
    },
    categoria: {
        type: String,
        default: 'ingrediente'
    },
    proveedor: {
        type: String,
        trim: true
    },
    codigoBarras: {
        type: String,
        trim: true,
        index: true
    },
    fechaVencimiento: {
        type: Date
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    negocioId: {
        type: Schema.Types.ObjectId,
        ref: 'Negocio',
        required: true
    }
}, {
    timestamps: true
});

// Índices
InventarioSchema.index({ nombre: 'text', negocioId: 1 });
InventarioSchema.index({ categoria: 1, negocioId: 1 });
InventarioSchema.index({ cantidad: 1, cantidadMinima: 1, negocioId: 1 });
InventarioSchema.index({ codigoBarras: 1, negocioId: 1 });

export default mongoose.model<IInventario>('Inventario', InventarioSchema);
