import mongoose, { Document, Schema } from 'mongoose';

export interface INegocio extends Document {
    nombre: string;
    ruc?: string;
    logo?: string;
    tipo: 'comida' | 'bebida' | 'postre' | 'otro';
    config: {
        moneda: string;
        impuesto: number;
    };
    direccion?: string;
    telefono?: string;
    propietario: mongoose.Types.ObjectId;
}

const negocioSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    ruc: {
        type: String,
        trim: true
    },
    logo: {
        type: String
    },
    tipo: {
        type: String,
        enum: ['comida', 'bebida', 'postre', 'otro'],
        default: 'comida'
    },
    config: {
        moneda: { type: String, default: 'USD' },
        impuesto: { type: Number, default: 0.07 }
    },
    propietario: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    direccion: {
        type: String,
        trim: true
    },
    telefono: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

export default mongoose.model<INegocio>('Negocio', negocioSchema);
