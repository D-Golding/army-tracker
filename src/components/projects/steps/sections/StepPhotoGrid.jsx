// components/projects/steps/sections/StepPhotoGrid.jsx
import React from 'react';
import { ExternalLink, X } from 'lucide-react';

const StepPhotoGrid = ({
  photos,
  onRemovePhoto
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {photos.map((photoUrl, index) => (
        <div
          key={photoUrl}
          className="relative aspect-square rounded-lg overflow-hidden group"
        >
          <img
            src={photoUrl}
            alt={`Step photo ${index + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">

              {/* View Button */}
              <button
                onClick={() => window.open(photoUrl, '_blank')}
                className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                title="View full size"
              >
                <ExternalLink size={14} className="text-gray-700" />
              </button>

              {/* Remove Button */}
              <button
                onClick={() => onRemovePhoto(photoUrl)}
                className="p-2 bg-red-500 bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                title="Remove from step"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          </div>

          {/* Photo Number */}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            {index + 1}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StepPhotoGrid;