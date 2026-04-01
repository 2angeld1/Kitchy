import mongoose, { Document, Schema } from 'mongoose';

export interface IEspecialista extends Document {
    nombre: string;
    negocioId: mongoose.Types.ObjectId;
    comision?: number; // % personalizado opcional, sino hereda el global del negocio
    tipoComision?: 'fijo' | 'escalonado'; // tipo individual, si no se define hereda del negocio
    activo: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const EspecialistaSchema: Schema = new Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    negocioId: {
        type: Schema.Types.ObjectId,
        ref: 'Negocio',
        required: true
    },
    comision: {
        type: Number,
        default: 50 // Por defecto 50/50
    },
    tipoComision: {
        type: String,
        enum: ['fijo', 'escalonado'],
        default: null // null = hereda del negocio
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

EspecialistaSchema.index({ negocioId: 1, activo: 1 });

export default mongoose.model<IEspecialista>('Especialista', EspecialistaSchema);
