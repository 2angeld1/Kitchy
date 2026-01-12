import cloudinary from '../config/cloudinary';

/**
 * Sube una imagen en base64 a Cloudinary y devuelve la URL segura.
 * Si la entrada ya es una URL, la devuelve tal cual.
 * @param imageContent El contenido de la imagen (base64 o URL)
 * @param folder Carpeta en Cloudinary
 */
export const uploadImage = async (imageContent: string | null | undefined, folder: string = 'yappy_proofs'): Promise<string | null> => {
    if (!imageContent) return null;
    
    // Si ya es una URL de Cloudinary o externa, no hacemos nada
    if (imageContent.startsWith('http')) {
        return imageContent;
    }

    // Si es base64, la subimos
    if (imageContent.startsWith('data:image')) {
        try {
            const uploadResponse = await cloudinary.uploader.upload(imageContent, {
                folder: folder,
                resource_type: 'auto',
            });
            return uploadResponse.secure_url;
        } catch (error) {
            console.error('Error al subir imagen a Cloudinary:', error);
            throw new Error('No se pudo subir la imagen');
        }
    }

    return imageContent;
};
