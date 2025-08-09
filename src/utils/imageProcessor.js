// utils/imageProcessor.js

/**
 * Configuration for image processing
 */
const PROCESSING_CONFIG = {
  // Maximum dimensions (maintains aspect ratio)
  maxWidth: 1200,
  maxHeight: 1200,

  // Quality settings
  webpQuality: 0.85,
  jpegQuality: 0.8,

  // Target file size range (bytes)
  targetMinSize: 150 * 1024, // 150KB
  targetMaxSize: 300 * 1024, // 300KB

  // Quality adjustment step for optimization
  qualityStep: 0.05
};

/**
 * Creates a canvas element for image processing
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {Object} Canvas element and 2D context
 */
const createCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Enable better image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  return { canvas, ctx };
};

/**
 * Calculates new dimensions while maintaining aspect ratio
 * @param {number} originalWidth - Original image width
 * @param {number} originalHeight - Original image height
 * @param {number} maxWidth - Maximum allowed width
 * @param {number} maxHeight - Maximum allowed height
 * @returns {Object} New width and height
 */
const calculateNewDimensions = (originalWidth, originalHeight, maxWidth, maxHeight) => {
  let { width, height } = { width: originalWidth, height: originalHeight };

  // Only resize if image exceeds maximum dimensions
  if (width > maxWidth || height > maxHeight) {
    const aspectRatio = width / height;

    if (width > height) {
      width = maxWidth;
      height = Math.round(width / aspectRatio);
    } else {
      height = maxHeight;
      width = Math.round(height * aspectRatio);
    }
  }

  return { width, height };
};

/**
 * Loads an image file into an Image object
 * @param {File} file - Image file to load
 * @returns {Promise<HTMLImageElement>} Loaded image element
 */
const loadImage = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};

/**
 * Converts canvas to blob with specified format and quality
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} format - Output format ('webp' or 'jpeg')
 * @param {number} quality - Quality (0-1)
 * @returns {Promise<Blob>} Converted blob
 */
const canvasToBlob = (canvas, format, quality) => {
  return new Promise((resolve, reject) => {
    const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg';

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error(`Failed to convert to ${format}`));
        }
      },
      mimeType,
      quality
    );
  });
};

/**
 * Optimizes image quality to target file size
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} format - Output format ('webp' or 'jpeg')
 * @param {number} initialQuality - Starting quality
 * @returns {Promise<Blob>} Optimized blob
 */
const optimizeToTargetSize = async (canvas, format, initialQuality) => {
  let quality = initialQuality;
  let blob = await canvasToBlob(canvas, format, quality);

  // If file is already within target range, return it
  if (blob.size <= PROCESSING_CONFIG.targetMaxSize) {
    return blob;
  }

  // Reduce quality until we hit target size or minimum quality
  while (blob.size > PROCESSING_CONFIG.targetMaxSize && quality > 0.3) {
    quality -= PROCESSING_CONFIG.qualityStep;
    blob = await canvasToBlob(canvas, format, quality);
  }

  return blob;
};

/**
 * Processes an image file with resizing and compression
 * @param {File} file - Image file to process
 * @param {string} outputFormat - Output format ('webp' or 'jpeg')
 * @returns {Promise<Blob>} Processed image blob
 */
export const processImage = async (file, outputFormat = 'webp') => {
  try {
    // Load the image
    const img = await loadImage(file);

    // Calculate new dimensions
    const { width, height } = calculateNewDimensions(
      img.width,
      img.height,
      PROCESSING_CONFIG.maxWidth,
      PROCESSING_CONFIG.maxHeight
    );

    // Create canvas and draw resized image
    const { canvas, ctx } = createCanvas(width, height);
    ctx.drawImage(img, 0, 0, width, height);

    // Get initial quality setting
    const initialQuality = outputFormat === 'webp'
      ? PROCESSING_CONFIG.webpQuality
      : PROCESSING_CONFIG.jpegQuality;

    // Optimize to target file size
    const optimizedBlob = await optimizeToTargetSize(canvas, outputFormat, initialQuality);

    return optimizedBlob;

  } catch (error) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

/**
 * Gets metadata about the processed image
 * @param {File} originalFile - Original file
 * @param {Blob} processedBlob - Processed blob
 * @returns {Object} Processing metadata
 */
export const getProcessingMetadata = (originalFile, processedBlob) => {
  const compressionRatio = ((originalFile.size - processedBlob.size) / originalFile.size * 100).toFixed(1);

  return {
    originalSize: originalFile.size,
    processedSize: processedBlob.size,
    compressionRatio: `${compressionRatio}%`,
    originalFormat: originalFile.type,
    processedFormat: processedBlob.type
  };
};

/**
 * Batch process multiple images
 * @param {File[]} files - Array of image files
 * @param {string} outputFormat - Output format ('webp' or 'jpeg')
 * @returns {Promise<Blob[]>} Array of processed blobs
 */
export const processImages = async (files, outputFormat = 'webp') => {
  const processedBlobs = [];

  for (const file of files) {
    const processedBlob = await processImage(file, outputFormat);
    processedBlobs.push(processedBlob);
  }

  return processedBlobs;
};