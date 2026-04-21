/**
 * High-quality image compressor for wedding photos.
 * Reduces iPhone/Android photos from ~3-5MB to ~300-500KB
 * while maintaining excellent visual quality for gallery display.
 */

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const QUALITY = 0.82; // Sweet spot: visually identical, massive size reduction

export async function compressImage(file: File): Promise<File> {
  // Skip compression for small files (< 500KB)
  if (file.size < 500 * 1024) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        resolve(file); // Fallback: return original if canvas fails
        return;
      }

      // Use high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // Only use compressed version if it's actually smaller
          if (blob.size >= file.size) {
            resolve(file);
            return;
          }

          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          console.log(
            `📸 Compressed: ${(file.size / 1024 / 1024).toFixed(1)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(1)}MB (${Math.round((1 - compressedFile.size / file.size) * 100)}% saved)`
          );

          resolve(compressedFile);
        },
        'image/jpeg',
        QUALITY
      );
    };

    img.onerror = () => resolve(file); // Fallback on error
    img.src = URL.createObjectURL(file);
  });
}
