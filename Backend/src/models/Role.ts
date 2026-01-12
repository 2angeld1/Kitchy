import mongoose, { Document } from 'mongoose';

export interface IRole extends Document {
    name: string;
    description: string;
    permissions: string[];
}

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    permissions: [{
        type: String
    }]
}, {
    timestamps: true
});

export default mongoose.model<IRole>('Role', roleSchema);
