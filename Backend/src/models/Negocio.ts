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
    shiftPresets?: {
        nombre: string;
        inicio: string;
        fin: string;
        color?: string;
    }[];
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
        tareas?: {
            id: string;
            nombre: string;
            turno: 'mañana' | 'tarde' | 'ambos';
        }[];
        bonoPorTarea?: number; // % extra por cada tarea realizada
    };
    comisionReventa?: {
        porcentajeGlobal: number; // % que se lleva el especialista por vender productos
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
    horarios?: {
        [key: string]: {
            abierto: boolean;
            inicio: string;
            fin: string;
        }
    };
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
        cortesPorCiclo: { type: Number, default: 5 },
        tareas: {
            type: [{
                id: { type: String, required: true },
                nombre: { type: String, required: true },
                turno: { type: String, enum: ['mañana', 'tarde', 'ambos'], default: 'ambos' }
            }],
            default: []
        },
        bonoPorTarea: { type: Number, default: 5, min: 0 }
    },
    comisionReventa: {
        porcentajeGlobal: { type: Number, default: 10, min: 0, max: 100 }
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
    onboardingStep: { type: Number, default: 0 },
    shiftPresets: {
        type: [{
            nombre: { type: String, required: true },
            inicio: { type: String, required: true },
            fin: { type: String, required: true },
            color: { type: String, default: '#3b82f6' }
        }],
        default: [
            { nombre: 'Jornada Completa', inicio: '08:00', fin: '18:00', color: '#10b981' },
            { nombre: 'Mañana', inicio: '08:00', fin: '14:00', color: '#3b82f6' },
            { nombre: 'Tarde', inicio: '14:00', fin: '20:00', color: '#f59e0b' }
        ]
    },
    horarios: {
        type: Map,
        of: {
            abierto: { type: Boolean, default: true },
            inicio: { type: String, default: '08:00' },
            fin: { type: String, default: '20:00' }
        },
        default: {
            lunes: { abierto: true, inicio: '08:00', fin: '20:00' },
            martes: { abierto: true, inicio: '08:00', fin: '20:00' },
            miercoles: { abierto: true, inicio: '08:00', fin: '20:00' },
            jueves: { abierto: true, inicio: '08:00', fin: '20:00' },
            viernes: { abierto: true, inicio: '08:00', fin: '20:00' },
            sabado: { abierto: true, inicio: '08:00', fin: '20:00' },
            domingo: { abierto: false, inicio: '08:00', fin: '20:00' }
        }
    }
}, {
    timestamps: true
});

export default mongoose.model<INegocio>('Negocio', negocioSchema);
