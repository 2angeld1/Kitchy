import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);

        // Elimina el admin existente si existe
        await User.deleteOne({ email: 'admin@superadmin.com' });

        const admin = new User({
            email: 'admin@superadmin.com',
            password: 'admin123',
            nombre: 'Super Admin',
            rol: 'superadmin'
        });

        await admin.save();
        console.log('✅ Usuario superadmin creado correctamente');
        console.log('📧 Email: admin@superadmin.com');
        console.log('🔑 Password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

createAdmin();