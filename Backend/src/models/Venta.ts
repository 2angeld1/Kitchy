import mongoose, { Document, Schema } from 'mongoose';

export interface IItemVenta {
    producto: mongoose.Types.ObjectId;
    nombreProducto: string; // Guardamos el nombre para histórico
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

export interface IVenta extends Document {
    items: IItemVenta[];
    total: number;
    metodoPago: 'efectivo' | 'tarjeta' | 'yappy' | 'otro';
    usuario: mongoose.Types.ObjectId;
    cliente?: string; // Nombre opcional del cliente
    notas?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const ItemVentaSchema: Schema = new Schema({
    producto: {
        type: Schema.Types.ObjectId,
        ref: 'Producto',
        required: true
    },
    nombreProducto: {
        type: String,
        required: true
    },
    cantidad: {
        type: Number,
        required: true,
        min: 1
    },
    precioUnitario: {
        type: Number,
        required: true,
        min: 0
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

const VentaSchema: Schema = new Schema({
    items: {
        type: [ItemVentaSchema],
        required: true,
        validate: {
            validator: function(items: IItemVenta[]) {
                return items.length > 0;
            },
            message: 'La venta debe tener al menos un producto'
        }
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    metodoPago: {
        type: String,
        enum: ['efectivo', 'yappy', 'otro'],
        default: 'efectivo'
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cliente: {
        type: String,
        trim: true
    },
    notas: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Índices para búsquedas y reportes
VentaSchema.index({ createdAt: -1 });
VentaSchema.index({ usuario: 1, createdAt: -1 });
VentaSchema.index({ metodoPago: 1 });

export default mongoose.model<IVenta>('Venta', VentaSchema);
