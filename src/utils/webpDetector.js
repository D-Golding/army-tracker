// utils/webpDetector.js

/**
 * Detects if the browser supports WebP format
 * Uses a small test image to determine support
 * @returns {Promise<boolean>} True if WebP is supported
 */
export const detectWebPSupport = () => {
  return new Promise((resolve) => {
    const webP = new Image();

    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };

    // Minimal WebP image (2x2 pixels, transparent)
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==';
  });
};

/**
 * Cached WebP support detection
 * Only runs the test once per session
 */
let webpSupportCache = null;

export const isWebPSupported = async () => {
  if (webpSupportCache === null) {
    webpSupportCache = await detectWebPSupport();
  }
  return webpSupportCache;
};

/**
 * Get the optimal image format for the current browser
 * @returns {Promise<string>} 'webp' or 'jpeg'
 */
export const getOptimalImageFormat = async () => {
  const supportsWebP = await isWebPSupported();
  return supportsWebP ? 'webp' : 'jpeg';
};