// components/shared/wizard/photoGallery/PhotoPreviewGrid.jsx - Remove data usage display
import React from 'react';
import { Plus, X, AlertCircle } from 'lucide-react';
import { useSubscription } from '../../../../hooks/useSubscription.js';

const PhotoPreviewGrid = ({
  selectedFiles,
  onFileRemoved,
  triggerFileInput,
  remainingSlots,
  isLoading,
  projectData,
  errors = {}
}) => {
  const { canPerformAction } = useSubscription();
  const canAddPhotos = canPerformAction('add_photo', 1, projectData);

  // Don't render if no files selected
  if (selectedFiles.length === 0) {
    return (
      <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>📸 Photos help showcase your project progress</p>
          <p>🎨 Next step: crop and edit your photos (optional)</p>
          <p>🏷️ Add labels and descriptions to organize your gallery</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Add More button */}
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Selected Photos ({selectedFiles.length})
        </h4>
        {remainingSlots > 0 && canAddPhotos && (
          <button
            onClick={triggerFileInput}
            disabled={isLoading}
            className="btn-tertiary btn-sm"
          >
            <Plus size={14} />
            Add More
          </button>
        )}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {selectedFiles.map((file) => (
          <PhotoPreviewCard
            key={file.id}
            file={file}
            onRemove={() => onFileRemoved(file.id)}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Summary Info - removed data usage */}
      <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3">
        <div className="text-sm text-indigo-800 dark:text-indigo-300">
          <div className="font-medium mb-1">Ready to proceed</div>
          <div>
            {selectedFiles.length} photo{selectedFiles.length !== 1 ? 's' : ''} selected
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {errors.files && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-red-800 dark:text-red-300 text-sm">
              {errors.files}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Individual photo preview card component - removed file size display
const PhotoPreviewCard = ({ file, onRemove, isLoading }) => {
  return (
    <div className="relative group">
      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
        <img
          src={file.previewUrl}
          alt={file.fileName}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Remove button */}
        <button
          onClick={onRemove}
          disabled={isLoading}
          className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove photo"
        >
          <X size={12} />
        </button>

        {/* File info overlay - removed file size */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-xs truncate" title={file.fileName}>
            {file.fileName}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoPreviewGrid;