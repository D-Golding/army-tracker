// components/projects/ProjectPhotoCropper.jsx - Updated with skip functionality
import React, { useState, useEffect } from 'react';
import ProjectPhotoCropperDesktop from './ProjectPhotoCropperDesktop';
import ProjectPhotoCropperMobile from './ProjectPhotoCropperMobile';

const ProjectPhotoCropper = ({
  file,
  onCropComplete,
  onCancel,
  onCropSkip = null,
  showSkipOption = false
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isReady, setIsReady] = useState(false);

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

      console.log('📱 Mobile detection:', {
        hasTouch,
        isMobileSize,
        isMobileUA,
        deviceIsMobile,
        screenWidth: window.innerWidth
      });

      setIsMobile(deviceIsMobile);
      setIsReady(true);
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

  // Don't render until we've determined mobile/desktop
  if (!isReady || !file) {
    return null;
  }

  console.log('🖼️ Rendering cropper:', isMobile ? 'Mobile' : 'Desktop');

  // Render appropriate cropper based on device type
  if (isMobile) {
    return (
      <ProjectPhotoCropperMobile
        file={file}
        onCropComplete={onCropComplete}
        onCancel={onCancel}
        onCropSkip={onCropSkip}
        showSkipOption={showSkipOption}
      />
    );
  }

  return (
    <ProjectPhotoCropperDesktop
      file={file}
      onCropComplete={onCropComplete}
      onCancel={onCancel}
      onCropSkip={onCropSkip}
      showSkipOption={showSkipOption}
    />
  );
};

export default ProjectPhotoCropper;