// components/projects/wizard/project/photoUploader/PhotoCard.jsx
import React from 'react';
import { X } from 'lucide-react';

const PhotoCard = ({
  file,
  onRemove,
  disabled = false,
  showFileInfo = true
}) => {
  return (
    <div className="relative group">
      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
        <img
          src={file.editData?.croppedPreviewUrl || file.previewUrl}
          alt={file.fileName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Processing status indicator */}
      {file.editData?.isProcessed && (
        <div className="absolute top-2 left-2">
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

      {/* Remove button */}
      <button
        onClick={() => onRemove(file.id)}
        disabled={disabled}
        className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove photo"
      >
        <X size={12} />
      </button>

      {/* File info overlay */}
      {showFileInfo && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-xs truncate" title={file.fileName}>
            {file.fileName}
          </div>
          {file.fileSize && (
            <div className="text-xs text-gray-300">
              {(file.fileSize / 1024 / 1024).toFixed(1)} MB
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoCard;