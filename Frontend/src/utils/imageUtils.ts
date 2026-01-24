export const resizeImage = (file: File, maxWidth: number = 800, maxHeight: number = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                
                // Compress to 70% quality JPEG which is much smaller than PNG
                resolve(canvas.toDataURL('image/jpeg', 0.7)); 
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

export const optimizeImageUrl = (url: string, width: number = 400, height: number = 400): string => {
    if (!url) return '';

    // Optimización para Unsplash
    if (url.includes('images.unsplash.com')) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}w=${width}&h=${height}&fit=crop&auto=format,compress&q=60`;
    }

    // Optimización para Cloudinary
    if (url.includes('res.cloudinary.com')) {
        // Inyectar transformaciones después de /upload/
        // q_auto: calidad automática, f_auto: formato automático (webp/avif)
        const transformation = `w_${width},h_${height},c_fill,q_auto,f_auto`;
        return url.replace('/upload/', `/upload/${transformation}/`);
    }

    return url;
};
