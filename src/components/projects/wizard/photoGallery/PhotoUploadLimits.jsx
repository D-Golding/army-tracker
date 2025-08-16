// components/shared/wizard/photoGallery/PhotoUploadLimits.jsx - Remove count displays
import React from 'react';
import { useSubscription } from '../../../../hooks/useSubscription.js';

const PhotoUploadLimits = ({
  selectedCount,
  maxPhotos,
  projectData
}) => {
  // Don't display any limits information
  return null;
};

export default PhotoUploadLimits;