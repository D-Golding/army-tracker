// components/shared/wizard/photoGallery/PhotoSelectForm.jsx - With simplified mode support and mobile responsiveness
import React, { useRef, useState } from 'react';
import { Camera, Upload, Plus, X, Edit } from 'lucide-react';
import PhotoUploadLimits from './PhotoUploadLimits';
import PhotoDropZone from './PhotoDropZone';
import PhotoPreviewGrid from './PhotoPreviewGrid';
import ProjectPhotoCropper from '../../../projects/ProjectPhotoCropper';
import { useSubscription } from '../../../../hooks/useSubscription';
import { validatePhotoFile } from '../../../../utils/photoValidator';

const PhotoSelectForm = ({
  formData,
  onFilesSelected,
  onFileRemoved,
  onMetadataUpdated,
  onFileEdited,
  onUpload,
  maxPhotos = 10,
  projectData,
  isLoading = false,
  errors = {},
  mode = 'wizard', // 'wizard' or 'simplified'
  isUploading = false
}) => {
  const { canPerformAction } = useSubscription();
  const selectedFiles = formData.files || [];
  const remainingSlots = Math.max(0, maxPhotos - selectedFiles.length);
  const fileInputRef = useRef(null);
  const [showCropper, setShowCropper] = useState(null);

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

  // Handle file input change
  const handleFileInput = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      handleFileSelect(files);
    }
    // Reset input value
    event.target.value = '';
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

  // Handle metadata updates
  const handleMetadataUpdated = (fileId, metadata) => {
    if (onMetadataUpdated) {
      onMetadataUpdated(fileId, metadata);
    }
  };

  // Handle cropping
  const handleCropStart = (fileId) => {
    const file = selectedFiles.find(f => f.id === fileId);
    if (file) {
      setShowCropper(file);
    }
  };

  const handleCropComplete = (croppedBlob) => {
    if (showCropper && croppedBlob && onFileEdited) {
      const croppedPreviewUrl = URL.createObjectURL(croppedBlob);

      onFileEdited(showCropper.id, {
        isProcessed: true,
        skipEditing: false,
        croppedBlob,
        croppedPreviewUrl,
        aspectRatio: 'custom',
        cropSettings: { timestamp: new Date().toISOString() }
      });
    }
    setShowCropper(null);
  };

  const handleCropCancel = () => {
    setShowCropper(null);
  };

  // Check permissions
  const canAddPhotos = canPerformAction('add_photo', 1, projectData);

  // SIMPLIFIED MODE
  if (mode === 'simplified') {
    // Show cropper if active
    if (showCropper) {
      return (
        <div className="pb-8">
          <ProjectPhotoCropper
            file={showCropper.originalFile}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
            onCropSkip={handleCropCancel}
            showSkipOption={true}
          />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {selectedFiles.length === 0 ? (
          /* Initial State - "Bring your project to life" */
          <div className="space-y-6">
            {/* Main Upload Area */}
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center">
              <div className="space-y-6">
                {/* Heading */}
                <h3 className="text-xl font-semibold text-white mb-2">
                  Bring your project to life
                </h3>

                {/* Upload Icon */}
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>

                {/* Upload Description */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-2">
                    Upload your photos
                  </h4>
                  <p className="text-gray-400 text-sm mb-6">
                    Drag and drop files here, or click to browse
                  </p>
                </div>

                {/* Add Photos Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!canAddPhotos}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add Photos
                  </button>
                </div>

                {/* File Info */}
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Supports: JPEG, PNG, WebP, HEIC</p>
                  <p>Maximum file size: 20MB</p>
                  <p>Up to {maxPhotos} more photos</p>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                You can always add photos to your project later
              </p>
            </div>

            {/* Info Section */}
            <div className="space-y-2 text-sm text-gray-400">
              <p>📷 Photos help showcase your project progress</p>
              <p>✂️ Next step: crop and edit your photos (optional)</p>
              <p>📝 Add labels and descriptions to organise your gallery</p>
            </div>

            <div className="space-y-2 text-sm text-gray-400">
              <p>📷 Selected photos will be ready for editing in the next step</p>
              <p>✂️ You can crop photos for better framing or keep originals</p>
              <p>📝 Add titles and descriptions to organise your gallery</p>
            </div>
          </div>
        ) : (
          /* Photos Added State */
          <div className="space-y-6">
            {/* Small Add Photos Button at Top */}
            <div className="flex justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={!canAddPhotos || remainingSlots <= 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <Plus size={16} />
                Add Photos
              </button>
            </div>

            {/* Photo Cards with Inline Metadata */}
            <div className="space-y-4">
              {selectedFiles.map((file) => {
                const displayUrl = file.editData?.croppedPreviewUrl || file.previewUrl;

                return (
                  <div key={file.id} className="border border-gray-600 rounded-xl p-4 bg-gray-800">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Photo Preview */}
                      <div className="flex-shrink-0 mx-auto sm:mx-0">
                        <div className="flex gap-3 items-start">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-700 border border-gray-600 relative">
                            <img
                              src={displayUrl}
                              alt={file.fileName}
                              className="w-full h-full object-cover"
                            />

                            {/* Edited Badge */}
                            {file.editData?.croppedBlob && (
                              <div className="absolute top-1 left-1 bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded">
                                Edited
                              </div>
                            )}

                            {/* Remove Button */}
                            <button
                              onClick={() => onFileRemoved(file.id)}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                            >
                              <X size={10} />
                            </button>
                          </div>

                          {/* Crop Button - Now beside the photo */}
                          <button
                            onClick={() => handleCropStart(file.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded flex items-center gap-2"
                          >
                            <Edit size={14} />
                            Crop Photo
                          </button>
                        </div>
                      </div>

                      {/* Metadata Form */}
                      <div className="flex-1 space-y-3 w-full">
                        {/* Photo Title */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Photo Title
                          </label>
                          <input
                            type="text"
                            value={file.metadata?.title || ''}
                            onChange={(e) => handleMetadataUpdated(file.id, { title: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm"
                            placeholder="e.g., Front view, Detail shot, Work in progress"
                          />
                        </div>

                        {/* Photo Description */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Description
                          </label>
                          <textarea
                            value={file.metadata?.description || ''}
                            onChange={(e) => handleMetadataUpdated(file.id, { description: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm"
                            placeholder="Add details about this photo..."
                            rows="2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info Section */}
            <div className="space-y-2 text-sm text-gray-400">
              <p>📷 Next: Edit your photos with cropping tools</p>
              <p>📋 Then: Add titles and descriptions</p>
            </div>

            <div className="space-y-2 text-sm text-gray-400">
              <p>📷 Selected photos will be ready for editing in the next step</p>
              <p>✂️ You can crop photos for better framing or keep originals</p>
              <p>📝 Add titles and descriptions to organise your gallery</p>
            </div>

            {/* Upload Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-700">
              <button
                onClick={() => {/* Cancel logic */}}
                disabled={isUploading}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>

              <button
                onClick={onUpload}
                disabled={isUploading || selectedFiles.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium flex-1 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    Uploading {selectedFiles.length} photo{selectedFiles.length !== 1 ? 's' : ''}...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    );
  }

  // WIZARD MODE (existing functionality)
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