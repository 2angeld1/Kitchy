import mongoose, { Document, Schema } from 'mongoose';

export interface IGasto extends Document {
    descripcion: string;
    categoria: 'servicios' | 'renta' | 'personal' | 'mantenimiento' | 'impuestos' | 'otro';
    monto: number;
    fecha: Date;
    comprobante?: string; // URL de la imagen si se desea
    usuario: mongoose.Types.ObjectId;
    negocioId: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const GastoSchema: Schema = new Schema({
    descripcion: {
        type: String,
        required: true,
        trim: true
    },
    categoria: {
        type: String,
        enum: ['servicios', 'renta', 'personal', 'mantenimiento', 'impuestos', 'otro'],
        default: 'servicios'
    },
    monto: {
        type: Number,
        required: true,
        min: 0
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    comprobante: {
        type: String
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
GastoSchema.index({ negocioId: 1, fecha: -1 });
GastoSchema.index({ categoria: 1, negocioId: 1 });

export default mongoose.model<IGasto>('Gasto', GastoSchema);
