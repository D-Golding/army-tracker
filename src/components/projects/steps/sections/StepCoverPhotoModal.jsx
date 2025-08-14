// components/projects/steps/sections/StepCoverPhotoModal.jsx
import React from 'react';
import { X, Star } from 'lucide-react';

const StepCoverPhotoModal = ({
  isOpen,
  onClose,
  photos,
  currentCoverPhoto,
  onCoverPhotoSelected
}) => {
  if (!isOpen) return null;

  const handlePhotoClick = (photoUrl) => {
    console.log('Photo clicked:', photoUrl); // Debug log
    onCoverPhotoSelected(photoUrl);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Choose Cover Photo
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {photos.map((photoUrl, index) => {
            const isCurrentCover = photoUrl === currentCoverPhoto;

            return (
              <div
                key={photoUrl}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePhotoClick(photoUrl);
                }}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  isCurrentCover 
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <img
                  src={photoUrl}
                  alt={`Photo option ${index + 1}`}
                  className="w-full h-full object-cover pointer-events-none"
                />

                {isCurrentCover && (
                  <div className="absolute inset-0 bg-yellow-500 bg-opacity-20 flex items-center justify-center pointer-events-none">
                    <div className="bg-yellow-500 text-white px-2 py-1 rounded-lg flex items-center gap-1">
                      <Star size={12} />
                      Current
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
          <button
            onClick={onClose}
            className="btn-tertiary btn-md w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepCoverPhotoModal;