// components/projects/wizard/project/photoUploader/index.js
// Main step components
export { default as ProjectPhotoSelectStep } from './ProjectPhotoSelectStep';
export { ProjectPhotoCropStep } from './cropStep';
export { ProjectPhotoDetailsStep } from './detailsStep';

// Select step components
export { default as PhotoUsageStats } from './PhotoUsageStats';
export { default as PhotoCard } from './PhotoCard';
export { default as EmptyPhotoState } from './EmptyPhotoState';
export { default as PhotoDropZone } from './PhotoDropZone';
export { default as PhotoGrid } from './PhotoGrid';

// Crop step components (re-exported for convenience)
export {
  CropProgress,
  PhotoNavigation,
  PhotoPreview,
  CropInterface,
  AspectRatioSelector,
  CropSizeControls,
  CropActions
} from './cropStep';

// Details step components (re-exported for convenience)
export {
  PhotoDetailsCard,
  PhotoDetailsList,
  BatchMetadataModal
} from './detailsStep';