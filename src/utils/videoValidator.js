// src/utils/videoValidator.js - Video file validation

/**
 * Configuration for video validation
 */
const VIDEO_VALIDATION_CONFIG = {
  // Maximum file size (500MB for raw videos)
  maxFileSize: 500 * 1024 * 1024,

  // Maximum duration in seconds (5 minutes)
  maxDuration: 300,

  // Allowed MIME types
  allowedTypes: [
    'video/mp4',
    'video/quicktime', // .mov
    'video/avi',
    'video/webm',
    'video/mkv',
    'video/x-msvideo', // .avi alternative
    'video/3gpp', // .3gp
    'video/x-ms-wmv' // .wmv
  ],

  // Allowed file extensions (fallback)
  allowedExtensions: [
    '.mp4', '.mov', '.avi', '.webm', '.mkv', '.3gp', '.wmv', '.m4v'
  ]
};

/**
 * Validation result object
 * @typedef {Object} VideoValidationResult
 * @property {boolean} isValid - Whether the file passes validation
 * @property {string|null} error - Error message if validation fails
 * @property {Object|null} metadata - Video metadata if validation passes
 */

/**
 * Get video duration from file
 * @param {File} file - Video file
 * @returns {Promise<number>} Duration in seconds
 */
const getVideoDuration = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load video metadata'));
    };

    video.src = url;
  });
};

/**
 * Validates a video file
 * @param {File} file - The video file to validate
 * @returns {Promise<VideoValidationResult>} Validation result
 */
export const validateVideoFile = async (file) => {
  try {
    // Check if file exists
    if (!file) {
      return {
        isValid: false,
        error: 'No file provided',
        metadata: null
      };
    }

    // Check file size
    if (file.size > VIDEO_VALIDATION_CONFIG.maxFileSize) {
      const maxSizeMB = VIDEO_VALIDATION_CONFIG.maxFileSize / (1024 * 1024);
      return {
        isValid: false,
        error: `File too large. Maximum size is ${maxSizeMB}MB`,
        metadata: null
      };
    }

    // Check file type by MIME type
    if (file.type && !VIDEO_VALIDATION_CONFIG.allowedTypes.includes(file.type.toLowerCase())) {
      return {
        isValid: false,
        error: 'Invalid file type. Please upload a valid video file (MP4, MOV, AVI, WebM)',
        metadata: null
      };
    }

    // Fallback: Check by file extension if MIME type is unavailable
    if (!file.type) {
      const fileName = file.name.toLowerCase();
      const hasValidExtension = VIDEO_VALIDATION_CONFIG.allowedExtensions.some(ext =>
        fileName.endsWith(ext)
      );

      if (!hasValidExtension) {
        return {
          isValid: false,
          error: 'Invalid file extension. Please upload a valid video file',
          metadata: null
        };
      }
    }

    // Check video duration
    try {
      const duration = await getVideoDuration(file);

      if (duration > VIDEO_VALIDATION_CONFIG.maxDuration) {
        const maxMinutes = VIDEO_VALIDATION_CONFIG.maxDuration / 60;
        return {
          isValid: false,
          error: `Video too long. Maximum duration is ${maxMinutes} minutes`,
          metadata: null
        };
      }

      // All validations passed
      return {
        isValid: true,
        error: null,
        metadata: {
          duration,
          size: file.size,
          type: file.type,
          name: file.name
        }
      };

    } catch (durationError) {
      return {
        isValid: false,
        error: 'Could not read video file. Please ensure it\'s a valid video format',
        metadata: null
      };
    }

  } catch (error) {
    return {
      isValid: false,
      error: `Validation failed: ${error.message}`,
      metadata: null
    };
  }
};

/**
 * Validates multiple video files
 * @param {FileList|File[]} files - Array of video files to validate
 * @returns {Promise<VideoValidationResult>} Validation result for all files
 */
export const validateVideoFiles = async (files) => {
  if (!files || files.length === 0) {
    return {
      isValid: false,
      error: 'No files provided',
      metadata: null
    };
  }

  // Convert FileList to Array if needed
  const fileArray = Array.from(files);

  // Validate each file
  for (let i = 0; i < fileArray.length; i++) {
    const result = await validateVideoFile(fileArray[i]);
    if (!result.isValid) {
      return {
        isValid: false,
        error: `Video ${i + 1}: ${result.error}`,
        metadata: null
      };
    }
  }

  return {
    isValid: true,
    error: null,
    metadata: {
      count: fileArray.length,
      totalSize: fileArray.reduce((sum, file) => sum + file.size, 0)
    }
  };
};

/**
 * Check if file is a video based on MIME type or extension
 * @param {File} file - File to check
 * @returns {boolean} True if file appears to be a video
 */
export const isVideoFile = (file) => {
  if (!file) return false;

  // Check MIME type first
  if (file.type) {
    return file.type.startsWith('video/');
  }

  // Fallback to extension check
  const fileName = file.name.toLowerCase();
  return VIDEO_VALIDATION_CONFIG.allowedExtensions.some(ext =>
    fileName.endsWith(ext)
  );
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

/**
 * Format duration from seconds to MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};