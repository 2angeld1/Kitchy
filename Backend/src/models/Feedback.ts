import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
    ventaId: mongoose.Types.ObjectId;
    negocioId: mongoose.Types.ObjectId;
    puntuacion: number;
    comentario: string;
    sugerencias: string;
    createdAt: Date;
}

const FeedbackSchema: Schema = new Schema({
    ventaId: {
        type: Schema.Types.ObjectId,
        ref: 'Venta',
        required: true
    },
    negocioId: {
        type: Schema.Types.ObjectId,
        ref: 'Negocio',
        required: true
    },
    puntuacion: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comentario: {
        type: String,
        trim: true
    },
    sugerencias: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
