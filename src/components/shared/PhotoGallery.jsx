// components/projects/ProjectPhotoGallery.jsx
import React, { useState } from 'react';
import { Camera, Star, X, Trash2, Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../hooks/useSubscription';
import ConfirmationModal from '../common/ConfirmationModal';

const ProjectPhotoGallery = ({
  projectData,
  projectPhotos,
  onPhotosUploaded,
  onPhotoDeleted,
  onCoverPhotoSet,
  className = ''
}) => {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const navigate = useNavigate();
  const { limits, canPerformAction, currentTier } = useSubscription();
  const coverPhotoURL = projectData?.coverPhotoURL;

  // Auto-set first photo as cover if no cover is set and photos exist
  React.useEffect(() => {
    if (projectPhotos.length > 0 && !coverPhotoURL) {
      onCoverPhotoSet(projectPhotos[0]);
    }
  }, [projectPhotos, coverPhotoURL, onCoverPhotoSet]);

  // Handle setting cover photo
  const handleSetCoverPhoto = async (photoUrl) => {
    try {
      await onCoverPhotoSet(photoUrl);
      setShowCoverModal(false);
    } catch (error) {
      console.error('Error setting cover photo:', error);
    }
  };

  // Handle photo deletion with confirmation
  const handleDeleteClick = (photoUrl) => {
    setShowDeleteConfirm(photoUrl);
  };

  const handleConfirmDelete = async () => {
    if (!showDeleteConfirm) return;

    try {
      await onPhotoDeleted(showDeleteConfirm);

      // If deleted photo was cover, set new cover or clear it
      if (showDeleteConfirm === coverPhotoURL) {
        const remainingPhotos = projectPhotos.filter(url => url !== showDeleteConfirm);
        if (remainingPhotos.length > 0) {
          await onCoverPhotoSet(remainingPhotos[0]);
        } else {
          await onCoverPhotoSet(null);
        }
      }

      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting photo:', error);
      setShowDeleteConfirm(null);
    }
  };

  // Photo button logic
  const canAddPhotos = canPerformAction('add_photo', 1, projectData);
  const isTopTier = currentTier === 'battle';
  const photoButtonDisabled = !canAddPhotos && isTopTier;

  // Get photos to display in gallery (show 2 initially, all when expanded)
  const displayPhotos = showAllPhotos ? projectPhotos : projectPhotos.slice(0, 2);
  const hasMorePhotos = projectPhotos.length > 2;

  return (
    <>
      <div className={`card-base card-padding ${className}`}>
        {/* Header */}
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Camera className="mr-2" size={18} />
              Project Photos ({projectPhotos.length})
            </h2>
          </div>

          {/* Add Photos Button - Navigate to wizard page */}
          <div className="flex justify-start mt-3">
            <button
              onClick={() => navigate(`/app/projects/${projectData?.id}/photos/new`)}
              disabled={photoButtonDisabled}
              className={`btn-primary btn-sm ${photoButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Camera size={16} />
              {canAddPhotos ? "Add Photos" : (isTopTier ? "Add Photos" : "Upgrade")}
            </button>
          </div>
        </div>

        {/* No Photos State */}
        {projectPhotos.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Camera className="mx-auto mb-3 text-gray-400" size={32} />
            <p className="mb-3">No photos added yet</p>
          </div>
        ) : (
          <>
            {/* Cover Photo Section */}
            {coverPhotoURL && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <Star className="mr-1 text-yellow-500" size={14} />
                  Cover Photo
                </h3>

                <div className="w-1/2 pr-1.5">
                  {/* Cover Photo Display - Same size as gallery photos */}
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-yellow-200 dark:border-yellow-600">
                    <img
                      src={coverPhotoURL}
                      alt="Project cover"
                      className="w-full h-full object-contain cursor-pointer"
                      onClick={() => setShowLightbox(coverPhotoURL)}
                    />
                  </div>

                  {/* Change Cover Button */}
                  <button
                    onClick={() => setShowCoverModal(true)}
                    className="mt-2 w-full btn-tertiary btn-sm flex items-center justify-center gap-2"
                  >
                    <Edit size={14} />
                    Change
                  </button>
                </div>
              </div>
            )}

            {/* Gallery Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Gallery
              </h3>

              {/* Photo Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {displayPhotos.map((photoUrl, index) => {
                  const isCoverPhoto = photoUrl === coverPhotoURL;

                  return (
                    <div key={photoUrl} className="relative">
                      {/* Photo Card */}
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                        <img
                          src={photoUrl}
                          alt={`Project photo ${index + 1}`}
                          className="w-full h-full object-contain cursor-pointer"
                          onClick={() => setShowLightbox(photoUrl)}
                        />
                      </div>

                      {/* Cover Badge */}
                      {isCoverPhoto && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                          <Star size={10} />
                          Cover
                        </div>
                      )}

                      {/* Delete Button - Always visible, bottom right */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(photoUrl);
                        }}
                        className="absolute bottom-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                        title="Delete photo"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* See All / Show Less Button */}
              {hasMorePhotos && (
                <button
                  onClick={() => setShowAllPhotos(!showAllPhotos)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
                >
                  {showAllPhotos ? (
                    <>Show Less</>
                  ) : (
                    <>See All ({projectPhotos.length - 2} more)</>
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Photo?"
        message="This will permanently remove this photo from your project. This action cannot be undone."
        type="error"
        primaryAction={{
          label: "Delete",
          onClick: handleConfirmDelete,
          variant: "danger"
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setShowDeleteConfirm(null)
        }}
      />

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
              {projectPhotos.map((photoUrl, index) => {
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
    </>
  );
};

export default ProjectPhotoGallery;