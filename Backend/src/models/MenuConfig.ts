import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuConfig extends Document {
    nombreRestaurante: string;
    subtitulo: string;
    tema: 'paper' | 'modern' | 'minimal' | 'tasty' | 'gourmet';
    colorPrimario: string;
    colorSecundario: string;
    imagenHero?: string;
    telefono: string;
    direccion?: string;
    horario?: string;
    redesSociales?: {
        instagram?: string;
        facebook?: string;
        whatsapp?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const MenuConfigSchema: Schema = new Schema({
    nombreRestaurante: {
        type: String,
        required: true,
        default: 'Mi Restaurante'
    },
    subtitulo: {
        type: String,
        default: 'Restaurant & Bar'
    },
    tema: {
        type: String,
        enum: ['paper', 'modern', 'minimal', 'tasty', 'gourmet'],
        default: 'paper'
    },
    colorPrimario: {
        type: String,
        default: '#c92c2c'
    },
    colorSecundario: {
        type: String,
        default: '#d4af37'
    },
    imagenHero: {
        type: String,
        default: ''
    },
    telefono: {
        type: String,
        default: '+507-000-0000'
    },
    direccion: {
        type: String,
        default: ''
    },
    horario: {
        type: String,
        default: ''
    },
    redesSociales: {
        instagram: { type: String, default: '' },
        facebook: { type: String, default: '' },
        whatsapp: { type: String, default: '' }
    }
}, {
    timestamps: true
});

export default mongoose.model<IMenuConfig>('MenuConfig', MenuConfigSchema);
