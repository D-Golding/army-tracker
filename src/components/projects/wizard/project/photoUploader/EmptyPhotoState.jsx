// components/projects/wizard/project/photoUploader/EmptyPhotoState.jsx
import React from 'react';
import { Upload, Plus } from 'lucide-react';

const EmptyPhotoState = ({
  onChooseFiles,
  onTakePhoto,
  canAddPhotos,
  remainingSlots,
  isLoading
}) => {
  return (
    <div className="text-center space-y-8 py-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bring your project to life
        </h2>
      </div>

      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto">
        <Upload className="w-8 h-8 text-gray-400" />
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Upload your photos
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Drag and drop files here, or click to browse
        </p>
      </div>

      {/* Single Action Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onChooseFiles}
          disabled={!canAddPhotos || remainingSlots <= 0 || isLoading}
          className="btn-primary btn-lg"
        >
          <Plus size={20} />
          Add Photos
        </button>
      </div>

      {/* File Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>Supports: JPEG, PNG, WebP, HEIC</p>
        <p>Maximum file size: 20MB</p>
        {remainingSlots > 0 ? (
          <p>Up to {remainingSlots} more photos</p>
        ) : (
          <p className="text-amber-600 dark:text-amber-400 font-medium">
            Photo limit reached
          </p>
        )}
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You can always add photos to your project later
        </p>
      </div>
    </div>
  );
};

export default EmptyPhotoState;