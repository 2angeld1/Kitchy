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
    pilotStatus: 'active' | 'graduated' | 'paused';
    pilotStartDate: Date;
    accumulatedSalesMonth: number;
    billingCycleStart: Date;
    billing: {
        balance: number;
        lastPaymentDate?: Date;
        lastPaymentAmount?: number;
        paymentStatus: 'al_dia' | 'pendiente' | 'moroso';
        notes?: string;
    };
    totalSalesLifetime: number;
    totalCommissionLifetime: number;
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
    },
    pilotStatus: {
        type: String,
        enum: ['active', 'graduated', 'paused'],
        default: 'active'
    },
    pilotStartDate: {
        type: Date,
        default: Date.now
    },
    accumulatedSalesMonth: {
        type: Number,
        default: 0
    },
    billingCycleStart: {
        type: Date,
        default: Date.now
    },
    billing: {
        balance: { type: Number, default: 0 },
        lastPaymentDate: { type: Date },
        lastPaymentAmount: { type: Number },
        paymentStatus: {
            type: String,
            enum: ['al_dia', 'pendiente', 'moroso'],
            default: 'al_dia'
        },
        notes: { type: String, trim: true }
    },
    totalSalesLifetime: { type: Number, default: 0 },
    totalCommissionLifetime: { type: Number, default: 0 }
}, {
    timestamps: true
});

export default mongoose.model<INegocio>('Negocio', negocioSchema);
