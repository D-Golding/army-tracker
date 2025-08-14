// components/projects/wizard/StepPhotosForm.jsx - Photo selection interface
import React, { useState } from 'react';
import { Camera, Plus, X } from 'lucide-react';
import PhotoSelector from '../../../shared/PhotoSelector';

const StepPhotosForm = ({
  formData,
  projectData,
  onPhotosAdded,
  onPhotoRemoved
}) => {
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);

  const projectPhotos = projectData?.photoURLs || [];

  // Get available photos
  const availablePhotos = projectPhotos.filter(photoUrl =>
    !formData.photos.includes(photoUrl)
  );

  const handlePhotosSelected = (selectedPhotoUrls) => {
    onPhotosAdded(selectedPhotoUrls);
    setShowPhotoSelector(false);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Camera className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Step Photos
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add photos from your project gallery to this step (optional)
          </p>
        </div>

        {/* Current Photos */}
        {formData.photos.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Selected Photos ({formData.photos.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {formData.photos.map((photoUrl, index) => (
                <div key={photoUrl} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img
                    src={photoUrl}
                    alt={`Step photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                    <button
                      onClick={() => onPhotoRemoved(photoUrl)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-500 bg-opacity-90 rounded-full hover:bg-opacity-100"
                      title="Remove photo"
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Photos */}
        {availablePhotos.length > 0 && (
          <div className="text-center">
            <button
              onClick={() => setShowPhotoSelector(true)}
              className="btn-primary btn-md"
            >
              <Plus size={16} />
              {formData.photos.length > 0 ? 'Add More Photos' : 'Add Photos'}
            </button>
          </div>
        )}

        {/* No photos available */}
        {availablePhotos.length === 0 && formData.photos.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Camera className="mx-auto mb-2 text-gray-400" size={24} />
            <p className="text-sm">No photos available</p>
            <p className="text-xs mt-1">Add photos to your project gallery first</p>
          </div>
        )}

        {/* Skip option */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You can always add photos later
          </p>
        </div>
      </div>

      {/* Photo Selector Modal */}
      <PhotoSelector
        isOpen={showPhotoSelector}
        onClose={() => setShowPhotoSelector(false)}
        availablePhotos={availablePhotos}
        selectedPhotos={[]}
        onPhotosSelected={handlePhotosSelected}
        title="Add Photos to Step"
        maxSelection={10 - formData.photos.length}
        allowMultiple={true}
      />
    </>
  );
};

export default StepPhotosForm;