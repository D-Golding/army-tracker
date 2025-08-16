// components/projects/wizard/ProjectPhotosForm.jsx - Updated to match mockup design
import React, { useState, useEffect } from 'react';
import { Camera, Star, X, Trash2, Plus } from 'lucide-react';
import { useSubscription } from '../../../../hooks/useSubscription';
import PhotoUploadWizard from '../photoGallery/PhotoUploadWizard.jsx';

const ProjectPhotosForm = ({
  formData: projectFormData,
  onPhotosAdded,
  onPhotoRemoved,
  onCoverPhotoSet,
  onPhotoWizardOpen,
  onPhotoWizardClose,
  isLoading = false
}) => {
  const [showPhotoWizard, setShowPhotoWizard] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(null);

  const { limits, canPerformAction, getRemainingAllowance, currentTier } = useSubscription();

  const uploadedPhotos = projectFormData.uploadedPhotos || [];
  const coverPhotoURL = projectFormData.coverPhotoURL;

  // Notify parent when photo wizard state changes
  useEffect(() => {
    if (showPhotoWizard) {
      onPhotoWizardOpen?.();
    } else {
      onPhotoWizardClose?.();
    }
  }, [showPhotoWizard, onPhotoWizardOpen, onPhotoWizardClose]);

  // Check if can add more photos
  const canAddMorePhotos = (count = 1) => {
    return canPerformAction('add_photo', count, projectFormData);
  };

  const remainingPhotoSlots = getRemainingAllowance('photos', true, projectFormData);
  const isAtPhotoLimit = remainingPhotoSlots <= 0;

  // Handle wizard completion
  const handleWizardComplete = (uploadResults) => {
    const photoUrls = uploadResults.map(result => result.downloadURL);
    onPhotosAdded(photoUrls);

    if (!coverPhotoURL && photoUrls.length > 0) {
      onCoverPhotoSet(photoUrls[0]);
    }

    setShowPhotoWizard(false);
  };

  // Handle wizard cancel
  const handleWizardCancel = () => {
    setShowPhotoWizard(false);
  };

  // Handle setting cover photo
  const handleSetCoverPhoto = (photoUrl) => {
    onCoverPhotoSet(photoUrl);
    setShowCoverModal(false);
  };

  // Handle photo deletion
  const handleDeletePhoto = (photoUrl) => {
    onPhotoRemoved(photoUrl);

    if (photoUrl === coverPhotoURL) {
      const remainingPhotos = uploadedPhotos.filter(url => url !== photoUrl);
      if (remainingPhotos.length > 0) {
        onCoverPhotoSet(remainingPhotos[0]);
      } else {
        onCoverPhotoSet(null);
      }
    }
  };

  // Get upload button state
  const getUploadButtonState = () => {
    if (isAtPhotoLimit) {
      if (currentTier === 'battle') {
        return { disabled: true, text: 'Photo Limit Reached', icon: Plus };
      } else {
        return { disabled: false, text: 'Upgrade for More Photos', icon: Plus };
      }
    }
    return { disabled: false, text: 'Add photos', icon: null };
  };

  const uploadButtonState = getUploadButtonState();

  // Show photo wizard if active
  if (showPhotoWizard) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Camera className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Project Photos
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload photos for your project
          </p>
        </div>

        <PhotoUploadWizard
          onComplete={handleWizardComplete}
          onCancel={handleWizardCancel}
          projectId="temp-project"
          projectData={projectFormData}
          photoType="project"
          maxPhotos={limits.photosPerProject}
          enableCropping={true}
          mode="project-creation"
        />
      </div>
    );
  }

  // Main photos form view - Updated to match mockup
  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <Camera className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Project Photos
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload photos for your project (optional)
        </p>
      </div>

      {/* Photo Usage Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400 font-medium">Photo Usage</span>
          <span className={`font-bold text-lg ${isAtPhotoLimit ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
            {uploadedPhotos.length} / {limits.photosPerProject}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isAtPhotoLimit 
                ? 'bg-red-500' 
                : uploadedPhotos.length / limits.photosPerProject > 0.8 
                  ? 'bg-amber-500' 
                  : 'bg-indigo-500'
            }`}
            style={{
              width: `${Math.min(100, (uploadedPhotos.length / limits.photosPerProject) * 100)}%`
            }}
          />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {remainingPhotoSlots} photos remaining
        </div>
      </div>

      {/* Main Content Area */}
      {uploadedPhotos.length === 0 ? (
        /* Empty State - Matches Mockup */
        <div className="text-center space-y-8 py-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bring your project to life
            </h2>
          </div>

          {/* Large Upload Button */}
          <button
            onClick={() => setShowPhotoWizard(true)}
            disabled={uploadButtonState.disabled && currentTier === 'battle'}
            className={`inline-block px-12 py-6 text-xl font-semibold rounded-2xl transition-all ${
              uploadButtonState.disabled && currentTier === 'battle' 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : isAtPhotoLimit && currentTier !== 'battle'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {uploadButtonState.text}
          </button>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You can always add photos to your project later
            </p>
          </div>
        </div>
      ) : (
        /* Photos Uploaded State */
        <div className="space-y-6">
          {/* Upload More Button */}
          <div className="text-center">
            <button
              onClick={() => setShowPhotoWizard(true)}
              disabled={uploadButtonState.disabled && currentTier === 'battle'}
              className={`btn-primary btn-md ${
                uploadButtonState.disabled && currentTier === 'battle' ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                isAtPhotoLimit && currentTier !== 'battle' ? 'bg-amber-600 hover:bg-amber-700' : ''
              }`}
            >
              {uploadButtonState.icon && <uploadButtonState.icon size={16} />}
              Upload More Photos
            </button>
          </div>

          {/* Cover Photo Section */}
          {coverPhotoURL && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <Star className="mr-1 text-yellow-500" size={14} />
                Cover Photo
              </h4>

              <div className="w-1/2 pr-1.5">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-yellow-200 dark:border-yellow-600">
                  <img
                    src={coverPhotoURL}
                    alt="Project cover"
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => setShowLightbox(coverPhotoURL)}
                  />
                </div>

                {uploadedPhotos.length > 1 && (
                  <button
                    onClick={() => setShowCoverModal(true)}
                    disabled={isLoading}
                    className="mt-2 w-full btn-tertiary btn-sm flex items-center justify-center gap-2"
                  >
                    Change Cover
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Gallery Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Gallery ({uploadedPhotos.length})
            </h4>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {uploadedPhotos.map((photoUrl, index) => {
                const isCoverPhoto = photoUrl === coverPhotoURL;

                return (
                  <div key={photoUrl} className="relative">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                      <img
                        src={photoUrl}
                        alt={`Project photo ${index + 1}`}
                        className="w-full h-full object-contain cursor-pointer"
                        onClick={() => setShowLightbox(photoUrl)}
                      />
                    </div>

                    {isCoverPhoto && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                        <Star size={10} />
                        Cover
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photoUrl);
                      }}
                      disabled={isLoading}
                      className="absolute bottom-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                      title="Delete photo"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You can always add photos to your project later
            </p>
          </div>
        </div>
      )}

      {/* Cover Photo Selection Modal */}
      {showCoverModal && (
        <div className="modal-backdrop" onClick={() => setShowCoverModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Choose Cover Photo
              </h3>
              <button
                onClick={() => setShowCoverModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {uploadedPhotos.map((photoUrl, index) => {
                const isCurrentCover = photoUrl === coverPhotoURL;

                return (
                  <button
                    key={photoUrl}
                    onClick={() => handleSetCoverPhoto(photoUrl)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      isCurrentCover 
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <img
                      src={photoUrl}
                      alt={`Photo option ${index + 1}`}
                      className="w-full h-full object-contain"
                    />

                    {isCurrentCover && (
                      <div className="absolute inset-0 bg-yellow-500 bg-opacity-20 flex items-center justify-center">
                        <div className="bg-yellow-500 text-white px-2 py-1 rounded-lg flex items-center gap-1">
                          <Star size={12} />
                          Current
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
              <button
                onClick={() => setShowCoverModal(false)}
                className="btn-tertiary btn-md w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {showLightbox && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowLightbox(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={showLightbox}
              alt="Full size preview"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setShowLightbox(null)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPhotosForm;