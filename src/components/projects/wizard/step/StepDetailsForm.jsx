// components/projects/wizard/step/StepDetailsForm.jsx - Title/description form with cover photo
import React, { useState } from 'react';
import { ListOrdered, Camera, Image, Upload, X, Edit } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext.jsx';
import { uploadPhoto } from '../../../../utils/photoUploader.js';
import { validatePhotoFile } from '../../../../utils/photoValidator.js';
import ProjectPhotoCropper from '../../ProjectPhotoCropper.jsx';

const StepDetailsForm = ({
  formData,
  onFieldChange,
  error,
  isLoading,
  stepNumber,
  projectData
}) => {
  const { currentUser } = useAuth();
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showGallerySelector, setShowGallerySelector] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState(null);
  const [cropperFile, setCropperFile] = useState(null);

  const projectPhotos = projectData?.photoURLs || [];
  const selectedCoverPhoto = formData.stepPhoto;

  // Handle file selection for upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      const validation = validatePhotoFile(file);
      if (!validation.isValid) {
        setPhotoError(validation.error);
        return;
      }

      setPhotoError(null);
      setCropperFile(file);
      setShowCropper(true);
      setShowPhotoOptions(false);
    }
  };

  // Handle crop completion
  const handleCropComplete = async (croppedBlob) => {
    if (!currentUser || !currentUser.uid) {
      setPhotoError('User not authenticated. Please try again.');
      return;
    }

    if (!projectData || !projectData.id) {
      setPhotoError('Project data not available. Please try again.');
      return;
    }

    if (!croppedBlob) {
      setPhotoError('Invalid image data. Please try again.');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      // Upload the cropped photo as a step photo (separate from project limits)
      const uploadResult = await uploadPhoto(
        croppedBlob,
        currentUser.uid,
        projectData.id,
        'project' // Use project type but this will be step-specific
      );

      if (uploadResult.success) {
        console.log('✅ Photo uploaded successfully, setting stepPhoto to:', uploadResult.downloadURL);
        onFieldChange('stepPhoto', uploadResult.downloadURL);
        setShowCropper(false);
        setCropperFile(null);
        setPhotoError(null);
      } else {
        setPhotoError(`Failed to upload photo: ${uploadResult.error || 'Unknown error'}`);
        console.error('❌ Upload failed:', uploadResult.error);
      }
    } catch (error) {
      console.error('❌ Error uploading photo:', error);
      setPhotoError(`Failed to upload photo: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Handle gallery photo selection
  const handleGalleryPhotoSelect = (photoUrl) => {
    onFieldChange('stepPhoto', photoUrl);
    setShowGallerySelector(false);
    setShowPhotoOptions(false);
    setPhotoError(null);
  };

  // Handle removing photo
  const handleRemovePhoto = () => {
    onFieldChange('stepPhoto', null);
    setPhotoError(null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="text-center mb-6">
          <ListOrdered className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Step {stepNumber} Details
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Give your step a title, description, and optional cover photo
          </p>
        </div>

        {/* Step Title */}
        <div>
          <label className="form-label">
            Step Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => onFieldChange('title', e.target.value)}
            className={`form-input ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder="e.g., Prime all surfaces, Paint base colours"
            disabled={isLoading || isUploadingPhoto}
            autoFocus
          />
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}
          <div className="form-help">
            Give your step a clear, descriptive title
          </div>
        </div>

        {/* Step Description */}
        <div>
          <label className="form-label">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onFieldChange('description', e.target.value)}
            className="form-textarea"
            placeholder="Add details about what needs to be done in this step..."
            rows="3"
            disabled={isLoading || isUploadingPhoto}
          />
          <div className="form-help">
            Describe what needs to be done in this step (optional)
          </div>
        </div>

        {/* Cover Photo Section */}
        <div>
          <label className="form-label">
            Step Cover Photo <span className="text-gray-500">(optional)</span>
          </label>

          {selectedCoverPhoto ? (
            /* Selected Photo Display */
            <div className="space-y-3">
              <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-indigo-200 dark:border-indigo-600">
                <img
                  src={selectedCoverPhoto}
                  alt="Selected cover"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPhotoOptions(true)}
                  disabled={isLoading || isUploadingPhoto}
                  className="btn-tertiary btn-sm"
                >
                  <Edit size={14} />
                  Change Photo
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isLoading || isUploadingPhoto}
                  className="btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            /* Add Photo Button */
            <button
              type="button"
              onClick={() => setShowPhotoOptions(true)}
              className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colours"
              disabled={isLoading || isUploadingPhoto}
            >
              <Camera size={24} className="mx-auto mb-2" />
              <div className="text-sm font-medium">
                {isUploadingPhoto ? 'Uploading...' : 'Add Cover Photo'}
              </div>
              <div className="text-xs opacity-75">
                Choose from gallery or upload new
              </div>
            </button>
          )}

          {photoError && (
            <div className="form-error">{photoError}</div>
          )}
          <div className="form-help">
            This photo will represent your step and appear in the step header
          </div>
        </div>

        {/* Info about step photos */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="text-blue-800 dark:text-blue-300 text-sm">
            <div className="font-medium mb-1">💡 About Step Photos</div>
            <p>Step cover photos are separate from your project gallery and don't count towards photo limits. Once set, the cover photo stays with this step.</p>
          </div>
        </div>
      </div>

      {/* Photo Options Modal */}
      {showPhotoOptions && (
        <div className="modal-backdrop" onClick={() => setShowPhotoOptions(false)}>
          <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Cover Photo
              </h3>
              <button
                onClick={() => setShowPhotoOptions(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Choose from Gallery */}
              {projectPhotos.length > 0 && (
                <button
                  onClick={() => {
                    setShowPhotoOptions(false);
                    setShowGallerySelector(true);
                  }}
                  className="w-full flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-500 transition-colours"
                >
                  <Image size={20} className="text-indigo-600 dark:text-indigo-400" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Choose from Gallery</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Select from {projectPhotos.length} existing photo{projectPhotos.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </button>
              )}

              {/* Upload New Photo */}
              <label className="w-full flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-500 transition-colours cursor-pointer">
                <Upload size={20} className="text-indigo-600 dark:text-indigo-400" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">Upload New Photo</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Take or select a new photo
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
              <button
                onClick={() => setShowPhotoOptions(false)}
                className="btn-tertiary btn-md w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Selector Modal */}
      {showGallerySelector && (
        <div className="modal-backdrop" onClick={() => setShowGallerySelector(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Choose from Gallery
              </h3>
              <button
                onClick={() => setShowGallerySelector(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {projectPhotos.map((photoUrl, index) => (
                <button
                  key={photoUrl}
                  onClick={() => handleGalleryPhotoSelect(photoUrl)}
                  className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all"
                >
                  <img
                    src={photoUrl}
                    alt={`Gallery photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
              <button
                onClick={() => setShowGallerySelector(false)}
                className="btn-tertiary btn-md w-full"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Cropper */}
      {showCropper && cropperFile && (
        <ProjectPhotoCropper
          file={cropperFile}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setCropperFile(null);
          }}
        />
      )}

      {/* Upload Loading Overlay */}
      {isUploadingPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="loading-spinner-primary mx-auto mb-4"></div>
            <div className="text-gray-900 dark:text-white font-medium">
              Processing photo...
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StepDetailsForm;