// components/projects/wizard/project/photoUploader/detailsStep/PhotoDetailsCard.jsx
import React from 'react';

const PhotoDetailsCard = ({
  file,
  onMetadataChange,
  disabled = false
}) => {
  const previewUrl = file.editData?.croppedPreviewUrl || file.previewUrl;

  const handleFieldChange = (field, value) => {
    onMetadataChange(file.id, { [field]: value });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <div className="flex gap-4">
        {/* Photo Thumbnail */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <img
              src={previewUrl}
              alt={file.fileName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Processing status indicator */}
          {file.editData?.isProcessed && (
            <div className="mt-1 flex items-center justify-center">
              {file.editData.skipEditing ? (
                <div className="bg-gray-500 text-white text-xs px-2 py-1 rounded-lg">
                  Original
                </div>
              ) : file.editData.croppedBlob ? (
                <div className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-lg">
                  Cropped
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Photo Details Form */}
        <div className="flex-1 space-y-3">
          {/* Photo Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Photo Title
            </label>
            <input
              type="text"
              value={file.metadata?.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="form-input text-sm"
              placeholder="e.g., Front view, Detail shot, Work in progress"
              disabled={disabled}
            />
          </div>

          {/* Photo Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={file.metadata?.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              className="form-textarea text-sm"
              placeholder="Add details about this photo..."
              rows="2"
              disabled={disabled}
            />
          </div>

          {/* Original filename reference */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Original: {file.fileName}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetailsCard;