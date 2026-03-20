import mongoose, { Document, Schema } from 'mongoose';

export interface IMarketContext extends Document {
    tipo: 'FUEL' | 'MERCA' | 'ACODECO' | 'WEATHER';
    data: any;
    fecha: Date;
    region: string; // Ejemplo: 'PANAMA_CITY', 'CHORRERA', 'LAS_TABLAS'
    createdAt?: Date;
    updatedAt?: Date;
}

const MarketContextSchema: Schema = new Schema({
    tipo: {
        type: String,
        enum: ['FUEL', 'MERCA', 'ACODECO', 'WEATHER'],
        required: true
    },
    data: {
        type: Schema.Types.Mixed,
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now,
        required: true
    },
    region: {
        type: String,
        default: 'PANAMA',
        trim: true
    }
}, {
    timestamps: true
});

// Índices para búsquedas rápidas por tipo y fecha
MarketContextSchema.index({ tipo: 1, fecha: -1 });
MarketContextSchema.index({ region: 1 });

export default mongoose.model<IMarketContext>('MarketContext', MarketContextSchema);
