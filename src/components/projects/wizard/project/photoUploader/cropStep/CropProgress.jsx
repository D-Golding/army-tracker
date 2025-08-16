// components/projects/wizard/project/photoUploader/cropStep/CropProgress.jsx
import React from 'react';

const CropProgress = ({
  currentIndex,
  totalFiles,
  processedCount,
  unprocessedCount
}) => {
  const progressPercentage = totalFiles > 0 ? (processedCount / totalFiles) * 100 : 0;

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          Photo {currentIndex + 1} of {totalFiles}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {processedCount} processed, {unprocessedCount} remaining
        </span>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default CropProgress;