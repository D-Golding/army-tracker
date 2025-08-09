// components/shared/PhotoGallery.jsx
import React, { useState } from 'react';
import { Trash2, Eye, X, MoreVertical } from 'lucide-react';
import { deletePhotoByURL } from '../../services/photoService';

const PhotoGallery = ({
  photos = [],
  onPhotoDeleted,
  allowDelete = true,
  gridCols = 2,
  aspectRatio = 'aspect-square',
  className = ''
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(null);

  // Handle photo deletion
  const handleDeletePhoto = async (photoUrl) => {
    setIsDeleting(true);

    try {
      const result = await deletePhotoByURL(photoUrl);

      if (result.success) {
        // Call parent callback
        if (onPhotoDeleted) {
          onPhotoDeleted(photoUrl);
        }
        setShowDeleteModal(null);
      } else {
        alert(`Failed to delete photo: ${result.error}`);
      }
    } catch (error) {
      alert(`Failed to delete photo: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Close dropdowns when clicking outside
  const handleBackdropClick = () => {
    setShowDropdown(null);
  };

  if (!photos || photos.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 dark:text-gray-400 ${className}`}>
        <div className="text-sm">No photos yet</div>
      </div>
    );
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className={`grid grid-cols-${gridCols} gap-3 ${className}`}>
        {photos.map((photo, index) => {
          // Handle both string URLs and photo objects
          const photoUrl = typeof photo === 'string' ? photo : photo.downloadURL || photo.url;
          const photoId = typeof photo === 'string' ? photoUrl : photo.id || index;

          return (
            <div key={photoId} className={`relative ${aspectRatio} bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden group`}>

              {/* Photo Image */}
              <img
                src={photoUrl}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setSelectedPhoto(photoUrl)}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMSA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDMgOUwxMC45MSA4LjI2TDEyIDJaIiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
                  e.target.classList.add('p-8');
                }}
              />

              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">

                  {/* View Button */}
                  <button
                    onClick={() => setSelectedPhoto(photoUrl)}
                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    <Eye size={16} className="text-gray-700" />
                  </button>

                  {/* Delete Button */}
                  {allowDelete && (
                    <button
                      onClick={() => setShowDeleteModal(photoUrl)}
                      className="p-2 bg-red-500 bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                    >
                      <Trash2 size={16} className="text-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Menu (Three Dots) */}
              <div className="absolute top-2 right-2 md:hidden">
                <button
                  onClick={() => setShowDropdown(showDropdown === photoId ? null : photoId)}
                  className="p-1 bg-black bg-opacity-50 rounded-full text-white"
                >
                  <MoreVertical size={16} />
                </button>

                {/* Dropdown Menu */}
                {showDropdown === photoId && (
                  <>
                    <div className="dropdown-backdrop" onClick={handleBackdropClick}></div>
                    <div className="absolute top-8 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-[9999] w-32">
                      <button
                        onClick={() => {
                          setSelectedPhoto(photoUrl);
                          setShowDropdown(null);
                        }}
                        className="dropdown-item"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      {allowDelete && (
                        <button
                          onClick={() => {
                            setShowDeleteModal(photoUrl);
                            setShowDropdown(null);
                          }}
                          className="dropdown-item-danger"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-4xl max-h-full">

            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all z-10"
            >
              <X size={20} />
            </button>

            {/* Photo */}
            <img
              src={selectedPhoto}
              alt="Full size"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Photo?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This action cannot be undone. The photo will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                disabled={isDeleting}
                className="btn-tertiary btn-md flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePhoto(showDeleteModal)}
                disabled={isDeleting}
                className="btn-danger btn-md flex-1"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGallery;