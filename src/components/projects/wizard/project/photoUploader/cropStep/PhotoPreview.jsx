// components/projects/wizard/project/photoUploader/cropStep/PhotoPreview.jsx
import React from 'react';
import { Edit, SkipForward } from 'lucide-react';

const PhotoPreview = ({
  file,
  onStartCrop,
  onSkipEditing,
  disabled = false
}) => {
  if (!file) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400">No photo selected</div>
      </div>
    );
  }

  const previewUrl = file.editData?.croppedPreviewUrl || file.previewUrl;

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600">
            <img
              src={previewUrl}
              alt={file.fileName}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={onStartCrop}
          disabled={disabled}
          className="btn-primary btn-md"
        >
          <Edit size={16} />
          Crop Photo
        </button>

        <button
          onClick={onSkipEditing}
          disabled={disabled}
          className="btn-secondary btn-md"
        >
          <SkipForward size={16} />
          Keep Original
        </button>
      </div>
    </div>
  );
};

export default PhotoPreview;