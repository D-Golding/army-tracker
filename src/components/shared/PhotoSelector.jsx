// components/shared/PhotoSelector.jsx
import React, { useState } from 'react';
import { X, Check, Camera, Plus } from 'lucide-react';

const PhotoSelector = ({
  isOpen,
  onClose,
  availablePhotos = [],
  selectedPhotos = [],
  onPhotosSelected,
  title = "Select Photos",
  maxSelection = null,
  allowMultiple = true
}) => {
  const [localSelection, setLocalSelection] = useState(selectedPhotos);

  // Handle photo selection
  const togglePhotoSelection = (photoUrl) => {
    if (!allowMultiple) {
      setLocalSelection([photoUrl]);
      return;
    }

    setLocalSelection(prev => {
      const isSelected = prev.includes(photoUrl);
      if (isSelected) {
        return prev.filter(url => url !== photoUrl);
      } else {
        // Check max selection limit
        if (maxSelection && prev.length >= maxSelection) {
          return prev; // Don't add if at limit
        }
        return [...prev, photoUrl];
      }
    });
  };

  // Handle confirm selection
  const handleConfirm = () => {
    onPhotosSelected(localSelection);
    onClose();
  };

  // Handle close
  const handleClose = () => {
    setLocalSelection(selectedPhotos); // Reset to original selection
    onClose();
  };

  if (!isOpen) return null;

  const hasChanges = JSON.stringify(localSelection.sort()) !== JSON.stringify(selectedPhotos.sort());

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Selection Info */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {localSelection.length} photo{localSelection.length !== 1 ? 's' : ''} selected
              {maxSelection && ` (max ${maxSelection})`}
            </span>
            {localSelection.length > 0 && (
              <button
                onClick={() => setLocalSelection([])}
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          {maxSelection && localSelection.length >= maxSelection && (
            <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Maximum selection reached
            </div>
          )}
        </div>

        {/* Photo Grid */}
        <div className="flex-1 overflow-y-auto mb-4 min-h-0">
          {availablePhotos.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Camera className="mx-auto mb-3 text-gray-400" size={32} />
              <p className="mb-3">No photos available</p>
              <p className="text-sm">Add photos to the main gallery first</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availablePhotos.map((photoUrl, index) => {
                const isSelected = localSelection.includes(photoUrl);
                const canSelect = !maxSelection || localSelection.length < maxSelection || isSelected;

                return (
                  <div
                    key={photoUrl}
                    onClick={() => canSelect && togglePhotoSelection(photoUrl)}
                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all ${
                      isSelected
                        ? 'ring-2 ring-indigo-500 ring-offset-2'
                        : canSelect 
                          ? 'hover:ring-2 hover:ring-gray-300'
                          : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <img
                      src={photoUrl}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Selection Overlay */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-indigo-500 bg-opacity-20' 
                        : 'bg-black bg-opacity-0 hover:bg-opacity-10'
                    }`}>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'border-white bg-indigo-500' 
                          : 'border-white bg-black bg-opacity-20'
                      }`}>
                        {isSelected && (
                          <Check size={16} className="text-white" />
                        )}
                      </div>
                    </div>

                    {/* Photo Number */}
                    <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={handleClose}
            className="btn-tertiary btn-md flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasChanges}
            className="btn-primary btn-md flex-1"
          >
            <Check size={16} />
            {allowMultiple
              ? `Select ${localSelection.length} Photo${localSelection.length !== 1 ? 's' : ''}`
              : 'Select Photo'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoSelector;