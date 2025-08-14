// components/shared/wizard/photoGallery/PhotoEditProgress.jsx - Progress tracking for photo editing
import React from 'react';
import { SkipForward } from 'lucide-react';

const PhotoEditProgress = ({
  processedCount,
  totalCount,
  onSkipAll,
  isLoading
}) => {
  const progressPercentage = totalCount > 0 ? (processedCount / totalCount) * 100 : 0;
  const hasUnprocessed = processedCount < totalCount;

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-900 dark:text-white">
            {processedCount}
          </span> of <span className="font-medium">{totalCount}</span> photos processed
        </div>
        {hasUnprocessed && (
          <button
            onClick={onSkipAll}
            disabled={isLoading}
            className="btn-tertiary btn-sm"
          >
            <SkipForward size={14} />
            Skip All
          </button>
        )}
      </div>

      {totalCount > 0 && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default PhotoEditProgress;