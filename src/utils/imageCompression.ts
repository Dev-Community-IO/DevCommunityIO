/**
 * Compress and resize image file
 * @param file - Image file to compress
 * @param maxWidth - Maximum width (default: 1920)
 * @param maxHeight - Maximum height (default: 1080)
 * @param quality - JPEG quality 0-1 (default: 0.85)
 * @returns Compressed File object
 */
export async function compressImage(
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.85
): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = width * ratio;
                    height = height * ratio;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Failed to compress image'));
                            return;
                        }

                        // Ensure we have a valid blob with size
                        if (blob.size === 0) {
                            reject(new Error('Compressed image is empty'));
                            return;
                        }

                        // Preserve original filename or use default
                        const fileName = file.name || `compressed-${Date.now()}.jpg`;

                        const compressedFile = new File([blob], fileName, {
                            type: blob.type || 'image/jpeg',
                            lastModified: Date.now(),
                        });

                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Compress image for avatar (400x400)
 */
export async function compressAvatar(file: File): Promise<File> {
    return compressImage(file, 400, 400, 0.85);
}

/**
 * Compress image for cover (1500x500)
 */
export async function compressCover(file: File): Promise<File> {
    return compressImage(file, 1500, 500, 0.85);
}

