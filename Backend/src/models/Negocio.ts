import mongoose, { Document, Schema } from 'mongoose';

export interface INegocio extends Document {
    nombre: string;
    ruc?: string;
    logo?: string;
    tipo?: 'comida' | 'bebida' | 'postre' | 'otro';
    categoria: 'COMIDA' | 'BELLEZA';
    config: {
        moneda: string;
        denominaciones: number[];
        impuesto: number;
        margenObjetivo: number;
    };
    comisionConfig?: {
        tipo: 'fijo' | 'escalonado';
        fijo?: {
            porcentajeBarbero: number;
            porcentajeDueno: number;
        };
        escalonado?: {
            desde: number;
            hasta: number;
            porcentajeBarbero: number;
            porcentajeDueno: number;
        }[];
        cortesPorCiclo: number;
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
    onboardingStep: number;
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
    categoria: {
        type: String,
        enum: ['COMIDA', 'BELLEZA'],
        default: 'COMIDA'
    },
    config: {
        moneda: { type: String, default: 'USD' },
        denominaciones: { type: [Number], default: [1, 5, 10, 20, 50, 100] },
        impuesto: { type: Number, default: 0.07 },
        margenObjetivo: { type: Number, default: 65 }
    },
    comisionConfig: {
        tipo: { type: String, enum: ['fijo', 'escalonado'], default: 'escalonado' },
        fijo: {
            porcentajeBarbero: { type: Number, default: 50 },
            porcentajeDueno: { type: Number, default: 50 }
        },
        escalonado: {
            type: [{
                desde: Number,
                hasta: Number,
                porcentajeBarbero: Number,
                porcentajeDueno: Number
            }],
            default: [
                { desde: 1, hasta: 4, porcentajeBarbero: 50, porcentajeDueno: 50 },
                { desde: 5, hasta: 8, porcentajeBarbero: 60, porcentajeDueno: 40 },
                { desde: 9, hasta: 99, porcentajeBarbero: 70, porcentajeDueno: 30 }
            ]
        },
        cortesPorCiclo: { type: Number, default: 5 }
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
    totalCommissionLifetime: { type: Number, default: 0 },
    onboardingStep: { type: Number, default: 0 }
}, {
    timestamps: true
});

export default mongoose.model<INegocio>('Negocio', negocioSchema);
