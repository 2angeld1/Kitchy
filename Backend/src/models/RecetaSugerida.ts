import { Schema, model } from 'mongoose';

const RecetaSugeridaSchema = new Schema({
    nombrePlato: { type: String, required: true, unique: true, index: true },
    categoria: { type: String },
    servingSize: { type: String },
    ingredientes: [{
        nombre: String,
        cantidad: Number,
        unidad: String,
        idInventario: { type: Schema.Types.Mixed }, // Puede ser string o null
        costoEstimado: Number
    }],
    costoTotal: { type: Number },
    precioSugerido: { type: Number },
    negocioId: { type: Schema.Types.ObjectId, ref: 'Negocio' }, // Opcional, por ahora global para aprender de todos
    createdAt: { type: Date, default: Date.now }
});

export const RecetaSugerida = model('RecetaSugerida', RecetaSugeridaSchema);
