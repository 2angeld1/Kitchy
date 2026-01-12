import mongoose, { Document, Schema } from 'mongoose';

export interface IProducto extends Document {
    nombre: string;
    descripcion?: string;
    precio: number;
    categoria: 'comida' | 'bebida' | 'postre' | 'otro';
    disponible: boolean;
    imagen?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

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
    }
}, {
    timestamps: true
});

// Índice para búsquedas por categoría y disponibilidad
ProductoSchema.index({ categoria: 1, disponible: 1 });
ProductoSchema.index({ nombre: 'text' });

export default mongoose.model<IProducto>('Producto', ProductoSchema);
