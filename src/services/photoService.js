// services/photoService.js
import { isWebPSupported, getOptimalImageFormat } from '../utils/webpDetector.js';
import { validatePhotoFile, validatePhotoFiles } from '../utils/photoValidator.js';
import { processImage, processImages, getProcessingMetadata } from '../utils/imageProcessor.js';
import { uploadPhoto, uploadPhotos, deletePhoto, deletePhotos, getStoragePathFromURL } from '../utils/photoUploader.js';

/**
 * Complete photo processing and upload result
 * @typedef {Object} PhotoProcessingResult
 * @property {boolean} success - Whether the operation succeeded
 * @property {string|null} downloadURL - Download URL if successful
 * @property {string|null} storagePath - Storage path if successful
 * @property {string|null} error - Error message if failed
 * @property {Object|null} metadata - Processing and upload metadata
 */

/**
 * Processes and uploads a single photo
 * @param {File} file - Image file to process and upload
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @param {string} type - Photo type ('project' or 'assignment')
 * @param {string} [assignmentId] - Assignment ID (for assignment photos)
 * @returns {Promise<PhotoProcessingResult>} Processing and upload result
 */
export const processAndUploadPhoto = async (file, userId, projectId, type = 'project', assignmentId = null) => {
  try {
    // Step 1: Validate the file
    const validation = validatePhotoFile(file);
    if (!validation.isValid) {
      return {
        success: false,
        downloadURL: null,
        storagePath: null,
        error: validation.error,
        metadata: null
      };
    }

    // Step 2: Determine optimal output format
    const outputFormat = await getOptimalImageFormat();

    // Step 3: Process the image
    const processedBlob = await processImage(file, outputFormat);

    // Step 4: Upload to Firebase Storage
    const uploadResult = await uploadPhoto(processedBlob, userId, projectId, type, assignmentId);

    if (!uploadResult.success) {
      return {
        success: false,
        downloadURL: null,
        storagePath: null,
        error: uploadResult.error,
        metadata: null
      };
    }

    // Step 5: Generate metadata
    const processingMetadata = getProcessingMetadata(file, processedBlob);

    return {
      success: true,
      downloadURL: uploadResult.downloadURL,
      storagePath: uploadResult.storagePath,
      error: null,
      metadata: {
        processing: processingMetadata,
        upload: uploadResult.metadata,
        outputFormat
      }
    };

  } catch (error) {
    return {
      success: false,
      downloadURL: null,
      storagePath: null,
      error: `Photo processing failed: ${error.message}`,
      metadata: null
    };
  }
};

/**
 * Processes and uploads multiple photos
 * @param {File[]|FileList} files - Image files to process and upload
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @param {string} type - Photo type ('project' or 'assignment')
 * @param {string} [assignmentId] - Assignment ID (for assignment photos)
 * @returns {Promise<PhotoProcessingResult[]>} Array of processing and upload results
 */
export const processAndUploadPhotos = async (files, userId, projectId, type = 'project', assignmentId = null) => {
  // Convert FileList to Array if needed
  const fileArray = Array.from(files);

  // Validate all files first
  const validation = validatePhotoFiles(fileArray);
  if (!validation.isValid) {
    return [{
      success: false,
      downloadURL: null,
      storagePath: null,
      error: validation.error,
      metadata: null
    }];
  }

  // Process each file individually
  const results = [];
  for (const file of fileArray) {
    const result = await processAndUploadPhoto(file, userId, projectId, type, assignmentId);
    results.push(result);
  }

  return results;
};

/**
 * Deletes a photo by download URL
 * @param {string} downloadURL - Firebase download URL
 * @returns {Promise<{success: boolean, error: string|null}>} Delete result
 */
export const deletePhotoByURL = async (downloadURL) => {
  try {
    const storagePath = getStoragePathFromURL(downloadURL);

    if (!storagePath) {
      return {
        success: false,
        error: 'Invalid download URL'
      };
    }

    return await deletePhoto(storagePath);

  } catch (error) {
    return {
      success: false,
      error: `Delete failed: ${error.message}`
    };
  }
};

/**
 * Deletes multiple photos by download URLs
 * @param {string[]} downloadURLs - Array of Firebase download URLs
 * @returns {Promise<{success: boolean, error: string|null}[]>} Array of delete results
 */
export const deletePhotosByURLs = async (downloadURLs) => {
  const results = [];

  for (const url of downloadURLs) {
    const result = await deletePhotoByURL(url);
    results.push(result);
  }

  return results;
};

/**
 * Gets browser capabilities for photo handling
 * @returns {Promise<Object>} Browser capabilities
 */
export const getPhotoBrowserCapabilities = async () => {
  const webpSupported = await isWebPSupported();
  const optimalFormat = await getOptimalImageFormat();

  return {
    webpSupported,
    optimalFormat,
    fileApiSupported: !!(window.File && window.FileReader && window.FileList && window.Blob),
    canvasSupported: !!document.createElement('canvas').getContext,
    cameraSupported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  };
};

/**
 * Optimizes photos for different use cases
 * @param {File} file - Image file to optimize
 * @param {string} preset - Optimization preset ('thumbnail', 'display', 'full')
 * @returns {Promise<Blob>} Optimized blob
 */
export const optimizePhotoForPreset = async (file, preset = 'display') => {
  const presets = {
    thumbnail: { maxWidth: 150, maxHeight: 150, quality: 0.7 },
    display: { maxWidth: 800, maxHeight: 800, quality: 0.85 },
    full: { maxWidth: 1200, maxHeight: 1200, quality: 0.9 }
  };

  const config = presets[preset] || presets.display;
  const outputFormat = await getOptimalImageFormat();

  // This would require extending imageProcessor.js to accept custom dimensions
  // For now, use the standard processImage function
  return await processImage(file, outputFormat);
};

/**
 * Batch operation for cleaning up photos
 * @param {string[]} downloadURLs - URLs to delete
 * @param {Function} [progressCallback] - Progress callback function
 * @returns {Promise<{successful: number, failed: number, errors: string[]}>} Cleanup summary
 */
export const batchCleanupPhotos = async (downloadURLs, progressCallback = null) => {
  let successful = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < downloadURLs.length; i++) {
    const result = await deletePhotoByURL(downloadURLs[i]);

    if (result.success) {
      successful++;
    } else {
      failed++;
      errors.push(result.error);
    }

    // Call progress callback if provided
    if (progressCallback) {
      progressCallback({
        completed: i + 1,
        total: downloadURLs.length,
        successful,
        failed
      });
    }
  }

  return { successful, failed, errors };
};