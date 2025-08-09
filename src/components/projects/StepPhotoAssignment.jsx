// components/projects/StepPhotoAssignment.jsx
import React, { useState } from 'react';
import { Camera, Plus, X, ExternalLink } from 'lucide-react';
import PhotoSelector from '../shared/PhotoSelector';

const StepPhotoAssignment = ({
  step,
  projectData,
  onPhotosAssigned,
  maxPhotos = 10,
  className = ''
}) => {
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);

  const stepPhotos = step.photos || [];
  const mainGalleryPhotos = projectData?.photoURLs || [];

  // Get available photos (photos not yet assigned to this step)
  const availablePhotos = mainGalleryPhotos.filter(photoUrl =>
    !stepPhotos.includes(photoUrl)
  );

  // Handle adding photos to step
  const handleAddPhotos = () => {
    setShowPhotoSelector(true);
  };

  // Handle photo selection
  const handlePhotosSelected = async (selectedPhotoUrls) => {
    try {
      const newPhotos = [...stepPhotos, ...selectedPhotoUrls];
      await onPhotosAssigned(newPhotos);
    } catch (error) {
      console.error('Error assigning photos to step:', error);
    }
  };

  // Handle removing photo from step
  const handleRemovePhoto = async (photoUrl) => {
    try {
      const updatedPhotos = stepPhotos.filter(url => url !== photoUrl);
      await onPhotosAssigned(updatedPhotos);
    } catch (error) {
      console.error('Error removing photo from step:', error);
    }
  };

  const canAddMore = stepPhotos.length < maxPhotos && availablePhotos.length > 0;

  return (
    <>
      <div className={`space-y-3 ${className}`}>

        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
            <Camera size={14} className="mr-1" />
            Step Photos ({stepPhotos.length})
          </h4>

          {canAddMore && (
            <button
              onClick={handleAddPhotos}
              className="btn-tertiary btn-sm"
            >
              <Plus size={12} />
              Add Photos
            </button>
          )}
        </div>

        {/* Photos Display */}
        {stepPhotos.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <Camera className="mx-auto mb-2 text-gray-400" size={24} />
            <p className="text-sm">No photos assigned to this step</p>
            {availablePhotos.length > 0 ? (
              <button
                onClick={handleAddPhotos}
                className="btn-tertiary btn-sm mt-2"
              >
                <Plus size={12} />
                Add Photos from Gallery
              </button>
            ) : (
              <p className="text-xs mt-1">Add photos to main gallery first</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {stepPhotos.map((photoUrl, index) => (
              <div
                key={photoUrl}
                className="relative aspect-square rounded-lg overflow-hidden group"
              >
                <img
                  src={photoUrl}
                  alt={`Step photo ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">

                    {/* View in Gallery Button */}
                    <button
                      onClick={() => {
                        // You could implement a lightbox or navigate to main gallery
                        window.open(photoUrl, '_blank');
                      }}
                      className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                      title="View full size"
                    >
                      <ExternalLink size={14} className="text-gray-700" />
                    </button>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemovePhoto(photoUrl)}
                      className="p-2 bg-red-500 bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                      title="Remove from step"
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                </div>

                {/* Photo Number */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add More Photos Button */}
        {stepPhotos.length > 0 && canAddMore && (
          <button
            onClick={handleAddPhotos}
            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Plus size={20} className="mx-auto mb-2" />
            <div className="text-sm">Add More Photos</div>
            <div className="text-xs opacity-75">
              {maxPhotos - stepPhotos.length} remaining for this step
            </div>
          </button>
        )}
      </div>

      {/* Photo Selector Modal */}
      <PhotoSelector
        isOpen={showPhotoSelector}
        onClose={() => setShowPhotoSelector(false)}
        availablePhotos={availablePhotos}
        selectedPhotos={[]}
        onPhotosSelected={handlePhotosSelected}
        title="Add Photos to Step"
        maxSelection={Math.min(maxPhotos - stepPhotos.length)}
        allowMultiple={true}
      />
    </>
  );
};

export default StepPhotoAssignment;