// components/dashboard/Profile/BannerCropper.jsx - Banner-specific cropper wrapper
import React, { useState, useEffect } from 'react';
import BannerCropperDesktop from './BannerCropperDesktop';
import BannerCropperMobile from './BannerCropperMobile';

const BannerCropper = ({ file, onCropComplete, onCancel }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Detect if device is mobile/touch-enabled
  useEffect(() => {
    const detectMobile = () => {
      // Check for touch capability
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Check screen size (mobile typically < 768px)
      const isMobileSize = window.innerWidth < 768;

      // Check user agent for mobile devices
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      // Device is considered mobile if it has touch AND (small screen OR mobile user agent)
      const deviceIsMobile = hasTouch && (isMobileSize || isMobileUA);

      setIsMobile(deviceIsMobile);
    };

    // Initial detection
    detectMobile();

    // Listen for window resize to handle orientation changes
    const handleResize = () => {
      detectMobile();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Render appropriate cropper based on device type
  if (isMobile) {
    return (
      <BannerCropperMobile
        file={file}
        onCropComplete={onCropComplete}
        onCancel={onCancel}
      />
    );
  }

  return (
    <BannerCropperDesktop
      file={file}
      onCropComplete={onCropComplete}
      onCancel={onCancel}
    />
  );
};

export default BannerCropper;