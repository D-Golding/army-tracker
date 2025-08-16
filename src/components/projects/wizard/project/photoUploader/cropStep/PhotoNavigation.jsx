// components/projects/wizard/project/photoUploader/cropStep/PhotoNavigation.jsx
import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const PhotoNavigation = ({
  currentIndex,
  totalFiles,
  onPrevious,
  onNext,
  disabled = false
}) => {
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < totalFiles - 1;

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious || disabled}
        className="btn-secondary btn-sm"
      >
        <ArrowLeft size={14} />
        Previous
      </button>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        {currentIndex + 1} of {totalFiles}
      </div>

      <button
        onClick={onNext}
        disabled={!canGoNext || disabled}
        className="btn-secondary btn-sm"
      >
        Next
        <ArrowRight size={14} />
      </button>
    </div>
  );
};

export default PhotoNavigation;