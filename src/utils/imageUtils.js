/**
 * Image Utilities for ResolveHub
 */

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Validates file type and size.
 * @param {File} file 
 * @returns {string|null} Error message, or null if valid
 */
export const validateImage = (file) => {
  if (!file) return 'No file selected.';
  
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Invalid format. Allowed formats: JPG, JPEG, PNG, WEBP.';
  }
  
  if (file.size > MAX_IMAGE_SIZE) {
    return 'File too large. Maximum size allowed is 5MB.';
  }
  
  return null;
};

/**
 * Compresses an image client-side using HTML Canvas.
 * Resizes the image so that the maximum dimension (width or height) is 800px.
 * Encodes as JPEG with quality 0.6.
 * @param {File} file The raw file upload
 * @param {number} maxDimension Max width/height
 * @param {number} quality Compression quality (0.0 to 1.0)
 * @returns {Promise<string>} Base64 Data URL
 */
export const compressImage = (file, maxDimension = 800, quality = 0.6) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions preserving aspect ratio
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context.'));
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 Data URL (using image/jpeg format to ensure maximum compression)
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      
      img.onerror = (error) => {
        reject(error);
      };
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
  });
};
