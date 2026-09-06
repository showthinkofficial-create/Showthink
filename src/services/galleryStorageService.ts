import {
  getSupabaseClient,
  getSupabaseConfigError,
  isSupabaseConfigured,
  supabaseUrl,
  supabaseAnonKey
} from '../lib/supabase';
import { MediaType } from '../types/gallery';

export const BUCKET_NAME = 'gallery';

// Allowed MIME types & extensions
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm'
];

export const MAX_IMAGE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

export interface FileValidationResult {
  valid: boolean;
  mediaType: MediaType;
  error?: string;
}

/**
 * Sanitize filename to avoid path traversal and invalid characters in Supabase Storage.
 */
export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
}

/**
 * Validate image/video file before upload.
 */
export function validateGalleryFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, mediaType: 'IMAGE', error: 'No file selected.' };
  }

  const mimeType = (file.type || '').toLowerCase();
  const fileExt = (file.name.split('.').pop() || '').toLowerCase();

  const isImageMime = ALLOWED_IMAGE_MIME_TYPES.includes(mimeType);
  const isImageExt = ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt);

  const isVideoMime = ALLOWED_VIDEO_MIME_TYPES.includes(mimeType);
  const isVideoExt = ['mp4', 'webm'].includes(fileExt);

  if (isImageMime || isImageExt) {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return {
        valid: false,
        mediaType: 'IMAGE',
        error: `Image size exceeds the maximum limit of 25MB (File size: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`
      };
    }
    return { valid: true, mediaType: 'IMAGE' };
  }

  if (isVideoMime || isVideoExt) {
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      return {
        valid: false,
        mediaType: 'VIDEO',
        error: `Video size exceeds the maximum limit of 100MB (File size: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`
      };
    }
    return { valid: true, mediaType: 'VIDEO' };
  }

  return {
    valid: false,
    mediaType: 'IMAGE',
    error: `Unsupported file format. Allowed formats: Images (JPG, JPEG, PNG, WEBP) and Videos (MP4, WEBM).`
  };
}

/**
 * Extracts internal bucket relative path from full or partial path string.
 * E.g. "gallery/album1/media1/photo.jpg" -> "album1/media1/photo.jpg"
 */
export function getRelativeBucketPath(storagePath: string): string {
  if (!storagePath) return '';
  let clean = storagePath.trim();
  if (clean.startsWith('gallery/')) {
    clean = clean.substring('gallery/'.length);
  }
  return clean.replace(/^\/+/, '');
}

/**
 * Get public URL for an asset stored in Supabase Storage.
 */
export function getGalleryMediaUrl(storagePath: string): string {
  if (!storagePath) return '';
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath;
  }

  const relPath = getRelativeBucketPath(storagePath);
  if (!isSupabaseConfigured()) {
    return '';
  }

  try {
    const supabase = getSupabaseClient();
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(relPath);
    return data.publicUrl;
  } catch {
    // Fallback URL construct if client initialization fails
    return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${relPath}`;
  }
}

/**
 * Upload file to Supabase Storage with real-time percentage progress updates.
 */
export async function uploadFileToSupabaseStorage(
  filePathInBucket: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ publicUrl: string; storagePath: string }> {
  const configErr = getSupabaseConfigError();
  if (configErr) {
    throw new Error(configErr);
  }

  const relPath = getRelativeBucketPath(filePathInBucket);
  const fullStoragePath = `gallery/${relPath}`;

  // Try XHR upload for real-time progress monitoring
  return new Promise((resolve, reject) => {
    try {
      const uploadEndpoint = `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${relPath}`;
      const xhr = new XMLHttpRequest();

      xhr.open('POST', uploadEndpoint, true);
      xhr.setRequestHeader('Authorization', `Bearer ${supabaseAnonKey}`);
      xhr.setRequestHeader('apiKey', supabaseAnonKey);
      xhr.setRequestHeader('x-upsert', 'true');
      if (file.type) {
        xhr.setRequestHeader('Content-Type', file.type);
      }

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && event.total > 0) {
            const percent = Math.min(Math.round((event.loaded / event.total) * 100), 99);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (onProgress) onProgress(100);
          const publicUrl = getGalleryMediaUrl(fullStoragePath);
          resolve({ publicUrl, storagePath: fullStoragePath });
        } else {
          let msg = `Supabase Storage upload failed (Status ${xhr.status})`;
          try {
            const responseJson = JSON.parse(xhr.responseText);
            if (responseJson.message || responseJson.error) {
              msg = responseJson.message || responseJson.error;
            }
          } catch {
            // Keep default status message
          }
          reject(new Error(`Storage error: ${msg}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network connection error while uploading to Supabase Storage.'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Upload timed out. Please check your internet connection and try again.'));
      };

      xhr.send(file);
    } catch (xhrError) {
      // Fallback to Supabase JS Client SDK
      const supabase = getSupabaseClient();
      supabase.storage
        .from(BUCKET_NAME)
        .upload(relPath, file, { upsert: true, cacheControl: '3600' })
        .then(({ data, error }) => {
          if (error) {
            reject(new Error(`Supabase Storage upload failed: ${error.message}`));
          } else {
            if (onProgress) onProgress(100);
            const publicUrl = getGalleryMediaUrl(fullStoragePath);
            resolve({ publicUrl, storagePath: fullStoragePath });
          }
        })
        .catch((err) => {
          reject(new Error(`Supabase Storage upload exception: ${err.message}`));
        });
    }
  });
}

/**
 * Upload Gallery Image to Supabase Storage under gallery/{albumId}/{mediaId}/{fileName}
 */
export async function uploadGalleryImage(
  albumId: string,
  mediaId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ publicUrl: string; storagePath: string }> {
  const validation = validateGalleryFile(file);
  if (!validation.valid || validation.mediaType !== 'IMAGE') {
    throw new Error(validation.error || 'Selected file is not a valid image.');
  }

  const safeName = sanitizeFileName(file.name);
  const relPath = `${albumId}/${mediaId}/${safeName}`;
  return uploadFileToSupabaseStorage(relPath, file, onProgress);
}

/**
 * Upload Gallery Video to Supabase Storage under gallery/{albumId}/{mediaId}/{fileName}
 */
export async function uploadGalleryVideo(
  albumId: string,
  mediaId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ publicUrl: string; storagePath: string }> {
  const validation = validateGalleryFile(file);
  if (!validation.valid || validation.mediaType !== 'VIDEO') {
    throw new Error(validation.error || 'Selected file is not a valid video.');
  }

  const safeName = sanitizeFileName(file.name);
  const relPath = `${albumId}/${mediaId}/${safeName}`;
  return uploadFileToSupabaseStorage(relPath, file, onProgress);
}

/**
 * Upload Gallery Album Cover Image to Supabase Storage under gallery/{albumId}/cover_{timestamp}.{ext}
 */
export async function uploadGalleryCoverImage(
  albumId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ publicUrl: string; storagePath: string }> {
  const validation = validateGalleryFile(file);
  if (!validation.valid || validation.mediaType !== 'IMAGE') {
    throw new Error(validation.error || 'Album cover must be a valid image file.');
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const relPath = `${albumId}/covers/cover_${Date.now()}.${ext.toLowerCase()}`;
  return uploadFileToSupabaseStorage(relPath, file, onProgress);
}

/**
 * Delete a media object from Supabase Storage.
 */
export async function deleteGalleryMedia(storagePath: string): Promise<void> {
  if (!storagePath) return;

  const relPath = getRelativeBucketPath(storagePath);
  if (!relPath) return;

  const configErr = getSupabaseConfigError();
  if (configErr) {
    throw new Error(configErr);
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([relPath]);

  if (error) {
    console.error(`Failed to delete Supabase Storage asset at ${relPath}:`, error);
    throw new Error(`Unable to delete the media file from storage. Please try again.`);
  }
}

export const galleryStorageService = {
  validateGalleryFile,
  getGalleryMediaUrl,
  uploadGalleryImage,
  uploadGalleryVideo,
  uploadGalleryCoverImage,
  deleteGalleryMedia,
  getRelativeBucketPath
};
