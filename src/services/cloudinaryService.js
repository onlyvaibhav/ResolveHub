/**
 * Cloudinary Integration Service for ResolveHub
 * Supports client-side unsigned uploads using upload presets.
 */

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Checks if Cloudinary is fully configured in the environment.
 * @returns {boolean}
 */
export const isCloudinaryConfigured = () => {
  return Boolean(cloudName && uploadPreset);
};

/**
 * Uploads a file to Cloudinary with upload progress tracking.
 * @param {File} file The file to upload
 * @param {Function} onProgress Progress callback receiving (percentageComplete)
 * @returns {Promise<string>} Resolves to the uploaded image secure URL
 */
export const uploadImage = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      reject(new Error('Cloudinary is not configured. Falling back to local/Base64.'));
      return;
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    xhr.open('POST', url, true);

    // Track upload progress
    if (xhr.upload && onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      });
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.secure_url);
          } catch (err) {
            reject(new Error('Failed to parse Cloudinary response.'));
          }
        } else {
          try {
            const response = JSON.parse(xhr.responseText);
            reject(new Error(response.error?.message || 'Failed to upload to Cloudinary.'));
          } catch (err) {
            reject(new Error(`Cloudinary upload failed with status ${xhr.status}`));
          }
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during Cloudinary upload.'));
    };

    xhr.send(formData);
  });
};

/**
 * Delete image from Cloudinary.
 * Note: Unsigned client-side deletions are typically restricted by Cloudinary for security
 * to prevent users from deleting each others' files. This is a placeholder/noop stub as specified.
 * @param {string} imageUrl The URL of the image to delete
 * @returns {Promise<boolean>}
 */
export const deleteImage = async (imageUrl) => {
  console.log('[Cloudinary] Delete request received for:', imageUrl);
  // Client-side delete is a stub for security reasons since it requires api_secret
  return true;
};
