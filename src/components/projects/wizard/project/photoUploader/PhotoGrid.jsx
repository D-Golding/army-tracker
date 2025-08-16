// components/projects/wizard/project/photoUploader/PhotoGrid.jsx
import React from 'react';
import { Plus } from 'lucide-react';
import PhotoCard from './PhotoCard';

const PhotoGrid = ({
  files,
  onFileRemoved,
  onUploadMore,
  canAddPhotos,
  remainingSlots,
  isLoading
}) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Photo Grid */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Selected Photos ({files.length})
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((file) => (
            <PhotoCard
              key={file.id}
              file={file}
              onRemove={onFileRemoved}
              disabled={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Upload More Button - Centered below the grid */}
      <div className="text-center pt-4">
        <button
          onClick={onUploadMore}
          disabled={!canAddPhotos || remainingSlots <= 0 || isLoading}
          className={`btn-primary btn-md ${
            remainingSlots <= 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Plus size={16} />
          Upload More Photos
        </button>
      </div>

      <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You can always add photos to your project later
        </p>
      </div>
    </div>
  );
};

export default PhotoGrid;