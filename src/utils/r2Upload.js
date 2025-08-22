// src/utils/r2Upload.js - Fixed R2 upload functionality with proper public URLs
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// R2 Configuration
const R2_CONFIG = {
  region: 'auto',
  endpoint: `https://${import.meta.env.VITE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
  },
};

// Public URLs for each bucket (from bucket settings)
const PUBLIC_URLS = {
  'newsfeed-photos': 'https://pub-e3f586246dae4afdb0bc5d356c5805b8.r2.dev',
  'newsfeed-videos': 'https://pub-6bd21361b3624e20b861459fc615d9b7.r2.dev'
};

const r2Client = new S3Client(R2_CONFIG);

/**
 * Convert File/Blob to ArrayBuffer for AWS SDK compatibility
 * @param {File|Blob} file - File or Blob to convert
 * @returns {Promise<ArrayBuffer>} ArrayBuffer representation
 */
const fileToArrayBuffer = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Test R2 connection
 */
export const testR2Connection = async () => {
  try {
    const testData = new TextEncoder().encode('R2 connection test');

    const testCommand = new PutObjectCommand({
      Bucket: 'newsfeed-photos',
      Key: 'test-connection.txt',
      Body: testData,
      ContentType: 'text/plain'
    });

    await r2Client.send(testCommand);
    console.log('✅ R2 connection successful');
    return true;
  } catch (error) {
    console.error('❌ R2 connection failed:', error);
    return false;
  }
};

/**
 * Upload photo to R2 with proper file handling
 */
export const uploadPhotoToR2 = async (file, fileName) => {
  try {
    console.log('📤 Starting photo upload:', fileName);
    console.log('📁 File type:', file.type);
    console.log('📁 File size:', file.size);

    // Convert File/Blob to ArrayBuffer for AWS SDK compatibility
    const arrayBuffer = await fileToArrayBuffer(file);

    const command = new PutObjectCommand({
      Bucket: 'newsfeed-photos',
      Key: fileName,
      Body: new Uint8Array(arrayBuffer), // AWS SDK works best with Uint8Array
      ContentType: file.type || 'image/jpeg',
      // Optional: Add metadata
      Metadata: {
        'uploaded-at': new Date().toISOString(),
        'original-name': file.name || 'processed-image',
        'file-size': file.size.toString()
      }
    });

    console.log('🚀 Sending upload command...');
    const result = await r2Client.send(command);

    // Use the correct public URL for photos
    const publicUrl = `${PUBLIC_URLS['newsfeed-photos']}/${fileName}`;

    console.log('✅ Photo uploaded successfully:', fileName);
    console.log('🔗 Public URL:', publicUrl);
    return {
      success: true,
      url: publicUrl,
      fileName: fileName,
      result
    };
  } catch (error) {
    console.error('❌ Photo upload failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload video to R2 with proper file handling
 */
export const uploadVideoToR2 = async (file, fileName) => {
  try {
    console.log('📤 Starting video upload:', fileName);
    console.log('📁 File type:', file.type);
    console.log('📁 File size:', file.size);

    // Convert File/Blob to ArrayBuffer for AWS SDK compatibility
    const arrayBuffer = await fileToArrayBuffer(file);

    const command = new PutObjectCommand({
      Bucket: 'newsfeed-videos', // ✅ Fixed: Use correct bucket for videos
      Key: fileName,
      Body: new Uint8Array(arrayBuffer), // AWS SDK works best with Uint8Array
      ContentType: file.type || 'video/mp4',
      // Optional: Add metadata
      Metadata: {
        'uploaded-at': new Date().toISOString(),
        'original-name': file.name || 'processed-video',
        'file-size': file.size.toString(),
        'file-type': 'video'
      }
    });

    console.log('🚀 Sending upload command...');
    const result = await r2Client.send(command);

    // Use the correct public URL for videos
    const publicUrl = `${PUBLIC_URLS['newsfeed-videos']}/${fileName}`;

    console.log('✅ Video uploaded successfully:', fileName);
    console.log('🔗 Public URL:', publicUrl);
    return {
      success: true,
      url: publicUrl,
      fileName: fileName,
      result
    };
  } catch (error) {
    console.error('❌ Video upload failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate a unique filename for uploads
 */
export const generateUniqueFileName = (originalFile) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalFile.name.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
};

/**
 * Validate file before upload
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSizeInMB = 10,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  } = options;

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeInMB}MB limit`
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  return { isValid: true };
};

/**
 * Validate video file before upload
 */
export const validateVideo = (file, options = {}) => {
  const {
    maxSizeInMB = 100, // Larger limit for videos
    allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
  } = options;

  return validateFile(file, { maxSizeInMB, allowedTypes });
};