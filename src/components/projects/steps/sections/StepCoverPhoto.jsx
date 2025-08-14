// components/projects/steps/sections/StepCoverPhoto.jsx
import React from 'react';
import { Star, Edit } from 'lucide-react';

const StepCoverPhoto = ({
  coverPhoto,
  totalPhotos,
  onChangeCoverClick
}) => {
  if (!coverPhoto) return null;

  return (
    <div className="mb-4">
      <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center">
        <Star className="mr-1 text-yellow-500" size={12} />
        Cover Photo
      </h5>

      <div className="w-1/3">
        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-yellow-200 dark:border-yellow-600">
          <img
            src={coverPhoto}
            alt="Step cover"
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => window.open(coverPhoto, '_blank')}
          />
        </div>

        {/* Change Cover Button */}
        {totalPhotos > 1 && (
          <button
            onClick={onChangeCoverClick}
            className="mt-2 w-full btn-tertiary btn-sm flex items-center justify-center gap-1"
          >
            <Edit size={12} />
            Change
          </button>
        )}
      </div>
    </div>
  );
};

export default StepCoverPhoto;