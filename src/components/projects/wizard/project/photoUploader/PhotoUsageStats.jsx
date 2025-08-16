// components/projects/wizard/project/photoUploader/PhotoUsageStats.jsx
import React from 'react';

const PhotoUsageStats = ({ current, max }) => {
  const remainingSlots = Math.max(0, max - current);
  const isAtLimit = remainingSlots <= 0;
  const isNearLimit = current / max > 0.8;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400 font-medium">Photo Usage</span>
        <span className={`font-bold text-lg ${
          isAtLimit ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
        }`}>
          {current} / {max}
        </span>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-indigo-500'
          }`}
          style={{ width: `${Math.min(100, (current / max) * 100)}%` }}
        />
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        {remainingSlots} photos remaining
      </div>
    </div>
  );
};

export default PhotoUsageStats;