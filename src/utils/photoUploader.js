// utils/photoUploader.js
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase.js';

/**
 * Configuration for photo uploads
 */
const UPLOAD_CONFIG = {
  // Storage paths
  projectPhotosPath: 'project-photos',
  assignmentPhotosPath: 'assignment-photos',

  // File naming
  timestampFormat: 'YYYYMMDD_HHmmss',

  // Upload metadata
  customMetadata: {
    uploadedBy: 'tabletop-tactica-app',
    version: '1.0'
  }
};

/**
 * Generates a unique filename for photo uploads
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @param {string} type - Photo type ('project' or 'assignment')
 * @param {string} fileExtension - File extension (e.g., 'webp', 'jpg')
 * @param {string} [assignmentId] - Assignment ID (for assignment photos)
 * @returns {string} Unique filename
 */
const generatePhotoFilename = (userId, projectId, type, fileExtension, assignmentId = null) => {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
  const randomId = Math.random().toString(36).substr(2, 9);

  if (type === 'assignment' && assignmentId) {
    return `${userId}_${projectId}_${assignmentId}_${timestamp}_${randomId}.${fileExtension}`;
  }

  return `${userId}_${projectId}_${timestamp}_${randomId}.${fileExtension}`;
};

/**
 * Gets the storage path for a photo type
 * @param {string} type - Photo type ('project' or 'assignment')
 * @returns {string} Storage path
 */
const getStoragePath = (type) => {
  return type === 'assignment'
    ? UPLOAD_CONFIG.assignmentPhotosPath
    : UPLOAD_CONFIG.projectPhotosPath;
};

/**
 * Upload result object
 * @typedef {Object} UploadResult
 * @property {boolean} success - Whether upload succeeded
 * @property {string|null} downloadURL - Download URL if successful
 * @property {string|null} storagePath - Storage path if successful
 * @property {string|null} error - Error message if failed
 * @property {Object|null} metadata - Upload metadata if successful
 */

/**
 * Uploads a photo blob to Firebase Storage
 * @param {Blob} blob - Processed photo blob
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @param {string} type - Photo type ('project' or 'assignment')
 * @param {string} [assignmentId] - Assignment ID (for assignment photos)
 * @returns {Promise<UploadResult>} Upload result
 */
export const uploadPhoto = async (blob, userId, projectId, type = 'project', assignmentId = null) => {
  try {
    // Validate inputs
    if (!blob || !userId || !projectId) {
      return {
        success: false,
        downloadURL: null,
        storagePath: null,
        error: 'Missing required parameters',
        metadata: null
      };
    }

    // Determine file extension from blob type
    const fileExtension = blob.type === 'image/webp' ? 'webp' : 'jpg';

    // Generate filename and storage path
    const filename = generatePhotoFilename(userId, projectId, type, fileExtension, assignmentId);
    const storagePath = `${getStoragePath(type)}/${filename}`;

    // Create storage reference
    const storageRef = ref(storage, storagePath);

    // Prepare metadata
    const metadata = {
      contentType: blob.type,
      customMetadata: {
        ...UPLOAD_CONFIG.customMetadata,
        userId,
        projectId,
        photoType: type,
        uploadTimestamp: new Date().toISOString(),
        ...(assignmentId && { assignmentId })
      }
    };

    // Upload the blob
    const snapshot = await uploadBytes(storageRef, blob, metadata);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      success: true,
      downloadURL,
      storagePath,
      error: null,
      metadata: {
        size: snapshot.metadata.size,
        contentType: snapshot.metadata.contentType,
        timeCreated: snapshot.metadata.timeCreated,
        fullPath: snapshot.metadata.fullPath
      }
    };

  } catch (error) {
    return {
      success: false,
      downloadURL: null,
      storagePath: null,
      error: error.message,
      metadata: null
    };
  }
};

/**
 * Uploads multiple photos
 * @param {Blob[]} blobs - Array of processed photo blobs
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @param {string} type - Photo type ('project' or 'assignment')
 * @param {string} [assignmentId] - Assignment ID (for assignment photos)
 * @returns {Promise<UploadResult[]>} Array of upload results
 */
export const uploadPhotos = async (blobs, userId, projectId, type = 'project', assignmentId = null) => {
  const results = [];

  for (const blob of blobs) {
    const result = await uploadPhoto(blob, userId, projectId, type, assignmentId);
    results.push(result);
  }

  return results;
};

/**
 * Deletes a photo from Firebase Storage
 * @param {string} storagePath - Storage path of the photo to delete
 * @returns {Promise<{success: boolean, error: string|null}>} Delete result
 */
export const deletePhoto = async (storagePath) => {
  try {
    if (!storagePath) {
      return {
        success: false,
        error: 'Storage path is required'
      };
    }

    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);

    return {
      success: true,
      error: null
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Deletes multiple photos from Firebase Storage
 * @param {string[]} storagePaths - Array of storage paths to delete
 * @returns {Promise<{success: boolean, error: string|null}[]>} Array of delete results
 */
export const deletePhotos = async (storagePaths) => {
  const results = [];

  for (const path of storagePaths) {
    const result = await deletePhoto(path);
    results.push(result);
  }

  return results;
};

/**
 * Extracts storage path from a Firebase download URL
 * @param {string} downloadURL - Firebase download URL
 * @returns {string|null} Storage path or null if invalid
 */
export const getStoragePathFromURL = (downloadURL) => {
  try {
    const url = new URL(downloadURL);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);

    if (pathMatch && pathMatch[1]) {
      return decodeURIComponent(pathMatch[1]);
    }

    return null;
  } catch (error) {
    return null;
  }
};