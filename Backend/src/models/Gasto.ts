import mongoose, { Document, Schema } from 'mongoose';

export interface IGasto extends Document {
    descripcion: string;
    categoria: 'servicios' | 'renta' | 'personal' | 'mantenimiento' | 'impuestos' | 'insumos' | 'compras' | 'otro';
    monto: number;
    subtotal?: number;
    itbms?: number;
    fecha: Date;
    proveedor?: string;
    ruc?: string;
    dv?: string;
    nroFactura?: string;
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
        enum: ['servicios', 'renta', 'personal', 'mantenimiento', 'impuestos', 'insumos', 'compras', 'otro'],
        default: 'servicios'
    },
    monto: {
        type: Number,
        required: true,
        min: 0
    },
    subtotal: {
        type: Number,
        default: 0
    },
    itbms: {
        type: Number,
        default: 0
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    proveedor: {
        type: String,
        trim: true
    },
    ruc: {
        type: String,
        trim: true
    },
    dv: {
        type: String,
        trim: true
    },
    nroFactura: {
        type: String,
        trim: true
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
