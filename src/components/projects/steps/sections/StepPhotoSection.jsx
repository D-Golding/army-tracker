// components/projects/steps/sections/StepPhotoSection.jsx
import React, { useState } from 'react';
import { Camera, Plus } from 'lucide-react';
import PhotoSelector from '../../../shared/PhotoSelector';
import StepPhotoGrid from './StepPhotoGrid';

const StepPhotoSection = ({
  step,
  projectData,
  onPhotosAssigned,
  maxPhotos = 10
}) => {
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

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
      setShowPhotoSelector(false);
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

  // Get photos to display (show 3 initially, all when expanded)
  const displayPhotos = showAllPhotos ? stepPhotos : stepPhotos.slice(0, 3);
  const hasMorePhotos = stepPhotos.length > 3;

  return (
    <>
      <div className="space-y-3">

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

        {/* Collapsible Toggle */}
        {stepPhotos.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colours"
          >
            {isExpanded ? (
              <>
                Hide Photos
                <span className="ml-2 text-lg">-</span>
              </>
            ) : (
              <>
                Show Photos ({stepPhotos.length})
                <span className="ml-2 text-lg">+</span>
              </>
            )}
          </button>
        )}

        {/* Photos Display */}
        {stepPhotos.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <Camera className="mx-auto mb-2 text-gray-400" size={24} />
            <p className="text-sm">No photos assigned to this step</p>
            {availablePhotos.length === 0 && (
              <p className="text-xs mt-1">Add photos to main gallery first</p>
            )}
          </div>
        ) : isExpanded ? (
          <>
            {/* Photo Grid */}
            <StepPhotoGrid
              photos={displayPhotos}
              onRemovePhoto={handleRemovePhoto}
              showSetCoverButton={false}
            />

            {/* See All / Show Less Button */}
            {hasMorePhotos && (
              <button
                onClick={() => setShowAllPhotos(!showAllPhotos)}
                className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colours flex items-center justify-center gap-2"
              >
                {showAllPhotos ? (
                  <>Show Less</>
                ) : (
                  <>See All ({stepPhotos.length - 3} more)</>
                )}
              </button>
            )}
          </>
        ) : null}

        {/* Add More Photos Button */}
        {stepPhotos.length > 0 && canAddMore && isExpanded && (
          <button
            onClick={handleAddPhotos}
            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colours"
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

export default StepPhotoSection;