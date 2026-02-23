import mongoose, { Document, Schema } from 'mongoose';

export interface IIngredienteProducto {
    inventario: mongoose.Types.ObjectId;
    cantidad: number;
}

export interface IProducto extends Document {
    nombre: string;
    descripcion?: string;
    precio: number;
    categoria: 'comida' | 'bebida' | 'postre' | 'otro';
    disponible: boolean;
    imagen?: string;
    ingredientes?: IIngredienteProducto[];
    createdAt?: Date;
    updatedAt?: Date;
}

const IngredienteProductoSchema: Schema = new Schema({
    inventario: {
        type: Schema.Types.ObjectId,
        ref: 'Inventario',
        required: true
    },
    cantidad: {
        type: Number,
        required: true,
        min: 0.01 // Permitir fracciones (por ejemplo 0.5 kg de carne)
    }
}, { _id: false });

const ProductoSchema: Schema = new Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    precio: {
        type: Number,
        required: true,
        min: 0
    },
    categoria: {
        type: String,
        enum: ['comida', 'bebida', 'postre', 'otro'],
        default: 'comida'
    },
    disponible: {
        type: Boolean,
        default: true
    },
    imagen: {
        type: String,
        trim: true
    },
    ingredientes: {
        type: [IngredienteProductoSchema],
        default: []
    }
}, {
    timestamps: true
});

// Índice para búsquedas por categoría y disponibilidad
ProductoSchema.index({ categoria: 1, disponible: 1 });
ProductoSchema.index({ nombre: 'text' });

export default mongoose.model<IProducto>('Producto', ProductoSchema);
