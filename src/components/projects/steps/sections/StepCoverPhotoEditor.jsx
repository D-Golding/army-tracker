// components/projects/steps/sections/StepCoverPhotoEditor.jsx
import React, { useState } from 'react';
import { Camera, Edit, Trash2, Image, X } from 'lucide-react';
import CameraCapture from '../../../shared/CameraCapture';
import PhotoSelector from '../../../shared/PhotoSelector';

const StepCoverPhotoEditor = ({
  currentPhoto,
  onPhotoUpdate,
  onPhotoRemove,
  projectData,
  isLoading = false
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showGallerySelector, setShowGallerySelector] = useState(false);

  const projectPhotos = projectData?.photoURLs || [];

  // Handle photos uploaded via camera capture
  const handlePhotosUploaded = (uploadResults) => {
    if (uploadResults && uploadResults.length > 0) {
      // Use the first uploaded photo as the step cover
      onPhotoUpdate(uploadResults[0].downloadURL);
      setShowOptions(false);
    }
  };

  // Handle gallery photo selection - FIX: Use the correct function name
  const handleGalleryPhotoSelected = (selectedPhotoUrls) => {
    if (selectedPhotoUrls && selectedPhotoUrls.length > 0) {
      onPhotoUpdate(selectedPhotoUrls[0]); // This should call onPhotoUpdate, not handlePhotoUpdate
    }
    setShowGallerySelector(false);
    setShowOptions(false);
  };

  // Handle photo removal
  const handleRemovePhoto = () => {
    onPhotoRemove();
  };

  return (
    <>
      <div className="space-y-3">
        <label className="form-label">
          Step Cover Photo <span className="text-gray-500">(optional)</span>
        </label>

        {currentPhoto ? (
          /* Current Photo Display */
          <div className="space-y-3">
            <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600">
              <img
                src={currentPhoto}
                alt="Step cover"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowOptions(true)}
                disabled={isLoading}
                className="btn-tertiary btn-sm"
              >
                <Edit size={14} />
                Change Photo
              </button>
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isLoading}
                className="btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 size={14} />
                Remove
              </button>
            </div>
          </div>
        ) : (
          /* Add Photo State */
          <button
            type="button"
            onClick={() => setShowOptions(true)}
            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            disabled={isLoading}
          >
            <Camera size={24} className="mx-auto mb-2" />
            <div className="text-sm font-medium">Add Cover Photo</div>
            <div className="text-xs opacity-75">
              Take new or choose from gallery
            </div>
          </button>
        )}

        <div className="form-help">
          This photo represents the step and appears in the step header
        </div>
      </div>

      {/* Photo Options Modal */}
      {showOptions && (
        <div className="modal-backdrop" onClick={() => setShowOptions(false)}>
          <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentPhoto ? 'Change Cover Photo' : 'Add Cover Photo'}
              </h3>
              <button
                onClick={() => setShowOptions(false)}
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
                    setShowOptions(false);
                    setShowGallerySelector(true);
                  }}
                  className="w-full flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors"
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

              {/* Take/Upload New Photo */}
              <div className="w-full">
                <CameraCapture
                  onPhotosUploaded={handlePhotosUploaded}
                  projectId={projectData?.id}
                  projectData={projectData}
                  photoType="project"
                  maxPhotos={1}
                  buttonText="Take New Photo"
                  buttonStyle="w-full flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors text-left"
                  enableCropping={true}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
              <button
                onClick={() => setShowOptions(false)}
                className="btn-tertiary btn-md w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Selector Modal */}
      <PhotoSelector
        isOpen={showGallerySelector}
        onClose={() => setShowGallerySelector(false)}
        availablePhotos={projectPhotos}
        selectedPhotos={[]}
        onPhotosSelected={handleGalleryPhotoSelected}
        title="Choose Cover Photo"
        maxSelection={1}
        allowMultiple={false}
      />
    </>
  );
};

export default StepCoverPhotoEditor;