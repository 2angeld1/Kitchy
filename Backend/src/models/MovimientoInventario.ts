import mongoose, { Document, Schema } from 'mongoose';

// Para registrar compras/entradas y salidas del inventario
export interface IMovimientoInventario extends Document {
    inventario: mongoose.Types.ObjectId;
    tipo: 'entrada' | 'salida' | 'ajuste';
    cantidad: number;
    costoTotal?: number; // Para entradas/compras
    motivo: string;
    usuario: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const MovimientoInventarioSchema: Schema = new Schema({
    inventario: {
        type: Schema.Types.ObjectId,
        ref: 'Inventario',
        required: true
    },
    tipo: {
        type: String,
        enum: ['entrada', 'salida', 'ajuste'],
        required: true
    },
    cantidad: {
        type: Number,
        required: true
    },
    costoTotal: {
        type: Number,
        min: 0
    },
    motivo: {
        type: String,
        required: true,
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
MovimientoInventarioSchema.index({ inventario: 1, createdAt: -1 });
MovimientoInventarioSchema.index({ tipo: 1, createdAt: -1 });

export default mongoose.model<IMovimientoInventario>('MovimientoInventario', MovimientoInventarioSchema);
