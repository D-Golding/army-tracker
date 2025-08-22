// src/utils/aspectRatioConfig.js - Instagram-inspired aspect ratio system

/**
 * Instagram-style aspect ratio configuration
 * Limits aspect ratios to prevent extremely tall or wide images in the feed
 */
export const ASPECT_RATIO_CONFIG = {
  // Aspect ratio limits (Instagram uses 4:5 to 16:9)
  MIN_ASPECT_RATIO: 4/5,    // 0.8 - Portrait limit (4:5)
  MAX_ASPECT_RATIO: 16/9,   // 1.78 - Landscape limit (16:9)

  // Standard presets for cropping
  PRESETS: {
    PORTRAIT: {
      ratio: 4/5,
      label: 'Portrait',
      description: 'Tall format, great for single subjects',
      outputWidth: 800,
      outputHeight: 1000
    },
    SQUARE: {
      ratio: 1/1,
      label: 'Square',
      description: 'Classic Instagram format',
      outputWidth: 800,
      outputHeight: 800
    },
    LANDSCAPE: {
      ratio: 16/9,
      label: 'Landscape',
      description: 'Wide format, great for scenes',
      outputWidth: 800,
      outputHeight: 450
    }
  },

  // Default crop suggestions based on original aspect ratio
  AUTO_CROP_STRATEGY: {
    // If image is too tall (< 4:5), suggest portrait crop
    TOO_TALL_THRESHOLD: 0.6,
    TOO_TALL_SUGGESTION: 4/5,

    // If image is too wide (> 16:9), suggest landscape crop
    TOO_WIDE_THRESHOLD: 2.5,
    TOO_WIDE_SUGGESTION: 16/9,

    // For images slightly outside range, suggest closest valid ratio
    CLOSE_TOLERANCE: 0.1
  }
};

/**
 * Analyzes an image's aspect ratio and determines if it needs cropping
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Object} Analysis result
 */
export const analyzeAspectRatio = (width, height) => {
  const aspectRatio = width / height;
  const { MIN_ASPECT_RATIO, MAX_ASPECT_RATIO, AUTO_CROP_STRATEGY } = ASPECT_RATIO_CONFIG;

  const analysis = {
    aspectRatio,
    isValid: aspectRatio >= MIN_ASPECT_RATIO && aspectRatio <= MAX_ASPECT_RATIO,
    needsCropping: false,
    suggestedRatio: null,
    suggestedPreset: null,
    reason: null
  };

  // If already valid, no changes needed
  if (analysis.isValid) {
    analysis.reason = 'Aspect ratio is within acceptable range';
    return analysis;
  }

  analysis.needsCropping = true;

  // Image is too tall (portrait)
  if (aspectRatio < MIN_ASPECT_RATIO) {
    if (aspectRatio < AUTO_CROP_STRATEGY.TOO_TALL_THRESHOLD) {
      // Very tall - suggest portrait crop
      analysis.suggestedRatio = AUTO_CROP_STRATEGY.TOO_TALL_SUGGESTION;
      analysis.suggestedPreset = 'PORTRAIT';
      analysis.reason = 'Image is very tall, suggesting portrait crop';
    } else {
      // Slightly tall - suggest minimum valid ratio
      analysis.suggestedRatio = MIN_ASPECT_RATIO;
      analysis.suggestedPreset = 'PORTRAIT';
      analysis.reason = 'Image is slightly too tall, suggesting portrait crop';
    }
  }

  // Image is too wide (landscape)
  else if (aspectRatio > MAX_ASPECT_RATIO) {
    if (aspectRatio > AUTO_CROP_STRATEGY.TOO_WIDE_THRESHOLD) {
      // Very wide - suggest landscape crop
      analysis.suggestedRatio = AUTO_CROP_STRATEGY.TOO_WIDE_SUGGESTION;
      analysis.suggestedPreset = 'LANDSCAPE';
      analysis.reason = 'Image is very wide, suggesting landscape crop';
    } else {
      // Slightly wide - suggest maximum valid ratio
      analysis.suggestedRatio = MAX_ASPECT_RATIO;
      analysis.suggestedPreset = 'LANDSCAPE';
      analysis.reason = 'Image is slightly too wide, suggesting landscape crop';
    }
  }

  return analysis;
};

/**
 * Calculates the optimal crop area for a suggested aspect ratio
 * @param {number} imageWidth - Original image width
 * @param {number} imageHeight - Original image height
 * @param {number} targetRatio - Target aspect ratio
 * @param {string} strategy - Cropping strategy ('center', 'top', 'bottom')
 * @returns {Object} Crop area coordinates
 */
export const calculateOptimalCrop = (imageWidth, imageHeight, targetRatio, strategy = 'center') => {
  const originalRatio = imageWidth / imageHeight;

  let cropWidth, cropHeight, cropX, cropY;

  if (originalRatio > targetRatio) {
    // Image is wider than target - crop sides
    cropHeight = imageHeight;
    cropWidth = imageHeight * targetRatio;
    cropY = 0;

    switch (strategy) {
      case 'left':
        cropX = 0;
        break;
      case 'right':
        cropX = imageWidth - cropWidth;
        break;
      default: // center
        cropX = (imageWidth - cropWidth) / 2;
    }
  } else {
    // Image is taller than target - crop top/bottom
    cropWidth = imageWidth;
    cropHeight = imageWidth / targetRatio;
    cropX = 0;

    switch (strategy) {
      case 'top':
        cropY = 0;
        break;
      case 'bottom':
        cropY = imageHeight - cropHeight;
        break;
      default: // center
        cropY = (imageHeight - cropHeight) / 2;
    }
  }

  return {
    x: Math.round(cropX),
    y: Math.round(cropY),
    width: Math.round(cropWidth),
    height: Math.round(cropHeight)
  };
};

/**
 * Gets the closest valid aspect ratio to a given ratio
 * @param {number} aspectRatio - Input aspect ratio
 * @returns {number} Closest valid aspect ratio
 */
export const getClosestValidRatio = (aspectRatio) => {
  const { MIN_ASPECT_RATIO, MAX_ASPECT_RATIO } = ASPECT_RATIO_CONFIG;

  if (aspectRatio < MIN_ASPECT_RATIO) {
    return MIN_ASPECT_RATIO;
  }

  if (aspectRatio > MAX_ASPECT_RATIO) {
    return MAX_ASPECT_RATIO;
  }

  return aspectRatio;
};

/**
 * Determines if an aspect ratio is close enough to be acceptable
 * @param {number} aspectRatio - Aspect ratio to check
 * @returns {boolean} Whether ratio is acceptable
 */
export const isAspectRatioAcceptable = (aspectRatio) => {
  const { MIN_ASPECT_RATIO, MAX_ASPECT_RATIO } = ASPECT_RATIO_CONFIG;
  return aspectRatio >= MIN_ASPECT_RATIO && aspectRatio <= MAX_ASPECT_RATIO;
};

/**
 * Gets display information for aspect ratio
 * @param {number} aspectRatio - Aspect ratio
 * @returns {Object} Display information
 */
export const getAspectRatioDisplayInfo = (aspectRatio) => {
  const { PRESETS } = ASPECT_RATIO_CONFIG;

  // Check if it matches a preset closely
  for (const [key, preset] of Object.entries(PRESETS)) {
    if (Math.abs(aspectRatio - preset.ratio) < 0.05) {
      return {
        label: preset.label,
        description: preset.description,
        isStandard: true
      };
    }
  }

  // Determine if it's portrait, square, or landscape
  if (aspectRatio < 0.95) {
    return {
      label: 'Custom Portrait',
      description: 'Custom tall format',
      isStandard: false
    };
  } else if (aspectRatio > 1.05) {
    return {
      label: 'Custom Landscape',
      description: 'Custom wide format',
      isStandard: false
    };
  } else {
    return {
      label: 'Custom Square',
      description: 'Nearly square format',
      isStandard: false
    };
  }
};