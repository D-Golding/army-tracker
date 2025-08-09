// utils/photoValidator.js

/**
 * Configuration for photo validation
 */
const VALIDATION_CONFIG = {
  // Maximum file size before processing (20MB to handle large camera photos)
  maxFileSize: 20 * 1024 * 1024,

  // Allowed MIME types
  allowedTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'image/bmp',
    'image/tiff',
    'image/tif'
  ],

  // Allowed file extensions (fallback if MIME type unavailable)
  allowedExtensions: [
    '.jpg', '.jpeg', '.png', '.webp',
    '.heic', '.heif', '.bmp', '.tiff', '.tif'
  ]
};

/**
 * Validation result object
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the file passes validation
 * @property {string|null} error - Error message if validation fails
 */

/**
 * Validates a file for photo upload
 * @param {File} file - The file to validate
 * @returns {ValidationResult} Validation result
 */
export const validatePhotoFile = (file) => {
  // Check if file exists
  if (!file) {
    return {
      isValid: false,
      error: 'No file provided'
    };
  }

  // Check file size
  if (file.size > VALIDATION_CONFIG.maxFileSize) {
    const maxSizeMB = VALIDATION_CONFIG.maxFileSize / (1024 * 1024);
    return {
      isValid: false,
      error: `File too large. Maximum size is ${maxSizeMB}MB`
    };
  }

  // Check file type by MIME type
  if (file.type && !VALIDATION_CONFIG.allowedTypes.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload a valid image file'
    };
  }

  // Fallback: Check by file extension if MIME type is unavailable
  if (!file.type) {
    const fileName = file.name.toLowerCase();
    const hasValidExtension = VALIDATION_CONFIG.allowedExtensions.some(ext =>
      fileName.endsWith(ext)
    );

    if (!hasValidExtension) {
      return {
        isValid: false,
        error: 'Invalid file extension. Please upload a valid image file'
      };
    }
  }

  // All validations passed
  return {
    isValid: true,
    error: null
  };
};

/**
 * Validates multiple photo files
 * @param {FileList|File[]} files - Array of files to validate
 * @returns {ValidationResult} Validation result for all files
 */
export const validatePhotoFiles = (files) => {
  if (!files || files.length === 0) {
    return {
      isValid: false,
      error: 'No files provided'
    };
  }

  // Convert FileList to Array if needed
  const fileArray = Array.from(files);

  // Validate each file
  for (let i = 0; i < fileArray.length; i++) {
    const result = validatePhotoFile(fileArray[i]);
    if (!result.isValid) {
      return {
        isValid: false,
        error: `File ${i + 1}: ${result.error}`
      };
    }
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Get human-readable file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};