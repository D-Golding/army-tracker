// components/shared/BannerBackground.jsx - Uses pre-calculated brightness with version checking
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const BannerBackground = ({ imageUrl, brightness, className = '' }) => {
  const { userProfile } = useAuth();
  const [overlayOpacity, setOverlayOpacity] = useState(0.35); // New lighter default
  const [imageLoaded, setImageLoaded] = useState(false);

  // Current brightness algorithm version
  const CURRENT_BRIGHTNESS_VERSION = 2;

  // Analyze image brightness and calculate optimal overlay
  const analyzeImageBrightness = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        try {
          // Use smaller canvas for performance (sample the image)
          const sampleSize = 100;
          canvas.width = sampleSize;
          canvas.height = sampleSize;

          // Draw image scaled down for analysis
          ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

          // Get image data from the top portion where text appears (top 40%)
          const textAreaHeight = Math.floor(sampleSize * 0.4);
          const imageData = ctx.getImageData(0, 0, sampleSize, textAreaHeight);
          const data = imageData.data;

          let totalBrightness = 0;
          let pixelCount = 0;

          // Calculate average brightness using luminance formula
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Use luminance formula for perceived brightness
            const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
            totalBrightness += brightness;
            pixelCount++;
          }

          const avgBrightness = totalBrightness / pixelCount;
          const normalizedBrightness = avgBrightness / 255; // 0-1 scale

          resolve(normalizedBrightness);
        } catch (error) {
          // If canvas analysis fails (CORS), try a fallback method
          console.warn('Canvas analysis failed, using fallback brightness detection:', error);

          // Fallback: analyze URL or use default based on image characteristics
          // For now, use a moderate default
          resolve(0.5); // Medium brightness
        }
      };

      img.onerror = (error) => {
        console.warn('Image load failed, using default brightness:', error);
        // Use moderate brightness as fallback
        resolve(0.4); // Slightly darker default
      };

      // Try without CORS first
      img.src = url;

      // If that fails, the onerror will catch it and use fallback
    });
  };

  // Calculate optimal overlay opacity based on brightness (NEW LIGHTER ALGORITHM)
  const calculateOverlayOpacity = (brightness) => {
    // brightness: 0 = very dark, 1 = very bright
    // New lighter overlays (reduced by 10%)

    if (brightness < 0.2) {
      // Very dark image - minimal overlay (10-20%)
      return 0.1 + (brightness * 0.5);
    } else if (brightness < 0.5) {
      // Dark to medium - light overlay (20-35%)
      return 0.2 + ((brightness - 0.2) * 0.5);
    } else if (brightness < 0.8) {
      // Medium to bright - moderate overlay (35-50%)
      return 0.35 + ((brightness - 0.5) * 0.5);
    } else {
      // Very bright image - strong overlay (50-60%)
      return 0.5 + ((brightness - 0.8) * 0.5);
    }
  };

  // Use stored brightness data with version checking
  useEffect(() => {
    if (!imageUrl) {
      setOverlayOpacity(0.35); // New lighter default for gradient background
      setImageLoaded(false);
      return;
    }

    // Check if we have current version brightness data
    const storedVersion = userProfile?.headerPhotoBrightnessVersion;
    const hasCurrentVersion = storedVersion === CURRENT_BRIGHTNESS_VERSION;

    // Use stored brightness if available and current version
    if (brightness !== undefined && brightness !== null && hasCurrentVersion) {
      const optimalOpacity = calculateOverlayOpacity(brightness);
      setOverlayOpacity(optimalOpacity);

      console.log(`🎨 Using stored brightness: ${(brightness * 100).toFixed(1)}%, overlay: ${(optimalOpacity * 100).toFixed(1)}%`);
    } else {
      // Use new lighter default for old versions or missing data
      setOverlayOpacity(0.35);
      console.log('🎨 No current brightness data or old version, using lighter default overlay: 35%');
    }

    setImageLoaded(true);
  }, [imageUrl, brightness, userProfile?.headerPhotoBrightnessVersion]);

  if (!imageUrl) {
    // No banner image - show gradient background
    return (
      <div className={`absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 ${className}`} />
    );
  }

  return (
    <div className={`absolute inset-0 ${className}`}>
      {/* Banner Image */}
      <img
        src={imageUrl}
        alt="Header banner"
        className="w-full h-full object-cover"
        style={{
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />

      {/* Auto-adjusting Overlay */}
      <div
        className="absolute inset-0 bg-black transition-all duration-500"
        style={{
          opacity: overlayOpacity
        }}
      />

      {/* Loading state - show gradient while analyzing */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />
      )}
    </div>
  );
};

export default BannerBackground;