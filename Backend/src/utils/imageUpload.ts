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

    // Normalizar base64: si no tiene el prefijo data:image, se lo ponemos (asumiendo jpeg por defecto)
    let finalContent = imageContent;
    if (!imageContent.startsWith('data:image') && imageContent.length > 100) {
        finalContent = `data:image/jpeg;base64,${imageContent}`;
    }

    // Si es base64 (o lo hemos normalizado como tal), lo subimos
    if (finalContent.startsWith('data:image')) {
        try {
            const uploadResponse = await cloudinary.uploader.upload(finalContent, {
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

/**
 * Elimina una imagen de Cloudinary a partir de su URL segura.
 */
export const deleteImage = async (imageUrl: string | null | undefined): Promise<boolean> => {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) return false;

    try {
        // Extraer public_id de la URL: .../v1234567/folder/public_id.jpg
        // Ejemplo URL: https://res.cloudinary.com/dnwk212uf/image/upload/v1712411234/notebook_scans/xyz123.jpg
        const parts = imageUrl.split('/');
        const lastPart = parts[parts.length - 1];
        const publicIdWithExt = lastPart.split('.')[0];
        
        // Identificar si hay carpetas después de 'upload/v...'
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return false;

        // Saltamos 'upload' y la versión 'v...'
        const folderParts = parts.slice(uploadIndex + 2, parts.length - 1);
        const publicId = folderParts.length > 0 
            ? `${folderParts.join('/')}/${publicIdWithExt}`
            : publicIdWithExt;

        console.log(`🗑️ Eliminando de Cloudinary: ${publicId}`);
        await cloudinary.uploader.destroy(publicId);
        return true;
    } catch (error) {
        console.warn('⚠️ No se pudo eliminar la imagen de Cloudinary:', error);
        return false;
    }
};
