import mongoose, { Document, Schema } from 'mongoose';

export interface ICliente extends Document {
    nombre: string;
    telefono?: string;
    email?: string;
    esFrecuente: boolean;
    especialistaFrecuente?: mongoose.Types.ObjectId;
    conteoVisitas: number;
    totalGastado: number;
    ultimaVisita?: Date;
    negocioId: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const ClienteSchema: Schema = new Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    telefono: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    esFrecuente: {
        type: Boolean,
        default: false
    },
    especialistaFrecuente: {
        type: Schema.Types.ObjectId,
        ref: 'Especialista'
    },
    conteoVisitas: {
        type: Number,
        default: 0
    },
    totalGastado: {
        type: Number,
        default: 0
    },
    ultimaVisita: {
        type: Date
    },
    negocioId: {
        type: Schema.Types.ObjectId,
        ref: 'Negocio',
        required: true
    }
}, {
    timestamps: true
});

// Índice compuesto para buscar clientes rápido por negocio y teléfono/email
ClienteSchema.index({ negocioId: 1, telefono: 1 });
ClienteSchema.index({ negocioId: 1, email: 1 });
ClienteSchema.index({ negocioId: 1, nombre: 'text' });

export default mongoose.model<ICliente>('Cliente', ClienteSchema);
