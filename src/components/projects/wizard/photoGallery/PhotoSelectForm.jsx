// components/shared/wizard/photoGallery/PhotoSelectForm.jsx - Remove auto-processing, keep simple selection
import React from 'react';
import { Camera } from 'lucide-react';
import PhotoUploadLimits from './PhotoUploadLimits';
import PhotoDropZone from './PhotoDropZone';
import PhotoPreviewGrid from './PhotoPreviewGrid';
import { useSubscription } from '../../../../hooks/useSubscription';

const PhotoSelectForm = ({
  formData,
  onFilesSelected,
  onFileRemoved,
  maxPhotos = 10,
  projectData,
  isLoading = false,
  errors = {}
}) => {
  const { canPerformAction } = useSubscription();
  const selectedFiles = formData.files || [];
  const remainingSlots = Math.max(0, maxPhotos - selectedFiles.length);

  // Simple file validation
  const validateFiles = (files) => {
    const maxFileSize = 20 * 1024 * 1024; // 20MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    const validFiles = [];
    const errors = [];

    for (const file of files) {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Unsupported file type. Please use JPEG, PNG, WebP, or HEIC.`);
        continue;
      }

      // Check file size
      if (file.size > maxFileSize) {
        errors.push(`${file.name}: File too large. Maximum size is 20MB.`);
        continue;
      }

      validFiles.push(file);
    }

    // Check if we have too many files
    if (validFiles.length > remainingSlots) {
      errors.push(`You can only add ${remainingSlots} more photo(s).`);
      return {
        isValid: false,
        validFiles: validFiles.slice(0, remainingSlots),
        errors
      };
    }

    return {
      isValid: errors.length === 0,
      validFiles,
      errors
    };
  };

  // Handle file selection - just validate and pass through
  const handleFileSelect = (files) => {
    if (!files || files.length === 0) return;

    // Validate files
    const validation = validateFiles(files);

    if (!validation.isValid) {
      console.error('File validation failed:', validation.errors);
      // Show first error to user
      if (validation.errors.length > 0) {
        alert(validation.errors[0]);
      }
      return;
    }

    // Pass validated files to parent - no processing here
    onFilesSelected(validation.validFiles);
  };

  // Check permissions
  const canAddPhotos = canPerformAction('add_photo', 1, projectData);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Camera className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Select Photos
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose photos to upload and add to your project
        </p>
      </div>

      {/* Upload Limits */}
      <PhotoUploadLimits
        selectedCount={selectedFiles.length}
        maxPhotos={maxPhotos}
        projectData={projectData}
      />

      {/* Drop Zone */}
      <PhotoDropZone
        onFilesSelected={handleFileSelect}
        remainingSlots={remainingSlots}
        disabled={!canAddPhotos || remainingSlots <= 0}
        isLoading={isLoading}
      />

      {/* Preview Grid */}
      <PhotoPreviewGrid
        selectedFiles={selectedFiles}
        onFileRemoved={onFileRemoved}
        triggerFileInput={() => {
          // Create a file input and trigger it
          const input = document.createElement('input');
          input.type = 'file';
          input.multiple = true;
          input.accept = 'image/*';
          input.onchange = (e) => handleFileSelect(Array.from(e.target.files));
          input.click();
        }}
        remainingSlots={remainingSlots}
        isLoading={isLoading}
        projectData={projectData}
        errors={errors}
      />

      {/* Next Steps Info */}
      <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>📸 Selected photos will be ready for editing in the next step</p>
          <p>✂️ You can crop photos for better framing or keep originals</p>
          <p>🏷️ Add titles and descriptions to organize your gallery</p>
        </div>
      </div>
    </div>
  );
};

export default PhotoSelectForm;