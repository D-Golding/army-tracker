// components/projects/wizard/project/photoUploader/PhotoDropZone.jsx
import React, { useState } from 'react';

const PhotoDropZone = ({
  onFilesDropped,
  canAddPhotos,
  remainingSlots,
  isLoading,
  children
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (canAddPhotos && remainingSlots > 0 && !isLoading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (!canAddPhotos || remainingSlots <= 0 || isLoading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesDropped(files);
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl transition-all ${
        isDragOver
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
          : remainingSlots <= 0 || !canAddPhotos
            ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 rounded-xl flex items-center justify-center">
          <div className="loading-spinner-primary"></div>
        </div>
      )}
    </div>
  );
};

export default PhotoDropZone;