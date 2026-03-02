import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kitchy';

async function migrateNegociosUsuario() {
    try {
        console.log('Conectando a MongoDB para migración de negocioIds...');
        await mongoose.connect(uri);

        // Agregamos un campo temporal negocioId en el select para leerlo, aunque 
        // ya no está en el schema de TS. Mongoose lo deja leer usando .get('campo').
        const users = await User.find({}, { negocioIds: 1, negocioActivo: 1, _id: 1, email: 1 }).lean();

        // Pero leer un campo que no está en el eschema con lean() es posible.
        // Wait, para asegurarnos de traer los campos viejos y no tipados estrictos
        // es mejor usar la coleccion nativa.

        const db = mongoose.connection.db;
        const usersCollection = db?.collection('users');
        if (!usersCollection) throw new Error("Coleccion users no encontrada");

        const rawUsers = await usersCollection.find({}).toArray();

        let migrados = 0;

        for (const u of rawUsers) {
            // Si tiene negocioId (viejo) y no tiene negocioIds (nuevo) o array vacío
            if (u.negocioId && (!u.negocioIds || u.negocioIds.length === 0)) {
                await usersCollection.updateOne(
                    { _id: u._id },
                    {
                        $set: {
                            negocioIds: [u.negocioId],
                            negocioActivo: u.negocioId
                        }
                    }
                );
                migrados++;
                console.log(`Usuario migrado: ${u.email}`);
            }
        }

        console.log(`✅ Migración completada. Usuarios actualizados: ${migrados}`);
        process.exit(0);

    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

migrateNegociosUsuario();
