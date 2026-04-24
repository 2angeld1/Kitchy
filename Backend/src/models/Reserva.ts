import mongoose, { Document, Schema } from 'mongoose';

export interface IReserva extends Document {
    negocioId: mongoose.Types.ObjectId;
    clienteId?: mongoose.Types.ObjectId;
    nombreCliente: string;
    emailCliente?: string;
    telefonoCliente?: string;
    tipo: 'GASTRONOMIA' | 'BELLEZA';
    recursoId?: mongoose.Types.ObjectId; // ID del Especialista o Mesa
    nombreRecurso?: string; // Nombre de la mesa o especialista para acceso rápido
    fecha: Date;
    horaInicio: string;
    horaFin?: string;
    numPersonas?: number; // Para gastronomía
    estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada' | 'no_asistio';
    notas?: string;
    usuarioId: mongoose.Types.ObjectId; // Quién creó la reserva
    createdAt?: Date;
    updatedAt?: Date;
}

const ReservaSchema: Schema = new Schema({
    negocioId: {
        type: Schema.Types.ObjectId,
        ref: 'Negocio',
        required: true
    },
    clienteId: {
        type: Schema.Types.ObjectId,
        ref: 'Cliente'
    },
    nombreCliente: {
        type: String,
        required: true,
        trim: true
    },
    emailCliente: {
        type: String,
        trim: true,
        lowercase: true
    },
    telefonoCliente: {
        type: String,
        trim: true
    },
    tipo: {
        type: String,
        enum: ['GASTRONOMIA', 'BELLEZA'],
        required: true
    },
    recursoId: {
        type: Schema.Types.ObjectId
    },
    nombreRecurso: {
        type: String
    },
    fecha: {
        type: Date,
        required: true
    },
    horaInicio: {
        type: String,
        required: true
    },
    horaFin: {
        type: String
    },
    numPersonas: {
        type: Number,
        default: 1
    },
    estado: {
        type: String,
        enum: ['pendiente', 'confirmada', 'cancelada', 'completada', 'no_asistio'],
        default: 'pendiente'
    },
    notas: {
        type: String
    },
    usuarioId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Índices para búsquedas rápidas
ReservaSchema.index({ negocioId: 1, fecha: 1 });
ReservaSchema.index({ negocioId: 1, clienteId: 1 });
ReservaSchema.index({ emailCliente: 1 });
ReservaSchema.index({ telefonoCliente: 1 });

export default mongoose.model<IReserva>('Reserva', ReservaSchema);
