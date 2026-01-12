import mongoose, { Document, Schema } from 'mongoose';

export interface IInventario extends Document {
    nombre: string;
    descripcion?: string;
    cantidad: number;
    unidad: 'unidades' | 'kg' | 'lb' | 'litros' | 'gramos' | 'ml';
    cantidadMinima: number; // Alerta cuando baja de este nivel
    costoUnitario: number;
    categoria: 'ingrediente' | 'insumo' | 'empaque' | 'otro';
    proveedor?: string;
    usuario: mongoose.Types.ObjectId; // Quien registró/actualizó
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
    categoria: {
        type: String,
        enum: ['ingrediente', 'insumo', 'empaque', 'otro'],
        default: 'ingrediente'
    },
    proveedor: {
        type: String,
        trim: true
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Índices
InventarioSchema.index({ nombre: 'text' });
InventarioSchema.index({ categoria: 1 });
InventarioSchema.index({ cantidad: 1, cantidadMinima: 1 }); // Para alertas de stock bajo

export default mongoose.model<IInventario>('Inventario', InventarioSchema);
