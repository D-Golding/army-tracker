// components/projects/ProjectPhotoGallery.jsx - Updated to hide default images from gallery
import React, { useState } from 'react';
import { Camera, Star, X, Trash2, Eye, Edit, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../hooks/useSubscription';
import ConfirmationModal from '../common/ConfirmationModal';

// Helper function to check if a photo is a default placeholder
const isDefaultImage = (photoUrl) => {
  if (!photoUrl) return false;

  // Common patterns for default images
  const defaultPatterns = [
    'default-project-cover',
    'placeholder',
    'default-cover',
    'project-placeholder',
    // Add any other patterns your app uses for default images
  ];

  return defaultPatterns.some(pattern => photoUrl.includes(pattern));
};

const ProjectPhotoGallery = ({
  projectData,
  projectPhotos,
  onPhotosUploaded,
  onPhotoDeleted,
  onCoverPhotoSet,
  onPhotoMetadataUpdated, // New prop for updating metadata
  className = ''
}) => {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);

  const navigate = useNavigate();
  const { limits, canPerformAction, currentTier } = useSubscription();
  const coverPhotoURL = projectData?.coverPhotoURL;

  // Helper function to get photo URL from photo object or string
  const getPhotoUrl = (photo) => {
    return typeof photo === 'string' ? photo : photo.url;
  };

  // Helper function to get photo object from photo or create minimal object
  const getPhotoObject = (photo) => {
    if (typeof photo === 'string') {
      return {
        url: photo,
        title: '',
        description: '',
        originalFileName: '',
        uploadedAt: '',
        wasEdited: false
      };
    }
    return photo;
  };

  // Filter out default images from gallery display
  const realPhotos = projectPhotos.filter(photo => {
    const photoUrl = getPhotoUrl(photo);
    return !isDefaultImage(photoUrl);
  });

  // Get all photo URLs for comparison and operations (including defaults for cover photo logic)
  const allPhotoUrls = projectPhotos.map(getPhotoUrl);
  const realPhotoUrls = realPhotos.map(getPhotoUrl);

  // Check if we only have default images
  const hasOnlyDefaultImages = realPhotos.length === 0 && projectPhotos.length > 0;
  const hasRealPhotos = realPhotos.length > 0;

  // Auto-set first real photo as cover if no cover is set and real photos exist
  React.useEffect(() => {
    if (hasRealPhotos && (!coverPhotoURL || isDefaultImage(coverPhotoURL))) {
      onCoverPhotoSet(realPhotoUrls[0]);
    }
  }, [realPhotoUrls, coverPhotoURL, onCoverPhotoSet, hasRealPhotos]);

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
        const remainingRealUrls = realPhotoUrls.filter(url => url !== showDeleteConfirm);
        if (remainingRealUrls.length > 0) {
          await onCoverPhotoSet(remainingRealUrls[0]);
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

  // Handle lightbox opening
  const handleLightboxOpen = (photo) => {
    const photoObj = getPhotoObject(photo);
    setShowLightbox(photoObj);
    setIsEditingMetadata(false);
    setEditingTitle(photoObj.title || '');
    setEditingDescription(photoObj.description || '');
  };

  // Handle metadata editing
  const handleStartEdit = () => {
    setIsEditingMetadata(true);
  };

  const handleCancelEdit = () => {
    setIsEditingMetadata(false);
    setEditingTitle(showLightbox.title || '');
    setEditingDescription(showLightbox.description || '');
  };

  const handleSaveMetadata = async () => {
    if (!showLightbox || !onPhotoMetadataUpdated) return;

    setIsSavingMetadata(true);
    try {
      await onPhotoMetadataUpdated(showLightbox.url, {
        title: editingTitle.trim(),
        description: editingDescription.trim()
      });

      // Update local lightbox state
      setShowLightbox(prev => ({
        ...prev,
        title: editingTitle.trim(),
        description: editingDescription.trim()
      }));

      setIsEditingMetadata(false);
    } catch (error) {
      console.error('Error updating photo metadata:', error);
      alert('Failed to update photo details. Please try again.');
    } finally {
      setIsSavingMetadata(false);
    }
  };

  // Photo button logic
  const canAddPhotos = canPerformAction('add_photo', 1, projectData);
  const isTopTier = currentTier === 'battle';
  const photoButtonDisabled = !canAddPhotos && isTopTier;

  // Get photos to display in gallery (show 4 initially on desktop, 2 on mobile, all when expanded)
  const getInitialDisplayCount = () => {
    // Mobile: 2, Tablet: 4, Desktop: 6
    if (window.innerWidth < 768) return 2;
    if (window.innerWidth < 1024) return 4;
    return 6;
  };

  const [initialDisplayCount] = useState(getInitialDisplayCount());
  const displayPhotos = showAllPhotos ? realPhotos : realPhotos.slice(0, initialDisplayCount);
  const hasMorePhotos = realPhotos.length > initialDisplayCount;

  return (
    <>
      <div className={`card-base card-padding ${className}`}>
        {/* Header */}
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Camera className="mr-2" size={18} />
              Project Photos ({realPhotos.length})
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

        {/* No Real Photos State - Clean placeholder text only */}
        {!hasRealPhotos ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Camera className="mx-auto mb-3 text-gray-400" size={32} />
            <p className="mb-3">No photos added yet</p>
            <p className="text-sm text-gray-400">Upload photos to bring your project to life</p>
          </div>
        ) : (
          <>
            {/* Cover Photo Section - Show default image as cover if no real photos, otherwise show real cover */}
            {(coverPhotoURL || hasOnlyDefaultImages) && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <Star className="mr-1 text-yellow-500" size={14} />
                  Cover Photo
                </h3>

                {/* Responsive cover photo container */}
                <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 max-w-xs">
                  {/* Cover Photo Display - Show default if only defaults exist, otherwise real cover */}
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-yellow-200 dark:border-yellow-600">
                    <img
                      src={hasRealPhotos && !isDefaultImage(coverPhotoURL) ? coverPhotoURL : getPhotoUrl(projectPhotos[0])}
                      alt="Project cover"
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                      onClick={() => {
                        if (hasRealPhotos && !isDefaultImage(coverPhotoURL)) {
                          const coverPhoto = realPhotos.find(p => getPhotoUrl(p) === coverPhotoURL);
                          handleLightboxOpen(coverPhoto || coverPhotoURL);
                        }
                      }}
                    />
                  </div>

                  {/* Change Cover Button - Only show if we have multiple real photos */}
                  {realPhotos.length > 1 && (
                    <button
                      onClick={() => setShowCoverModal(true)}
                      className="mt-2 w-full btn-tertiary btn-sm flex items-center justify-center gap-2"
                    >
                      <Edit size={14} />
                      Change
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Gallery Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Gallery
              </h3>

              {/* Photo Grid - Responsive and smaller */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-4">
                {displayPhotos.map((photo, index) => {
                  const photoUrl = getPhotoUrl(photo);
                  const photoObj = getPhotoObject(photo);
                  const isCoverPhoto = photoUrl === coverPhotoURL;

                  return (
                    <div key={photoUrl} className="relative group">
                      {/* Photo Card - Smaller aspect ratio */}
                      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                        <img
                          src={photoUrl}
                          alt={photoObj.title || `Project photo ${index + 1}`}
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                          onClick={() => handleLightboxOpen(photo)}
                        />
                      </div>

                      {/* Cover Badge */}
                      {isCoverPhoto && (
                        <div className="absolute top-1.5 left-1.5 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <Star size={8} />
                          Cover Photo
                        </div>
                      )}

                      {/* Delete Button - Smaller and only visible on hover on desktop */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(photoUrl);
                        }}
                        className="absolute bottom-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        title="Delete photo"
                      >
                        <Trash2 size={10} />
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
                    <>
                      <Eye size={16} />
                      See All ({realPhotos.length - initialDisplayCount} more)
                    </>
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

      {/* Cover Photo Selection Modal - Only show real photos */}
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

            {/* Modal grid - smaller photos, only real photos */}
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
              {realPhotos.map((photo, index) => {
                const photoUrl = getPhotoUrl(photo);
                const isCurrentCover = photoUrl === coverPhotoURL;

                return (
                  <button
                    key={photoUrl}
                    onClick={() => handleSetCoverPhoto(photoUrl)}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                      isCurrentCover 
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <img
                      src={photoUrl}
                      alt={`Photo option ${index + 1}`}
                      className="w-full h-full object-cover"
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

      {/* Lightbox Modal with Full-Screen Editable Metadata */}
      {showLightbox && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowLightbox(null)}
        >
          <div className="relative w-full max-w-6xl h-full flex flex-col">
            {/* Close button - always visible */}
            <button
              onClick={() => setShowLightbox(null)}
              className="absolute top-4 right-4 z-50 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
              <X size={20} />
            </button>

            {/* Image - takes up most of the space */}
            <div className="flex-1 flex items-center justify-center mb-4">
              <img
                src={showLightbox.url}
                alt={showLightbox.title || "Full size preview"}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Metadata Panel - clean and spacious */}
            {!isEditingMetadata ? (
              /* View Mode - compact at bottom */
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mx-auto max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {showLightbox.title || 'Untitled Photo'}
                  </h3>
                  {onPhotoMetadataUpdated && (
                    <button
                      onClick={handleStartEdit}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Edit photo details"
                    >
                      <Edit size={18} />
                    </button>
                  )}
                </div>

                {showLightbox.description ? (
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {showLightbox.description}
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                    No description added
                  </p>
                )}

                {/* Show prominent edit button if no metadata */}
                {!showLightbox.title && !showLightbox.description && onPhotoMetadataUpdated && (
                  <button
                    onClick={handleStartEdit}
                    className="w-full mt-3 btn-primary btn-md"
                  >
                    <Edit size={16} />
                    Add Title & Description
                  </button>
                )}
              </div>
            ) : (
              /* Edit Mode - full overlay modal */
              <div
                className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center p-4 z-40"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Edit Photo Details
                    </h2>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSavingMetadata}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Photo Title
                      </label>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="form-input w-full text-base py-3"
                        placeholder="Add a title for this photo..."
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.target.value)}
                        className="form-textarea w-full text-base py-3"
                        placeholder="Add a description for this photo..."
                        rows="6"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSavingMetadata}
                        className="btn-tertiary btn-lg flex-1"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveMetadata}
                        disabled={isSavingMetadata}
                        className="btn-primary btn-lg flex-1"
                      >
                        {isSavingMetadata ? (
                          <>
                            <div className="loading-spinner mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectPhotoGallery;